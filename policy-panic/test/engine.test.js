import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';

const setup = (o = {}) => E.newGame({ name: 'Ada', region: 'marina', origin: 'organiser', ideology: 'welfare', seed: 7, ...o });
const decide = (s, i) => { const r = E.choose(s, { event: s.pending.id }, i); assert.ok(!r.error, r.error); return r; };
const skipToEvent = (s, id) => { // fast-forward with a no-op until the given event is pending (for targeted tests)
  s = structuredClone(s); s.pending = { kind: 'decision', id }; return s;
};

test('new game is valid and starts with an origin intro event', () => {
  for (const origin of Object.keys(E.ORIGINS)) {
    const s = setup({ origin });
    assert.ok(E.validateState(s));
    assert.equal(s.pending.id, 'intro_' + origin);
    assert.ok(E.decisionView(s, { event: s.pending.id }).choices.length >= 3);
  }
  assert.throws(() => E.newGame({ origin: 'nope', region: 'marina', ideology: 'welfare' }));
});

test('a choice changes real state and the report is derived from the diff', () => {
  const s = setup();
  const r = decide(s, 0);
  assert.ok(r.state.me.support > s.me.support);
  assert.ok(r.report.confirmed.some(x => x.key === 'support' && x.d > 0));
  assert.equal(r.state.pending, null);
  assert.equal(s.me.support, setup().me.support, 'input state is not mutated');
});

test('invalid actions are rejected safely', () => {
  const s = setup();
  assert.ok(E.choose(s, { event: 'transformer' }, 0).error, 'not pending');
  assert.ok(E.choose(s, { event: s.pending.id }, 99).error);
  assert.ok(E.choose(s, { event: s.pending.id }, -1).error);
  assert.ok(E.choose(s, { move: 'nope' }, 0).error);
  assert.ok(E.endQuarter(s).error, 'cannot end quarter with a pending decision');
  assert.ok(E.holdElection(s, {}).error);
});

test('costs are checked: cannot spend money you do not have', () => {
  let s = setup(); s = decide(s, 0).state;
  s.me.wealth = 10;
  const v = E.decisionView(s, { move: 'train' });
  assert.ok(v.choices.every(c => c.reason));
  assert.ok(E.choose(s, { move: 'train' }, 0).error);
  assert.equal(s.me.wealth, 10);
});

test('moves are limited to two per quarter and reset when time advances', () => {
  let s = decide(setup(), 0).state;
  s = E.choose(s, { move: 'visit' }, 0).state;
  s = E.choose(s, { move: 'visit' }, 1).state;
  assert.equal(s.movesLeft, 0);
  assert.ok(E.choose(s, { move: 'visit' }, 0).error);
  const q = E.endQuarter(s);
  assert.equal(q.state.q, 1);
  assert.equal(q.state.movesLeft, E.MOVES_PER_Q);
});

test('the four money pools stay separate and never go negative', () => {
  let s = decide(setup(), 0).state;
  s.me.wealth = 0;
  const r = E.endQuarter(s).state;
  assert.ok(r.me.wealth >= 0 && r.me.funds >= 0 && r.office.budget >= 0);
  const f = E.choose(r, { move: 'fundraise' }, 0).state;
  assert.ok(f.me.funds > r.me.funds);
  assert.equal(f.me.wealth, r.me.wealth, 'campaign funds do not touch personal wealth');
});

test('delayed consequence: approving the extra payment brings the road collapse', () => {
  let s = setup(); s.office.role = 2; s.office.budget = 10e6; s.pending = null;
  s = skipToEvent(s, 'contractor');
  const r = decide(s, 0);
  assert.ok(r.state.queue.some(e => e.id === 'road_collapse'));
  assert.ok(r.report.uncertain.length > 0, 'flagged as uncertain, not confirmed');
  assert.ok(r.state.office.budget < s.office.budget);
  let t = r.state, seen = false, transportBefore;
  for (let i = 0; i < 6 && !seen; i++) {
    t = E.endQuarter(t).state;
    if (t.pending?.id === 'road_collapse') { seen = true; break; }
    if (t.pending?.kind === 'decision') t = E.choose(t, { event: t.pending.id }, 0).state ?? t;
    if (t.pending) t.pending = null;
  }
  assert.ok(seen, 'road_collapse appears after the delay');
});

test('delayed consequence: big promise is checked against real jobs figures', () => {
  let s = setup(); s.pending = null; s = skipToEvent(s, 'townhall');
  const r = decide(s, 3);
  assert.ok(r.state.queue.some(e => e.id === 'promise_due'));
  const bad = structuredClone(r.state); bad.local.jobs = 20; bad.queue[0].due = bad.q + 1; bad.pending = null;
  const good = structuredClone(r.state); good.local.jobs = 80; good.queue[0].due = good.q + 1; good.pending = null;
  const a = E.endQuarter(bad), b = E.endQuarter(good);
  assert.ok(b.state.me.support > a.state.me.support, 'delivering jobs beats breaking the promise');
});

