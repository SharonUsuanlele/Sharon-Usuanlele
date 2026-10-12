import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';

const setup = (o = {}) => E.newGame({ name: 'Ada', region: 'creeks', origin: 'organiser', ideology: 'welfare', seed: 11, ...o });
const at = (s, id) => { s = structuredClone(s); s.pending = { kind: 'decision', id }; return s; };
const pick = (s, i) => { const r = E.choose(s, { event: s.pending.id }, i); assert.ok(!r.error, r.error); return r; };
const avg = o => E.SERVICES.reduce((t, k) => t + o[k], 0) / E.SERVICES.length;

test('oil deal: approving fast brings money now and pollution later', () => {
  const s = at(setup(), 'oil_deal');
  const r = pick(s, 0);
  assert.ok(r.state.nation.resinc > s.nation.resinc);
  assert.ok(r.state.local.env < s.local.env);
  assert.ok(r.state.flags.oilLive && r.state.flags.oilNoConsult);
  assert.ok(r.state.queue.some(e => e.id === 'oil_spill') && r.state.queue.some(e => e.id === 'oil_revenue'));
  assert.ok(r.report.uncertain.length >= 2, 'later effects are flagged as uncertain, not confirmed');
});

test('oil deal: delaying for consultation builds trust but costs the money, and the company returns', () => {
  const s = at(setup(), 'oil_deal');
  const r = pick(s, 2);
  assert.ok(r.state.me.support > s.me.support);
  assert.equal(r.state.nation.resinc, s.nation.resinc);
  assert.ok(r.state.flags.consulted && r.state.queue.some(e => e.id === 'oil_return'));
});

test('oil deal: renegotiation depends on skill and institutions', () => {
  const weak = at(setup(), 'oil_deal'); weak.nation.inst = 5; weak.nation.foreign = 90; weak.nation.gov = 10; weak.me.skills.fin = 0;
  const strong = at(setup(), 'oil_deal'); strong.nation.inst = 90; strong.nation.foreign = 10; strong.nation.gov = 80; strong.me.skills.fin = 10;
  let w = 0, g = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const a = structuredClone(weak), b = structuredClone(strong); a.seed = b.seed = seed;
    if (pick(a, 1).state.flags.oilSafeguards) w++;
    if (pick(b, 1).state.flags.oilSafeguards) g++;
  }
  assert.ok(g > w + 20, `strong ${g} vs weak ${w}`);
});

test('spill text depends on earlier choices and cleanup options respect money', () => {
  let s = at(setup(), 'oil_spill');
  assert.match(E.decisionView(s, { event: 'oil_spill' }).body, /no clean-up plan/);
  s.flags.oilSafeguards = true;
  assert.match(E.decisionView(s, { event: 'oil_spill' }).body, /safeguards/);
  const cover = pick(s, 2).state;
  assert.ok(cover.flags.coverup && cover.me.rep < s.me.rep);
});

test('a rich government does not mean better lives: resource money rises while people do not improve', () => {
  let s = setup(); s.pending = null;
  s.nation.resinc = 85; s.nation.inst = 20; s.nation.debt = 40; s.nation.foreign = 40;
  const gov0 = s.nation.gov, trust0 = s.nation.trust, people0 = avg(s.nation);
  for (let i = 0; i < 12; i++) { s = E.endQuarter(s).state; s.pending = null; }
  assert.ok(s.nation.gov > gov0 + 5, 'treasury grows');
  assert.ok(s.nation.trust < trust0, 'trust falls because people see no change');
  assert.ok(avg(s.nation) <= people0 + 2, 'living conditions do not follow');
  assert.ok(s.log.some(n => /no better|revenue is up/i.test(n.text)), 'the press notices');
  s.nation.gov = 70; s.nation.food = 30; s.nation.power = 30; s.nation.jobs = 30; s.nation.health = 30; s.nation.edu = 30; s.nation.transport = 30; s.nation.land = 30; s.nation.env = 30;
  assert.match(E.wealthGap(s).verdict, /flush|earns/);
});

test('government money sets the size of public budgets', () => {
  const mk = gov => { let s = setup(); s.pending = null; s.office.role = 3; s.office.budget = 0; s.nation.gov = gov; s.nation.resinc = 30; s.nation.debt = 45; s.nation.foreign = 45; return E.endQuarter(s).state.office.budget; };
  assert.ok(mk(90) > mk(10) * 1.4);
});

test('pollution hurts health and food, and the cause is recorded', () => {
  let s = setup(); s.pending = null; s.local.env = 20; s.local.health = 60; s.local.food = 60;
  for (let i = 0; i < 6; i++) { s = E.endQuarter(s).state; s.pending = null; }
  assert.ok(s.local.health < 56 && s.local.food < 57);
  const info = E.indicatorInfo(s, 'local', 'health');
  assert.ok(info.history.some(h => /Pollution/.test(h.cause)), 'tapping an indicator explains why it moved');
  assert.ok(info.what && info.matters);
});

