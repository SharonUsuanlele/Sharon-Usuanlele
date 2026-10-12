// Policy Panic rules engine. Pure functions: (state, input) -> { state, report } | { error }.
// No DOM. The UI never computes consequences; it only renders what this module returns.
import { ROLES, REGIONS, ORIGINS, IDEOLOGIES, EVENTS, OUTCOMES, MOVES, SERVICES, IND, N, CAST, PARTIES } from './content.js';

export const SAVE_VERSION = 1;
export const ELECTION_CYCLE = 16;
export const FIRST_ELECTION = 8;
export const MOVES_PER_Q = 2;
const REL_IDS = Object.keys(CAST);
const REL_DEFAULT = { family: 30, rival: -10 };
const NATION_START = { power: 40, jobs: 38, health: 42, edu: 46, transport: 36, debt: 45, trust: 42, inst: 45 };
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const avg = o => SERVICES.reduce((t, k) => t + o[k], 0) / SERVICES.length;

export const when = q => `Q${(q % 4) + 1} ${2027 + Math.floor(q / 4)}`;

// Seeded RNG (mulberry32). The seed lives in the save, so the same state always gives the same roll.
export function rand(s) {
  s.seed = (s.seed + 0x6D2B79F5) | 0;
  let t = Math.imul(s.seed ^ (s.seed >>> 15), 1 | s.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------------------
// New game and validation
// ---------------------------------------------------------------------------------------
export function newGame(o) {
  const org = ORIGINS[o.origin], reg = REGIONS[o.region];
  if (!org || !reg || !IDEOLOGIES[o.ideology]) throw new Error('Invalid game setup');
  const s = {
    v: SAVE_VERSION, seed: (o.seed ?? Date.now()) | 0, q: 0,
    player: { name: String(o.name || '').trim().slice(0, 24) || 'Aspirant', look: o.look || { skin: 2, hair: 0, outfit: 0 }, region: o.region, origin: o.origin, ideology: o.ideology, age: org.age, party: 'HUP' },
    me: { wealth: org.wealth, funds: 0, ...org.me, skills: { ...org.skills } },
    office: { role: 0, since: 0, termEnd: null, budget: 0 },
    rel: {}, debts: [], flags: {}, queue: [],
    local: { ...reg.local }, nation: { ...NATION_START },
    election: { nextQ: FIRST_ELECTION, target: null, ticket: null, last: null },
    pending: { kind: 'decision', id: 'intro_' + o.origin },
    movesLeft: MOVES_PER_Q, seen: {}, log: [], why: [], ledger: [], story: null,
    stats: { peak: 0, wins: 0, losses: 0 }, status: 'playing', ending: null,
  };
  for (const id of REL_IDS) s.rel[id] = { t: org.rel[id] ?? REL_DEFAULT[id] ?? 0, o: org.obl?.[id] ?? 0 };
  s.story = `${org.name} in ${reg.ward}. The general election is ${FIRST_ELECTION} quarters away.`;
  note(s, 'official', `{name} steps into politics in {ward}.`);
  return s;
}

export function validateState(x) {
  try {
    const num = (...v) => v.every(Number.isFinite);
    return !!x && x.v === SAVE_VERSION && num(x.seed, x.q, x.movesLeft) &&
      REGIONS[x.player.region] && ORIGINS[x.player.origin] && IDEOLOGIES[x.player.ideology] &&
      num(x.me.wealth, x.me.funds, x.me.influence, x.me.loyalty, x.me.support, x.me.rep, x.me.exposure) &&
      Number.isInteger(x.office.role) && ROLES[x.office.role] && num(x.office.budget) &&
      REL_IDS.every(id => x.rel[id] && num(x.rel[id].t, x.rel[id].o)) &&
      SERVICES.every(k => num(x.local[k])) && Object.keys(NATION_START).every(k => num(x.nation[k])) &&
      Array.isArray(x.queue) && Array.isArray(x.debts) && Array.isArray(x.log) && num(x.election.nextQ);
  } catch { return false; }
}

// ---------------------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------------------
const fmt = (s, str) => str.replace('{name}', s.player.name).replace('{ward}', REGIONS[s.player.region].ward);
function note(s, src, text, rumor = false) {
  s.nlog = (s.nlog || 0) + 1;
  s.log.unshift({ q: s.q, src, text: fmt(s, text), rumor });
  if (s.log.length > 40) s.log.length = 40;
}
const val = (v, s) => typeof v === 'function' ? v(s) : v;

function why(s, scope, key, d, cause) {
  if (Math.abs(d) < 1) return;
  s.why.unshift({ q: s.q, scope, key, d: Math.round(d), cause });
  if (s.why.length > 40) s.why.length = 40;
}

function applyFx(s, fx, ctx) {
  for (const [k, raw] of Object.entries(fx)) {
    if (k === 'local' || k === 'nation') {
      for (const [i, d] of Object.entries(raw)) {
        const v = val(d, s);
        s[k][i] = clamp(s[k][i] + v);
        why(s, k, i, v, ctx.cause);
      }
      continue;
    }
    const v = val(raw, s);
    switch (k) {
      case 'wealth': case 'funds': s.me[k] = Math.max(0, Math.round(s.me[k] + v)); break;
      case 'budget': s.office.budget = Math.max(0, Math.round(s.office.budget + v)); break;
      case 'influence': case 'loyalty': case 'support': case 'rep': case 'exposure': s.me[k] = clamp(s.me[k] + v); break;
      case 'rel': for (const [id, d] of Object.entries(v)) {
        if (d.t) s.rel[id].t = clamp(s.rel[id].t + d.t, -100, 100);
        if (d.o) s.rel[id].o = clamp(s.rel[id].o + d.o, 0, 100);
      } break;
      case 'skill': for (const [id, d] of Object.entries(v)) s.me.skills[id] = clamp(s.me.skills[id] + d, 0, 10); break;
      case 'flags': for (const [id, d] of Object.entries(v)) { if (d === false) delete s.flags[id]; else s.flags[id] = d; } break;
      case 'debt': s.debts.push({ to: v.to, amount: v.amount, dueQ: s.q + v.in }); break;
      case 'news': for (const [src, text] of v) note(s, src, text); break;
      case 'after': for (const a of v) {
        s.queue.push({ due: s.q + a.in, kind: a.event ? 'event' : 'outcome', id: a.event || a.outcome });
        if (a.hint && ctx.report) ctx.report.uncertain.push(a.hint);
      } break;
      case 'role': setRole(s, v); break;
      case 'party': s.player.party = v; s.me.loyalty = 40; break;
    }
  }
}

function setRole(s, r) {
  s.office.role = r; s.office.since = s.q;
  s.office.budget = ROLES[r].budget;
  s.office.termEnd = ROLES[r].elected ? s.election.nextQ : null;
  s.stats.peak = Math.max(s.stats.peak, r);
}

// ---------------------------------------------------------------------------------------
// Snapshots and diffs: the consequence screen is derived from real state changes
// ---------------------------------------------------------------------------------------
const MONEY = new Set(['wealth', 'funds', 'budget', 'debt']);
export function snap(s) {
  const o = {
    wealth: s.me.wealth, funds: s.me.funds, budget: s.office.budget, debt: s.debts.reduce((t, d) => t + d.amount, 0),
    influence: Math.round(s.me.influence), loyalty: Math.round(s.me.loyalty), support: Math.round(s.me.support), rep: Math.round(s.me.rep), exposure: Math.round(s.me.exposure),
  };
  for (const k of SERVICES) o['local.' + k] = Math.round(s.local[k]);
  for (const k of Object.keys(NATION_START)) o['nation.' + k] = Math.round(s.nation[k]);
  for (const id of REL_IDS) { o['rel.' + id] = Math.round(s.rel[id].t); o['obl.' + id] = Math.round(s.rel[id].o); }
  return o;
}
const ROW = {
  wealth: ['Personal wealth', 'money'], funds: ['Campaign funds', 'money'], budget: ['Public budget', 'money'], debt: ['Debts owed', 'money', true],
  influence: ['Political influence', 'power'], loyalty: ['Party loyalty', 'power'], support: ['Public support', 'public'],
  rep: ['Reputation', 'you'], exposure: ['Legal exposure', 'you', true],
};
export function diff(a, b, s) {
  const ward = REGIONS[s.player.region].ward, rows = [];
  for (const k of Object.keys(b)) {
    if (a[k] === b[k]) continue;
    let label, group, bad = false;
    if (ROW[k]) [label, group, bad] = ROW[k];
    else if (k.startsWith('local.')) { label = `${IND[k.slice(6)]} (${ward})`; group = 'public'; }
    else if (k.startsWith('nation.')) { const i = k.slice(7); label = `${IND[i]} (nation)`; group = 'public'; bad = i === 'debt'; }
    else if (k.startsWith('rel.')) { label = `Trust: ${CAST[k.slice(4)].name}`; group = 'power'; }
    else { label = `Owes ${CAST[k.slice(4)].name}`; group = 'power'; bad = true; }
    const d = b[k] - a[k];
    rows.push({ key: k, label, group, from: a[k], to: b[k], d, good: bad ? d < 0 : d > 0, money: MONEY.has(k) });
  }
  return rows;
}

function meaning(a, b, s) {
  const out = [], ward = REGIONS[s.player.region].ward;
  const up = (k, t) => a[k] < t && b[k] >= t, down = (k, t) => a[k] >= t && b[k] < t;
  if (up('exposure', 40)) out.push('Investigators now have a reason to look at you.');
  if (down('exposure', 40)) out.push('The heat is dropping. For now.');
  if (up('support', 50)) out.push('More people are for you than against you.');
  if (down('support', 30)) out.push(`You are losing ${ward}.`);
  if (down('loyalty', 25)) out.push('The party is closing doors on you.');
  if (b.rep - a.rep >= 8) out.push('Your name travels well right now.');
  if (a.rep - b.rep >= 8) out.push('People are talking about you, and not kindly.');
  if (down('wealth', 100000)) out.push('You are nearly broke. Politics is expensive.');
  for (const id of REL_IDS) if (up('obl.' + id, 50)) out.push(`${CAST[id].name} will expect a favour soon.`);
  for (const k of SERVICES) if (down('local.' + k, 25)) out.push(`${IND[k]} in ${ward} is at crisis level.`);
  return out.slice(0, 3);
}

// ---------------------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------------------
const lookup = ref => ref.event ? EVENTS[ref.event] : MOVES[ref.move];
const costOf = (s, c) => typeof c.cost === 'function' ? c.cost(s) : (c.cost || {});
function blocked(s, c) {
  const r = c.req && c.req(s); if (r) return r;
  const k = costOf(s, c);
  if (k.wealth > s.me.wealth) return `Need ${N(k.wealth)} personal wealth`;
  if (k.funds > s.me.funds) return `Need ${N(k.funds)} campaign funds`;
  if (k.budget > s.office.budget) return `Need ${N(k.budget)} public budget`;
  return null;
}
const costText = (s, c) => { const k = costOf(s, c); return [k.wealth && `${N(k.wealth)} of your own money`, k.funds && `${N(k.funds)} campaign funds`, k.budget && `${N(k.budget)} public budget`].filter(Boolean).join(' + '); };

export function decisionView(s, ref) {
  const d = lookup(ref); if (!d) return null;
  return {
    ref, title: d.title, who: d.who, scene: d.scene, body: d.body(s), pressure: d.pressure || '',
    choices: d.choices.map((c, i) => ({ i, label: c.label, stakes: c.stakes || [], reason: blocked(s, c), cost: costText(s, c), risky: !!c.roll })),
  };
}

export function choose(state, ref, idx) {
  const s = structuredClone(state);
  if (s.status !== 'playing') return { error: 'The game has ended.' };
  const d = ref && lookup(ref);
  if (!d) return { error: 'Unknown decision.' };
  if (ref.event) { if (!(s.pending?.kind === 'decision' && s.pending.id === ref.event)) return { error: 'That decision is not pending.' }; }
  else if (s.movesLeft <= 0) return { error: 'No moves left this quarter.' };
  const c = Number.isInteger(idx) ? d.choices[idx] : null;
  if (!c) return { error: 'Invalid choice.' };
  const reason = blocked(s, c); if (reason) return { error: reason };

  const before = snap(s), logLen = s.nlog || 0, report = { kind: 'decision', title: d.title, choice: c.label, uncertain: [], rolled: null, notes: [] };
  const ctx = { cause: d.title, report };
  const k = costOf(s, c);
  if (k.wealth) s.me.wealth -= k.wealth;
  if (k.funds) s.me.funds -= k.funds;
  if (k.budget) s.office.budget -= k.budget;
  applyFx(s, c.fx || {}, ctx);
  let text = typeof c.text === 'function' ? c.text(s) : c.text;
  if (c.roll) {
    const p = clamp(c.roll.p(s), 0.05, 0.95), hit = rand(s) < p, side = hit ? c.roll.hit : c.roll.miss;
    applyFx(s, side.fx || {}, ctx);
    report.rolled = { hit, text: side.text };
  }
  if (c.lean) {
    const id = s.player.ideology;
    if (c.lean === id) { applyFx(s, { rep: 1, support: 1 }, ctx); report.notes.push('Consistent with your public stance.'); }
    else if (c.lean === IDEOLOGIES[id].opp) { applyFx(s, { support: -2 }, ctx); report.notes.push('This cuts against your stated principles. Some call it a flip-flop.'); }
  }
  if (ref.event) { s.pending = null; s.seen[ref.event] = s.q; } else { s.movesLeft--; s.seen['m_' + ref.move] = s.q; }
  s.story = text;
  report.text = text;
  return finish(s, before, logLen, report);
}

function finish(s, before, logLen, report) {
  const after = snap(s);
  report.confirmed = diff(before, after, s);
  report.meaning = meaning(before, after, s);
  report.news = s.log.slice(0, Math.min(s.log.length, (s.nlog || 0) - logLen));
  return { state: s, report };
}

// ---------------------------------------------------------------------------------------
// Time: end the quarter
// ---------------------------------------------------------------------------------------
const AMBIENT = [
  ['power', s => s.local.power < 30, 'chatter', '{ward} sits in the dark again. #LightUsUp trends.'],
  ['road', s => s.local.transport < 25, 'radio', 'Commuters in {ward} wade through potholes: "This road is a punishment."'],
  ['jobs', s => s.local.jobs < 30, 'ledger', 'Graduate unemployment in {ward}: "We are tired of seminars."'],
  ['hot', s => s.me.support > 65, 'radio', '{name} is the name on everyone\'s lips in {ward}.'],
  ['gone', s => s.me.support < 25, 'chatter', 'Has anyone seen {name} lately? Residents say their representative has gone quiet.'],
  ['exp', s => s.me.exposure >= 40, 'ledger', 'Questions grow over {name}\'s finances; a spokesperson insists "all is in order".', true],
  ['trust', s => s.nation.trust < 30, 'ledger', 'Public trust in government hits a record low, new poll shows.'],
  ['grid', s => s.nation.power < 30, 'radio', 'National grid collapses again. Generators sell out in Lagoon markets.'],
  ['inst', s => s.nation.inst > 60, 'ledger', 'Courts and watchdogs flex: analysts say institutions are "finally biting".'],
  ['clinic', s => s.local.health > 65, 'radio', 'Patients praise {ward} health centre: "Finally, a working fridge."'],
];

export function endQuarter(state) {
  const s = structuredClone(state);
  if (s.status !== 'playing') return { error: 'The game has ended.' };
  if (s.pending) return { error: 'Resolve the pending decision first.' };
  const before = snap(s), logLen = s.nlog || 0;
  const report = { kind: 'quarter', title: when(s.q + 1), lines: [], autos: [], uncertain: [] };
  const ctx = { cause: 'The passing quarter', report };

  s.q++;
  if (s.q % 4 === 0) s.player.age++;
  const r = ROLES[s.office.role];

  // Money: income, living costs, shortfalls become debt to the patron
  const org = ORIGINS[s.player.origin], net = org.income + r.salary - r.living;
  if (org.income) report.lines.push({ label: 'Your own income', amt: org.income });
  if (r.salary) report.lines.push({ label: 'Salary', amt: r.salary });
  report.lines.push({ label: 'Living costs & expectations', amt: -r.living });
  if (s.me.wealth + net < 0) {
    const gap = -(s.me.wealth + net);
    s.me.wealth = 0;
    s.debts.push({ to: 'Alhaji Yarima', amount: gap, dueQ: s.q + 4 });
    s.rel.patron.o = clamp(s.rel.patron.o + 8);
    report.lines.push({ label: 'Shortfall borrowed from the Alhaji', amt: gap });
  } else s.me.wealth += net;
  // Public budget refills, but unspent money lapses beyond two quarters' worth
  if (r.budget) {
    const cap = r.budget * 2, nb = Math.min(cap, s.office.budget + r.budget);
    if (s.office.budget + r.budget > cap) report.lines.push({ label: 'Unspent public funds lapsed', amt: -(s.office.budget + r.budget - cap), public: true });
    s.office.budget = nb;
  }
  // Debts
  s.debts = s.debts.filter(d => {
    if (d.dueQ > s.q) return true;
    if (s.me.wealth >= d.amount) { s.me.wealth -= d.amount; report.lines.push({ label: `Repaid ${d.to}`, amt: -d.amount }); return false; }
    d.amount = Math.round(d.amount * 1.1); d.dueQ = s.q + 2;
    s.rel.patron.o = clamp(s.rel.patron.o + 8); s.rel.patron.t = clamp(s.rel.patron.t - 5, -100, 100);
    report.lines.push({ label: `Could not repay ${d.to}. Interest added.`, amt: 0 });
    return true;
  });

  // Conditions drift: infrastructure decays unless maintained; the ward and nation pull on each other
  for (const k of SERVICES) {
    const decay = k === 'power' || k === 'transport' ? 0.8 : 0.5;
    s.local[k] = clamp(s.local[k] - decay + (s.nation[k] - s.local[k]) * 0.05 + (rand(s) - 0.5) * 1.2);
    s.nation[k] = clamp(s.nation[k] + (s.local[k] - s.nation[k]) * 0.03 + (rand(s) - 0.5) * 1.4);
  }
  s.nation.debt = clamp(s.nation.debt + 0.3 + (rand(s) - 0.5) * 0.6);
  s.nation.trust = clamp(s.nation.trust + (rand(s) - 0.5) * 1.2);
  s.nation.inst = clamp(s.nation.inst + (rand(s) - 0.5) * 0.6);
  // People and party
  s.me.support = clamp(s.me.support + (avg(s.local) - 50) * 0.06 + (s.me.rep - 50) * 0.03 - 0.8);
  s.me.loyalty = clamp(s.me.loyalty - 1);
  if (!s.flags.probe) s.me.exposure = clamp(s.me.exposure - 1);
  if (s.flags.barred) { s.flags.barredSince ??= s.q; if (s.q - s.flags.barredSince >= 16) { delete s.flags.barred; delete s.flags.barredSince; } }

  // Probes: high exposure plus a functioning institution draws investigators
  if (s.me.exposure >= 35 && !s.flags.probe && rand(s) < ((s.me.exposure - 25) / 110) * (0.6 + s.nation.inst / 100)) {
    s.flags.probe = true;
    s.queue.push({ due: s.q + 1, kind: 'event', id: 'probe' });
    note(s, 'ledger', 'Sources: Integrity Bureau "taking interest" in {name}\'s finances.', true);
    report.uncertain.push('Investigators are circling. Expect a letter soon.');
  }
  if (s.rel.patron.o >= 70 && !s.queue.some(e => e.id === 'patron_calls') && !s.pending) s.queue.push({ due: s.q, kind: 'event', id: 'patron_calls' });

  // Delayed consequences that are due
  const due = s.queue.filter(e => e.due <= s.q).sort((a, b) => a.due - b.due);
  s.queue = s.queue.filter(e => e.due > s.q);
  let nextEvent = null;
  for (const e of due) {
    if (e.kind === 'outcome') {
      const o = OUTCOMES[e.id](s, rand(s));
      if (o) { applyFx(s, o.fx, { cause: 'An earlier decision', report }); report.autos.push(fmt(s, o.text)); }
    } else if (!nextEvent) nextEvent = e.id; else s.queue.push({ ...e, due: s.q + 1 });
  }

  // News from the state of the world
  for (const [key, test, src, text, rumor] of AMBIENT) {
    const cd = 'n_' + key;
    if (test(s) && !(s.flags[cd] > s.q)) { note(s, src, text, !!rumor); s.flags[cd] = s.q + 6; }
  }

  // What comes next: election, scheduled event, or a random one
  s.movesLeft = MOVES_PER_Q;
  if (s.q >= s.election.nextQ) s.pending = { kind: 'election', stage: 'call' };
  else {
    const id = nextEvent || drawEvent(s);
    if (id) {
      s.pending = { kind: 'decision', id };
      if (EVENTS[id].effects) applyFx(s, EVENTS[id].effects, { cause: EVENTS[id].title });
    }
  }
  if (s.player.age >= 70) end(s, 'retired');
  report.next = s.pending ? s.pending.kind : null;
  report.nextTitle = s.pending?.kind === 'decision' ? EVENTS[s.pending.id].title : null;
  s.ledger = report.lines;
  return finish(s, before, logLen, report);
}

function drawEvent(s) {
  if (rand(s) > 0.85) return null;
  const pool = [];
  for (const [id, e] of Object.entries(EVENTS)) {
    if (!e.weight) continue;
    if (e.once && s.seen[id] != null) continue;
    if (s.seen[id] != null && s.q - s.seen[id] < (e.cooldown ?? 6)) continue;
    const w = e.weight(s); if (w > 0) pool.push([id, w]);
  }
  const total = pool.reduce((t, p) => t + p[1], 0); if (!total) return null;
  let x = rand(s) * total;
  for (const [id, w] of pool) { x -= w; if (x <= 0) return id; }
  return pool[pool.length - 1][0];
}

// ---------------------------------------------------------------------------------------
// Elections
// ---------------------------------------------------------------------------------------
export function ticketScore(s, target) {
  const thr = 22 + 6 * (target - 1);
  const f = s.flags;
  const score = 0.45 * s.me.loyalty + 0.25 * s.me.influence + 0.3 * Math.max(0, s.rel.patron.t) + 0.2 * Math.max(0, s.rel.chair.t) +
    (s.office.role >= 1 ? 6 : 0) + (s.office.role === target ? 10 : 0) - (f.retaliation ? 15 : 0) - (f.discipline ? 12 : 0) - (f.patronEnemy ? 10 : 0);
  const status = score >= thr + 8 ? 'secure' : score >= thr - 8 ? 'contested' : 'denied';
  return { score, thr, status };
}

export function eligibleRaces(s) {
  const out = [], cur = s.office.role, former = s.flags.formerRole;
  ROLES.forEach((r, i) => {
    if (!r.elected) return;
    if (!(i === cur || r.from.includes(cur) || (former != null && (i === former || r.from.includes(former))))) return;
    const why = [];
    if (s.player.age < r.minAge) why.push(`Minimum age ${r.minAge}`);
    if (s.flags.barred) why.push('Barred after a conviction');
    out.push({ role: i, name: r.name, ok: !why.length, reason: why.join('. '), ticket: ticketScore(s, i).status, reelect: i === cur });
  });
  return out;
}

export function enterRace(state, target) {
  const s = structuredClone(state);
  if (s.pending?.kind !== 'election' || s.pending.stage !== 'call') return { error: 'No election to enter.' };
  const race = eligibleRaces(s).find(x => x.role === target);
  if (!race) return { error: 'You cannot contest that seat.' };
  if (!race.ok) return { error: race.reason };
  const t = ticketScore(s, target);
  let granted = t.status === 'secure';
  if (t.status === 'contested') granted = rand(s) < (t.score - (t.thr - 8)) / 16;
  s.election.target = target;
  s.election.ticket = granted ? 'party' : null;
  s.pending = { kind: 'election', stage: granted ? 'campaign' : 'denied' };
  const text = granted ? `The party hands you the ticket for ${ROLES[target].name}.` : `The party gives the ${ROLES[target].name} ticket to someone else.`;
  s.story = text;
  return { state: s, report: { kind: 'ticket', granted, text } };
}

export function ticketDenied(state, route) {
  const s = structuredClone(state);
  if (s.pending?.stage !== 'denied') return { error: 'Not applicable.' };
  const before = snap(s), logLen = s.nlog || 0, report = { kind: 'decision', title: 'Ticket denied', choice: route, uncertain: [], notes: [], rolled: null };
  const ctx = { cause: 'Switching sides', report };
  if (route === 'defect') {
    applyFx(s, { party: 'CAM', funds: Math.round(ROLES[s.election.target].fund * 3), rep: -8, support: -3, influence: 4, rel: { chair: { t: -50 }, patron: { t: -15 } }, flags: { defected: true }, news: [['ledger', 'Defection! {name} quits HUP for CAM to contest the ticket.']] }, ctx);
    s.election.ticket = 'party'; s.pending = { kind: 'election', stage: 'campaign' };
    report.text = 'You cross the floor. CAM gives you a ticket and a campaign purse. Your old friends are furious.';
  } else if (route === 'independent') {
    s.election.ticket = 'independent'; s.pending = { kind: 'election', stage: 'campaign' };
    applyFx(s, { rep: 2, loyalty: -5 }, ctx);
    report.text = 'You will run as an independent: no party machine, no party baggage.';
  } else if (route === 'sit') return sitOut(state);
  else return { error: 'Unknown route.' };
  s.story = report.text;
  return finish(s, before, logLen, report);
}

export function sitOut(state) {
  const s = structuredClone(state);
  if (s.pending?.kind !== 'election') return { error: 'No election pending.' };
  const before = snap(s), logLen = s.nlog || 0;
  const report = { kind: 'decision', title: 'You sit this one out', choice: 'Sit out', uncertain: [], notes: [], rolled: null };
  if (s.office.role >= 2 && ROLES[s.office.role].elected) {
    s.flags.formerRole = s.office.role; s.office.role = 0; s.office.budget = 0; s.office.termEnd = null;
    report.text = 'Your term ends and you step aside. You are a Community Figure again, with a title people will keep using.';
  } else report.text = 'You let the cycle pass and use the time to build.';
  s.election.nextQ += ELECTION_CYCLE; s.election.target = null; s.election.ticket = null; s.pending = null;
  s.story = report.text;
  return finish(s, before, logLen, report);
}

const unitOf = t => ROLES[t].unit;
const eff = (v, unit) => 1 - Math.exp(-(v || 0) / unit);

export function campaignPreview(s, alloc) {
  const t = s.election.target, a = { media: 0, agents: 0, gifts: 0, ...alloc }, u = unitOf(t), indep = s.election.ticket === 'independent';
  const inc = s.office.role === t, f = s.flags, R = s.rel;
  const record = t >= 5 ? (avg(s.nation) - 50) * 0.3 : (avg(s.local) - 50) * (inc ? 0.35 : 0.15);
  const factors = [
    ['Popularity', (s.me.support - 50) * 0.5],
    [inc ? 'Record in office' : 'Local conditions', record],
    ['Reputation', (s.me.rep - 50) * 0.15],
    ['Scandal & rumour', (s.me.exposure > 40 ? -(s.me.exposure - 40) * 0.4 : 0) - (f.rumour ? 3 : 0)],
    ['Party machine', indep ? -4 : s.me.loyalty * 0.1 - (f.retaliation ? 4 : 0) - (f.discipline ? 3 : 0)],
    ['Ward agents', 8 * eff(a.agents, u)],
    ['Rallies & media', 8 * eff(a.media, u)],
    ['Handouts', 7 * eff(a.gifts, u)],
    ['Endorsements', (R.patron.t > 30 ? 6 : 0) + (R.market.t > 30 ? 3 : 0) + (R.youth.t > 30 ? 3 : 0) + (R.elders.t > 30 ? 3 : 0) - (f.patronEnemy ? 5 : 0)],
    ['Incumbency', inc ? 3 : 0],
  ];
  const you = 44 + factors.reduce((t, x) => t + x[1], 0);
  const opp = 54 + 3 * t + (R.rival.t < -20 ? 3 : 0);
  return { factors: factors.map(([label, pts]) => ({ label, pts: Math.round(pts * 10) / 10 })), you, opp };
}
export const pollBand = p => { const m = p.you - p.opp; return m > 8 ? 'Comfortable lead' : m > 2 ? 'Narrow lead' : m > -2 ? 'Too close to call' : m > -8 ? 'Trailing' : 'Far behind'; };

export function holdElection(state, alloc) {
  const s = structuredClone(state);
  if (s.pending?.kind !== 'election' || s.pending.stage !== 'campaign') return { error: 'No campaign under way.' };
  const a = {};
  for (const k of ['media', 'agents', 'gifts']) {
    const v = Number(alloc?.[k] ?? 0);
    if (!Number.isFinite(v) || v < 0) return { error: 'Invalid campaign spending.' };
    a[k] = Math.round(v);
  }
  const spend = a.media + a.agents + a.gifts;
  if (spend > s.me.funds) return { error: 'You cannot spend more than your campaign funds.' };
  const before = snap(s), logLen = s.nlog || 0, t = s.election.target, role = ROLES[t];
  const report = { kind: 'election', uncertain: [], lines: [] };
  s.me.funds -= spend;
  if (a.gifts > 0) {
    s.me.exposure = clamp(s.me.exposure + Math.round(14 * eff(a.gifts, unitOf(t))));
    if (rand(s) < 0.5 * eff(a.gifts, unitOf(t)) + 0.1) { s.flags.rumour = true; note(s, 'chatter', 'Rice, cash and wrappers: voters in {ward} say handouts came with "instructions". #VoteBuying', true); }
  }
  const p = campaignPreview(s, a);
  const noise = (rand(s) + rand(s) + rand(s) - 1.5) * 14;
  const margin = p.you - (p.opp + noise), share = clamp(50 + margin * 1.2, 5, 95);
  const win = margin > 0, inc = s.office.role === t;
  report.win = win; report.share = Math.round(share); report.role = role.name; report.factors = p.factors; report.spend = spend;
  report.rival = CAST.rival.name; report.margin = Math.round(margin * 10) / 10;
  s.election.last = { target: t, margin: Math.abs(margin), win, q: s.q };
  const ctx = { cause: 'The election', report };
  if (win) {
    s.stats.wins++; s.flags.formerRole != null && delete s.flags.formerRole;
    delete s.flags.retaliation; delete s.flags.discipline;
    s.election.nextQ += ELECTION_CYCLE; setRole(s, t);
    applyFx(s, { influence: 6 + 2 * t, support: 6, loyalty: 3, news: [['ledger', `{name} wins ${role.name} seat with ${Math.round(share)}%.`]] }, ctx);
    report.text = `${Math.round(share)}% of the vote. You are the new ${role.name}.`;
  } else {
    s.stats.losses++;
    s.election.nextQ += ELECTION_CYCLE;
    if (inc) { s.flags.formerRole = t; s.office.role = 0; s.office.budget = 0; s.office.termEnd = null; }
    applyFx(s, { influence: -8, support: -7, rep: -2, news: [['ledger', `{name} loses ${role.name} race with ${Math.round(share)}%.`]] }, ctx);
    s.queue.push({ due: s.q + 1, kind: 'event', id: 'after_defeat' });
    report.text = `${Math.round(share)}% of the vote. It is not enough.`;
    report.uncertain.push('Defeat is not the end: the aftermath will bring choices.');
  }
  s.election.target = null; s.election.ticket = null; s.pending = null;
  s.story = report.text;
  return finish(s, before, logLen, report);
}

// ---------------------------------------------------------------------------------------
// Endings
// ---------------------------------------------------------------------------------------
function end(s, kind) { s.status = 'ended'; s.ending = { kind, q: s.q }; }
export function retire(state) { const s = structuredClone(state); if (s.status === 'playing') end(s, 'retired'); return { state: s }; }
export function legacy(s) {
  const score = Math.round(s.stats.peak * 12 + s.stats.wins * 6 + avg(s.nation) * 0.3 + s.me.rep * 0.2 - s.me.exposure * 0.2);
  const peak = ROLES[s.stats.peak].name;
  const verdict = score > 90 ? 'A towering career' : score > 55 ? 'A career people will argue about' : score > 25 ? 'A short chapter' : 'A footnote';
  return { score, peak, verdict, wins: s.stats.wins, losses: s.stats.losses, years: Math.floor(s.q / 4) };
}

// ---------------------------------------------------------------------------------------
// Selectors for the UI (read-only)
// ---------------------------------------------------------------------------------------
export function moveList(s) {
  return Object.entries(MOVES).map(([id, m]) => ({ id, icon: m.icon, name: m.name, sub: m.sub, disabled: s.movesLeft <= 0 ? 'No moves left' : s.status !== 'playing' ? 'Game over' : null }));
}

export function objective(s) {
  const q2e = s.election.nextQ - s.q;
  const cur = s.office.role;
  const reach = cur < 2 ? 2 : cur;
  const t = ticketScore(s, reach), race = eligibleRaces(s);
  const nextUp = ROLES.findIndex((r, i) => i > cur && r.from.includes(cur) && r.elected);
  const bits = [];
  bits.push(q2e > 0 ? `General election in ${q2e} quarter${q2e === 1 ? '' : 's'} (${when(s.election.nextQ)})` : 'Election season');
  if (cur < 2) bits.push(`Get a ${ROLES[2].name} ticket: ${t.status === 'secure' ? 'party backs you' : t.status === 'contested' ? 'contested; build party standing' : 'party standing too low'}`);
  else bits.push(`Hold your seat; ${nextUp > 0 ? `or aim for ${ROLES[nextUp].name}` : 'aim higher'}`);
  return { bits, ticket: t, race, q2e };
}

export const ladder = s => ROLES.map((r, i) => ({ i, name: r.name, here: i === s.office.role, passed: i < s.office.role }));
export const levelName = s => ROLES[s.office.role].name + (s.flags.formerRole != null ? ` (former ${ROLES[s.flags.formerRole].name})` : '');
export { ROLES, REGIONS, PARTIES, CAST, IND, SERVICES, ORIGINS, IDEOLOGIES, EVENTS, MOVES };