test('local and national conditions change from decisions', () => {
  let s = decide(setup(), 0).state;
  const p = skipToEvent(s, 'clinic'); p.office.role = 2; p.office.budget = 10e6;
  const r = decide(p, 0);
  assert.ok(r.state.local.health > p.local.health + 10);
  assert.ok(r.state.nation.inst > p.nation.inst);
});

test('same state + same choice = same result (seeded RNG)', () => {
  const s = skipToEvent(setup(), 'leak');
  const a = decide(s, 0), b = decide(s, 0);
  assert.deepEqual(a.state, b.state);
});

test('exposure can draw a probe; probe leads to a court date', () => {
  let s = decide(setup(), 0).state; s.me.exposure = 90; s.nation.inst = 80;
  let found = false;
  for (let i = 0; i < 12 && !found; i++) { const r = E.endQuarter(s); s = r.state; if (s.pending?.id === 'probe') found = true; else s.pending = null; }
  assert.ok(found, 'a probe is triggered by high exposure');
  s.me.wealth = 5e6;
  const r = decide(s, 1); // hire lawyer
  assert.ok(r.state.queue.some(e => e.id === 'court'));
});

test('election: eligibility, ticket gate, campaign spending and result use game state', () => {
  let s = decide(setup(), 0).state;
  s.q = s.election.nextQ - 1;
  s = E.endQuarter(s).state;
  assert.deepEqual(s.pending, { kind: 'election', stage: 'call' });
  const races = E.eligibleRaces(s);
  assert.deepEqual(races.map(r => r.name), ['Ward Councillor']);
  assert.ok(E.enterRace(s, 5).error, 'cannot jump to governor');

  const strong = structuredClone(s); strong.me.loyalty = 90; strong.me.support = 85; strong.me.funds = 3e6; strong.me.rep = 80; strong.rel.patron.t = 50;
  const e = E.enterRace(strong, 2).state;
  assert.equal(e.pending.stage, 'campaign');
  assert.ok(E.holdElection(e, { media: 99e9 }).error, 'cannot overspend');
  assert.ok(E.holdElection(e, { media: -5 }).error);
  const w = E.holdElection(e, { media: 1e6, agents: 1e6 });
  assert.ok(w.report.win);
  assert.equal(w.state.office.role, 2);
  assert.equal(w.state.me.funds, 1e6);
  assert.equal(w.state.election.nextQ, 8 + E.ELECTION_CYCLE);

  const weak = structuredClone(s); weak.me.loyalty = 0; weak.me.influence = 0; weak.rel.chair.t = 0; weak.rel.patron.t = 0;
  const d = E.enterRace(weak, 2).state;
  assert.equal(d.pending.stage, 'denied');
  const ind = E.ticketDenied(d, 'independent').state;
  assert.equal(ind.election.ticket, 'independent');
});

test('losing an incumbent seat sends you to the wilderness with a way back', () => {
  let s = decide(setup(), 0).state;
  s.office.role = 2; s.office.budget = 3e6; s.me.support = 5; s.me.rep = 5; s.me.exposure = 80; s.me.loyalty = 70; s.me.funds = 0;
  s.pending = { kind: 'election', stage: 'call' };
  const e = E.enterRace(s, 2).state;
  const r = E.holdElection(e, {});
  assert.ok(!r.report.win);
  assert.equal(r.state.office.role, 0);
  assert.equal(r.state.flags.formerRole, 2);
  assert.ok(r.state.queue.some(q => q.id === 'after_defeat'));
  assert.ok(E.eligibleRaces({ ...r.state, pending: null }).some(x => x.role === 2), 'can contest the seat again');
});

test('save validation rejects corrupt data', () => {
  const s = setup();
  assert.ok(E.validateState(JSON.parse(JSON.stringify(s))));
  const bad = JSON.parse(JSON.stringify(s)); bad.me.wealth = 'lots';
  assert.ok(!E.validateState(bad));
  assert.ok(!E.validateState(null));
  assert.ok(!E.validateState({ v: 99 }));
});

test('a full bot playthrough keeps state valid for 40 quarters', () => {
  let s = setup({ origin: 'dynasty', seed: 3 }), n = 0;
  while (s.status === 'playing' && s.q < 40 && n++ < 3000) {
    if (s.pending?.kind === 'decision') { const v = E.decisionView(s, { event: s.pending.id }); s = E.choose(s, { event: s.pending.id }, v.choices.find(c => !c.reason).i).state; }
    else if (s.pending?.kind === 'election') {
      let r;
      if (s.pending.stage === 'call') { const rs = E.eligibleRaces(s).filter(x => x.ok); r = rs.length ? E.enterRace(s, rs[0].role) : E.sitOut(s); }
      else if (s.pending.stage === 'denied') r = E.ticketDenied(s, 'independent');
      else r = E.holdElection(s, { media: s.me.funds / 2 });
      s = r.state;
    } else { const r = E.endQuarter(s); s = r.state; }
    assert.ok(E.validateState(s));
    for (const k of ['support', 'rep', 'exposure', 'loyalty', 'influence']) assert.ok(s.me[k] >= 0 && s.me[k] <= 100, k);
  }
  assert.ok(s.q >= 36);
});