test('land: the law and the people involved shape the outcome; labels fit the role', () => {
  const s = at(setup({ region: 'plains' }), 'land_eviction'); // weak customary title
  const v0 = E.decisionView(s, { event: 'land_eviction' });
  assert.match(v0.choices[0].label, /Advise families/);
  const gov = structuredClone(s); gov.office.role = 2; gov.office.budget = 5e6;
  assert.match(E.decisionView(gov, { event: 'land_eviction' }).choices[0].label, /Approve the eviction/);
  const ev = pick(gov, 0).state;
  assert.ok(ev.flags.evicted && ev.local.land < gov.local.land - 8 && ev.queue.some(e => e.id === 'land_court'));
  // title strength changes court outcomes
  const court = (region) => { let wins = 0; for (let seed = 1; seed <= 80; seed++) { const c = at(setup({ region, seed }), 'land_court'); c.nation.inst = 45; if (pick(c, 1).report.rolled.hit) wins++; } return wins; };
  assert.ok(court('plains') > court('marina') + 10, 'weaker land title favours the developer more often');
});

test('land: a hearing is decided by the region\'s legal protection', () => {
  const s = at(setup({ region: 'marina' }), 'land_eviction'); s.office.role = 2; s.office.budget = 5e6;
  const r = pick(s, 2);
  assert.ok(r.state.queue.some(e => e.id === 'hearing_result'));
  const strong = structuredClone(r.state); strong.queue[0].due = strong.q + 1; strong.pending = null;
  const weak = structuredClone(strong); weak.player.region = 'plains';
  assert.ok(E.endQuarter(strong).state.local.land > E.endQuarter(weak).state.local.land);
});

test('foreign loan: quick money, delayed repayment squeeze', () => {
  const s = at(setup(), 'foreign_loan'); s.office.role = 4; s.office.budget = 5e6;
  const r = pick(s, 0);
  assert.ok(r.state.nation.debt > s.nation.debt + 5 && r.state.nation.foreign > s.nation.foreign + 4 && r.state.nation.gov > s.nation.gov + 5);
  assert.ok(r.state.queue.some(e => e.id === 'debt_squeeze'));
  const later = structuredClone(r.state); later.pending = null; later.queue = later.queue.filter(e => e.id === 'debt_squeeze').map(e => ({ ...e, due: later.q + 1 }));
  const after = E.endQuarter(later);
  assert.ok(after.report.autos.some(a => /repayments/i.test(a)));
});

test('donor money creates an obligation that comes back as a decision', () => {
  const s = at(setup(), 'donor_favour');
  const r = pick(s, 0);
  assert.ok(r.state.me.funds > s.me.funds && r.state.rel.donor.o >= 35 && r.state.me.exposure > s.me.exposure);
  assert.ok(r.state.queue.some(e => e.id === 'donor_calls'));
  const refuse = pick(s, 2).state;
  assert.equal(refuse.me.funds, s.me.funds);
  assert.ok(refuse.me.rep > s.me.rep);
});

test('earlier decisions come back through the press', () => {
  const s = setup(); s.pending = null; s.flags.oilNoConsult = true;
  const e = at(s, 'journalist_contract');
  assert.match(E.decisionView(e, { event: 'journalist_contract' }).body, /without asking residents/);
  assert.ok(E.EVENTS.journalist_contract.weight(s) >= 5);
  const clean = setup(); assert.ok(E.EVENTS.journalist_contract.weight(clean) === 0);
});

test('elections remember land, environment and cost of living', () => {
  const base = setup(); base.pending = { kind: 'election', stage: 'campaign' }; base.election.target = 2; base.election.ticket = 'party';
  const bad = structuredClone(base); bad.flags.evicted = true; bad.local.food = 15; bad.local.env = 15; bad.nation.stab = 20;
  const good = structuredClone(base); good.flags.consulted = true; good.local.food = 80; good.local.env = 80; good.nation.stab = 70;
  const a = E.campaignPreview(bad, {}), b = E.campaignPreview(good, {});
  assert.ok(b.you > a.you + 8);
  for (const k of ['Cost of living', 'Land & environment', 'Unrest']) assert.ok(a.factors.some(f => f.label === k));
});

test('the career ladder reaches President (age 40+) from Governor', () => {
  assert.equal(E.ROLES.at(-1).name, 'President');
  const s = setup(); s.office.role = 5; s.player.age = 41; s.pending = { kind: 'election', stage: 'call' };
  const races = E.eligibleRaces(s);
  assert.ok(races.find(r => r.name === 'President' && r.ok));
  s.player.age = 38; assert.equal(E.eligibleRaces(s).find(r => r.name === 'President').ok, false);
});

test('play style reflects how you built your career', () => {
  const s = setup();
  s.rel.patron.o = 80; s.rel.chair.o = 50; assert.equal(E.playStyle(s).name, 'Patronage builder');
  const c = setup(); c.me.rep = 80; c.me.exposure = 0; assert.equal(E.playStyle(c).name, 'Public servant');
});
