// Policy Panic UI. Renders engine state and routes taps to engine calls. No game rules live here.
import * as E from './engine.js';
import { N, IND, SERVICES, ROLES, REGIONS, ORIGINS, IDEOLOGIES, CAST, WANTS, SOURCES, PARTIES, MOVES, EVENTS } from './content.js';
import { avatar, icon, scene, hero, countryScene, SKINS, OUTFITS, STYLES } from './art.js';

const $app = document.getElementById('app'), $live = document.getElementById('live');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clampN = v => Math.max(0, Math.min(100, Math.round(v)));

// ---------- storage with recovery ----------------------------------------------------------
const KEY = 'pp.save.v1', PREV = 'pp.prev.v1', SETK = 'pp.settings.v1';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};
let saveOk = true;
function persist() {
  if (!G) return;
  const cur = store.get(KEY); if (cur) store.set(PREV, cur);
  saveOk = store.set(KEY, JSON.stringify(G));
}
function loadSave(k = KEY) {
  const raw = store.get(k); if (!raw) return null;
  try { const o = JSON.parse(raw); return E.validateState(o) ? o : null; } catch { return null; }
}
const encode = s => btoa(unescape(encodeURIComponent(JSON.stringify(s))));
const decode = t => JSON.parse(decodeURIComponent(escape(atob(t.trim()))));

let S = { text: 1, motion: 'auto', contrast: false, sound: false };
try { Object.assign(S, JSON.parse(store.get(SETK) || '{}')); } catch { /* defaults */ }
function applySettings() {
  const d = document.documentElement;
  d.dataset.text = S.text; d.dataset.motion = S.motion; d.dataset.contrast = S.contrast ? '1' : '0';
  store.set(SETK, JSON.stringify(S));
}
let ac;
function tone(f, d = .12, type = 'square') {
  if (!S.sound) return;
  try { ac ??= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.stop(ac.currentTime + d); } catch { /* audio unavailable */ }
}

// ---------- state ---------------------------------------------------------------------------
let G = null;
const NAMES = ['Adaeze Okoro', 'Tunde Balogun', 'Hauwa Musa', 'Chidi Nwosu', 'Folake Adeyemi', 'Ibrahim Sani', 'Ngozi Ibe', 'Emeka Eze', 'Yetunde Bello', 'Bassey Etim'];
const pickName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const U = { screen: 'title', tab: 'life', create: { name: pickName(), look: { skin: 2, hair: 0, outfit: 0 }, region: 'marina', origin: 'organiser', ideology: 'welfare' }, ref: null, sel: null, report: null, sheet: null, scope: 'local', alloc: { media: 0, agents: 0, gifts: 0 }, msg: null, confirm: null, io: '' };

const HELP = {
  wealth: ['Personal wealth', 'Your own money. Pays for living costs, lawyers, training and some favours. Salary and your own income add to it each quarter.'],
  funds: ['Campaign funds', 'Only for elections: rallies, ward agents, handouts. Where the money comes from decides who expects something back.'],
  budget: ['Public budget', 'Money held in trust for the people you serve. It refills each quarter but lapses if you sit on it. It can only be spent on public projects.'],
  exposure: ['Legal exposure (heat)', 'How much a determined investigator could find. High heat draws probes, rumours and court dates. It fades slowly if you stay clean.'],
  influence: ['Political influence', 'How many doors open when you knock. It helps win party tickets and sets your standing with powerful people.'],
  loyalty: ['Party loyalty', 'How much your party leadership trusts you. It decays unless you show up. Party tickets depend on it.'],
  ticket: ['Party ticket', 'You need your party to nominate you. Secure means they back you. Contested means it could go either way. Denied means you must defect, run independent, or sit out.'],
  moves: ['Moves', 'Free actions you can take before the quarter ends. You get two each quarter. Ending the quarter moves the calendar forward.'],
};

// ---------- helpers -------------------------------------------------------------------------
const roleName = s => ROLES[s.office.role].name;
const heatBad = new Set(['exposure']);
function meter(label, v, cls = '', help = '') {
  const r = clampN(v);
  return `<div class="meter ${cls}"><div class="mhead"><span>${esc(label)}${help ? ` <button class="q" data-act="help" data-k="${help}" aria-label="What is ${esc(label)}?">?</button>` : ''}</span><b>${r}</b></div><div class="mbar" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r}"><i style="width:${r}%"></i></div></div>`;
}
const cond = v => v < 35 ? 'lo' : v < 60 ? 'mid' : 'hi';
const trustLabel = t => t <= -60 ? 'Hostile' : t <= -20 ? 'Cold' : t < 20 ? 'Neutral' : t < 60 ? 'Warm' : 'Devoted';
const stakeLabel = { money: 'Money', party: 'Party', public: 'Public', law: 'Legal risk', press: 'Press', family: 'Family' };
const chips = list => list.map(k => `<span class="chip st-${k}">${stakeLabel[k] || k}</span>`).join('');
const sign = d => (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d);
function toast(msg) { $live.textContent = ''; setTimeout(() => { $live.textContent = msg; }, 20); U.msg = msg; const t = document.getElementById('toast'); if (t) { t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 3200); } }

// ---------- views ----------------------------------------------------------------------------
function viewTitle() {
  const has = !!loadSave(), hasPrev = !has && !!loadSave(PREV), broken = !has && !!store.get(KEY);
  return `<main id="main" tabindex="-1" class="title">
<div class="hero">${hero()}<div class="stripe"></div></div>
<h1 class="logo"><span class="a">POLICY</span><span class="b">PANIC<i>!</i></span></h1>
<p class="tag-line">Win power. Keep it. Try to stay clean.</p>
<div class="stack">
${has ? `<button class="btn primary big" data-act="continue">Continue</button><button class="btn" data-act="new">New game</button>` : `<button class="btn primary big" data-act="new">New game</button>`}
${hasPrev ? `<button class="btn" data-act="restore-prev">Restore previous autosave</button>` : ''}
${broken && !hasPrev ? `<p class="warn">Your last save could not be read. Open settings to import a backup.</p>` : ''}
<button class="btn ghost" data-act="settings">${icon('gear', 20)} Settings &amp; accessibility</button>
</div>
<p class="fine">A fictional Nigeria. Every person, party and place is invented. Plays offline.</p></main>`;
}

function viewCreate() {
  const c = U.create;
  const head = (n, t) => `<header class="top plain"><button class="back" data-act="${n === 1 ? 'title' : 'create-1'}" aria-label="Back">←</button><div><span class="kick">Step ${n} of 2</span><h1 class="h">${t}</h1></div></header>`;
  if (c.step === 1) {
    return `${head(1, 'Who are you?')}<main id="main" tabindex="-1" class="pad">
<div class="preview">${avatar(c.look, 96)}<div class="grow"><label class="lbl" for="nm">Your name</label><input id="nm" class="field" maxlength="24" autocomplete="off" value="${esc(c.name)}"><button class="btn small" data-act="rename">Surprise me</button></div></div>
<fieldset class="group"><legend>Look</legend>
<div class="row" role="group" aria-label="Skin tone">${SKINS.map((k, i) => `<button class="swatch ${c.look.skin === i ? 'on' : ''}" style="background:${k}" data-act="look" data-k="skin" data-v="${i}" aria-pressed="${c.look.skin === i}" aria-label="Skin tone ${i + 1}"></button>`).join('')}</div>
<div class="row wrap" role="group" aria-label="Hair or headwear">${STYLES.map((k, i) => `<button class="pill ${c.look.hair === i ? 'on' : ''}" data-act="look" data-k="hair" data-v="${i}" aria-pressed="${c.look.hair === i}">${k}</button>`).join('')}</div>
<div class="row wrap" role="group" aria-label="Outfit">${OUTFITS.map((k, i) => `<button class="pill ${c.look.outfit === i ? 'on' : ''}" data-act="look" data-k="outfit" data-v="${i}" aria-pressed="${c.look.outfit === i}"><i class="dot" style="background:${k.c}"></i>${k.name}</button>`).join('')}</div></fieldset>
<fieldset class="group"><legend>Where is your home ward?</legend>${Object.entries(REGIONS).map(([k, r]) => `<button class="opt ${c.region === k ? 'on' : ''}" data-act="region" data-k="${k}" aria-pressed="${c.region === k}"><b>${r.name}</b><span>${r.ward}. ${r.blurb}</span></button>`).join('')}</fieldset>
<button class="btn primary big" data-act="create-2">Next: your path</button></main>`;
  }
  return `${head(2, 'How did you get here?')}<main id="main" tabindex="-1" class="pad">
<fieldset class="group"><legend>Your starting point</legend>${Object.entries(ORIGINS).map(([k, o]) => `<button class="opt origin ${c.origin === k ? 'on' : ''}" data-act="origin" data-k="${k}" aria-pressed="${c.origin === k}"><b>${o.name} <small>Age ${o.age} · ${N(o.wealth)}</small></b><span>${o.blurb}</span><span class="sw"><em class="good">+ ${o.strength}</em><em class="bad">− ${o.weakness}</em></span></button>`).join('')}</fieldset>
<fieldset class="group"><legend>Your public stance</legend><p class="muted small">Decisions that match your stance earn goodwill. Contradicting it looks like a flip-flop.</p>${Object.entries(IDEOLOGIES).map(([k, o]) => `<button class="opt ${c.ideology === k ? 'on' : ''}" data-act="ideology" data-k="${k}" aria-pressed="${c.ideology === k}"><b>${o.name}</b><span>${o.blurb}</span></button>`).join('')}</fieldset>
<button class="btn primary big" data-act="start">Enter politics</button></main>`;
}

function topbar() {
  const s = G;
  return `<header class="top"><div class="who">${avatar(s.player.look, 44)}<div><b class="name">${esc(s.player.name)}</b><span>${esc(E.levelName(s))}</span></div></div><div class="when"><b>${E.when(s.q)}</b><span>Age ${s.player.age}</span></div><button class="gear" data-act="settings" aria-label="Settings and help">${icon('gear', 24)}</button></header>`;
}
const TABS = [['life', 'Life', 'life'], ['people', 'People', 'people'], ['money', 'Money', 'money'], ['country', 'Country', 'globe'], ['news', 'News', 'news']];
function frame(inner, dock = '') {
  const unread = G.log.length && G.log[0].q === G.q ? 1 : 0;
  return `${topbar()}<main id="main" tabindex="-1" class="pad tabbed ${dock ? 'has-dock' : ''}">${inner}</main>${dock}<nav class="tabs" aria-label="Sections">${TABS.map(([k, l, ic]) => `<button data-act="tab" data-tab="${k}" ${U.tab === k ? 'aria-current="page"' : ''}>${icon(ic, 24)}<span>${l}</span>${k === 'news' && unread ? '<i class="pip" aria-label="new"></i>' : ''}</button>`).join('')}</nav>`;
}

function viewLife() {
  const s = G, p = s.pending, o = E.objective(s), m = E.moveList(s);
  let card;
  if (p?.kind === 'decision') { const d = EVENTS[p.id]; card = `<section class="paper alert pop"><span class="tag red">Needs your attention</span><h2 class="serif">${esc(d.title)}</h2><p class="from">${esc(d.who)}</p><p>${esc(d.pressure)}</p></section>`; }
  else if (p?.kind === 'election') card = `<section class="paper alert pop"><span class="tag red">Election season</span><h2 class="serif">The country goes to the polls</h2><p>Parties are choosing candidates. Decide whether to run, and for what.</p></section>`;
  else card = `<section class="paper pop"><span class="tag">${E.when(s.q)}</span><p class="serif story">${esc(s.story || '')}</p>${s.movesLeft ? `<p class="muted small">Use your moves, then end the quarter.</p>` : `<p class="muted small">You're out of moves. Time to end the quarter.</p>`}</section>`;
  const dock = p ? `<div class="dock up"><button class="btn primary big" data-act="cta">${p.kind === 'election' ? 'Enter the race' : 'Face the decision'}</button></div>` :
    `<div class="dock up"><button class="btn primary big" data-act="cta">End quarter <small>→ ${E.when(s.q + 1)}</small></button></div>`;
  const next = E.ladder(s);
  return frame(`${card}
<section class="goal" aria-label="Objectives">${o.bits.map(b => `<p>${icon('handshake', 18)}${esc(b)}</p>`).join('')}</section>
<section aria-label="Moves"><h2 class="h sec">Your moves <span class="pips" aria-label="${s.movesLeft} of ${E.MOVES_PER_Q} moves left">${[...Array(E.MOVES_PER_Q)].map((_, i) => `<i class="${i < s.movesLeft ? 'on' : ''}"></i>`).join('')}</span> <button class="q" data-act="help" data-k="moves" aria-label="What are moves?">?</button></h2>
<div class="moves">${m.map(x => `<button class="move" data-act="move" data-id="${x.id}" ${x.disabled ? 'disabled' : ''}>${icon(x.icon, 28)}<b>${x.name}</b><span>${x.sub}</span></button>`).join('')}</div></section>
<section class="stats" aria-label="Your standing">${meter('Influence', s.me.influence, 'm-inf', 'influence')}${meter('Public support', s.me.support, 'm-sup')}${meter('Party loyalty', s.me.loyalty, 'm-loy', 'loyalty')}
<details class="more"><summary>More about you</summary>${meter('Reputation', s.me.rep, 'm-rep')}${meter('Legal exposure', s.me.exposure, 'm-heat', 'exposure')}</details></section>
<section class="wallets" aria-label="Money at a glance"><button data-act="tab" data-tab="money" class="w w-green"><span>Wealth</span><b>${N(s.me.wealth)}</b></button><button data-act="tab" data-tab="money" class="w w-yellow"><span>Campaign</span><b>${N(s.me.funds)}</b></button><button data-act="tab" data-tab="money" class="w w-blue"><span>Public</span><b>${s.office.role >= 2 ? N(s.office.budget) : '—'}</b></button></section>
${s.log.length ? `<section><h2 class="h sec">Latest</h2>${s.log.slice(0, 2).map(newsItem).join('')}<button class="link" data-act="tab" data-tab="news">All news →</button></section>` : ''}
<details class="more ladder"><summary>Road to power</summary><ol>${next.map(r => `<li class="${r.here ? 'here' : r.passed ? 'done' : ''}"><span>${esc(r.name)}</span>${r.here ? '<em>You are here</em>' : ''}</li>`).join('')}</ol></details>`, dock);
}

const newsItem = n => `<article class="news ${n.src}"><header><span>${SOURCES[n.src] || n.src}</span><time>${E.when(n.q)}</time>${n.rumor ? '<em class="rumor">Unconfirmed</em>' : ''}</header><p>${esc(n.text)}</p></article>`;

function viewPeople() {
  const s = G, sk = s.me.skills;
  const rels = Object.keys(CAST).sort((a, b) => (s.rel[b].o - s.rel[a].o) || (Math.abs(s.rel[b].t) - Math.abs(s.rel[a].t)));
  const pips = v => `<span class="sk">${[...Array(10)].map((_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</span>`;
  const t = E.ticketScore(s, s.office.role < 2 ? 2 : s.office.role);
  return frame(`<section class="paper you"><div class="preview">${avatar(s.player.look, 72)}<div><h2 class="serif">${esc(s.player.name)}</h2><p class="muted">${ORIGINS[s.player.origin].name} · ${IDEOLOGIES[s.player.ideology].name}</p></div></div>
<p class="small"><b>${esc(E.playStyle(s).name)}.</b> ${esc(E.playStyle(s).note)}</p><div class="skills"><p>Organising ${pips(sk.org)}</p><p>Oratory ${pips(sk.speech)}</p><p>Finance ${pips(sk.fin)}</p></div></section>
<section class="paper"><h3 class="h">${esc(PARTIES[s.player.party])}</h3>${meter('Your loyalty', s.me.loyalty, 'm-loy', 'loyalty')}<p class="small">Party ticket outlook: <b class="st-${t.status}">${t.status === 'secure' ? 'Secure' : t.status === 'contested' ? 'Contested' : 'Denied'}</b> <button class="q" data-act="help" data-k="ticket" aria-label="What is a ticket?">?</button></p></section>
<h2 class="h sec">People who matter</h2>
${rels.map(id => { const c = CAST[id], r = s.rel[id]; return `<details class="person"><summary><span class="ini c${[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 5}">${c.name.replace(/^(Chief|Alhaji|Hon\.|Barr\.|Comrade|Pa|Dr\.) /, '')[0]}</span><span class="pn"><b>${c.name}</b><small>${c.role}</small></span><span class="tr ${r.t < -20 ? 'neg' : r.t > 20 ? 'pos' : ''}">${trustLabel(r.t)}</span>${r.o >= 15 ? `<em class="owed">You owe</em>` : ''}</summary>
<div class="pd"><p>${c.blurb}</p>${meter('Trust', (r.t + 100) / 2, r.t < 0 ? 'bad' : '')}${r.o >= 5 ? meter('What you owe them', r.o, 'bad') : ''}<p class="want"><b>Right now:</b> ${esc(WANTS[id](s))}</p></div></details>`; }).join('')}`);
}

function viewMoney() {
  const s = G, r = ROLES[s.office.role], inc = ORIGINS[s.player.origin].income, net = inc + r.salary - r.living;
  const owes = Object.keys(CAST).filter(id => s.rel[id].o >= 15);
  const w = (cls, title, help, big, body) => `<section class="wallet ${cls}"><header><h3>${title}</h3><button class="q" data-act="help" data-k="${help}" aria-label="About ${title}">?</button></header><b class="big">${big}</b>${body}</section>`;
  return frame(`<p class="muted small">Four kinds of money. They never mix, and each carries different expectations.</p>
${w('w-green', 'Personal wealth', 'wealth', N(s.me.wealth), `<p>Next quarter: <b class="${net >= 0 ? 'pos' : 'neg'}">${net >= 0 ? '+' : ''}${N(net)}</b></p><small>Own income ${N(inc)} · salary ${N(r.salary)} · living costs ${N(-r.living)}</small>`)}
${w('w-yellow', 'Campaign funds', 'funds', N(s.me.funds), `<p>Only for elections. Raise more from the Life screen.</p>`)}
${w('w-blue', 'Public budget', 'budget', s.office.role >= 2 ? N(s.office.budget) : 'No office', s.office.role >= 2 ? `<p>Refills ${N(r.budget)} a quarter. Holds up to ${N(r.budget * 2)}; extra lapses.</p><small>This is the people's money. Spend it on the ward.</small>` : `<p>You hold no public funds yet. Win a seat to control a budget.</p>`)}
<section class="paper"><h3 class="h sub">The country's money <small class="muted">(not yours)</small></h3>${meter('Government money', s.nation.gov, 'm-gov')}${meter('Resource income', s.nation.resinc, 'm-res')}${meter('Public debt (higher is worse)', s.nation.debt, 'bad')}<p class="muted small">Oil and gas can fill the treasury without making anyone's life better. What counts is where the money goes.</p></section>
<section class="wallet w-red"><header><h3>Debts &amp; obligations</h3></header>
${s.debts.length ? s.debts.map(d => `<p class="line"><span>${esc(d.to)}</span><b>${N(d.amount)}</b><small>due ${E.when(d.dueQ)}</small></p>`).join('') : '<p class="muted">No debts.</p>'}
${owes.map(id => `<p class="line"><span>Favour owed to ${CAST[id].name}</span><b>${Math.round(s.rel[id].o)}/100</b></p>`).join('')}</section>
${s.ledger.length ? `<section class="paper"><h3 class="h">Last quarter</h3>${s.ledger.map(l => `<p class="line"><span>${esc(l.label)}</span><b class="${l.amt < 0 ? 'neg' : 'pos'}">${l.amt ? (l.amt > 0 ? '+' : '') + N(l.amt) : ''}</b></p>`).join('')}</section>` : ''}`);
}

const GROUPS_N = [['Money & outside influence', ['gov', 'resinc', 'debt', 'foreign']], ['How people live', E.SERVICES], ['The state of the nation', ['trust', 'stab', 'inst']]];
function viewCountry() {
  const s = G, ward = REGIONS[s.player.region].ward, scope = U.scope, src = scope === 'local' ? s.local : s.nation;
  const gap = E.wealthGap(s);
  const row = k => {
    const i = E.indicatorInfo(s, scope, k), c = i.bad ? cond(100 - i.value) : cond(i.value), w = i.history[0];
    return `<button class="ind" data-act="ind" data-scope="${scope}" data-k="${k}" aria-label="${esc(i.label)}: ${i.value}, ${i.band}. Tap for details"><div class="mhead"><span>${esc(i.label)}</span><span class="band b-${c}">${i.band}</span><b>${i.value}</b></div><div class="mbar ${c}" aria-hidden="true"><i style="width:${i.value}%"></i></div>${w ? `<p class="why"><b class="${w.good ? 'pos' : 'neg'}">${w.d > 0 ? '▲' : '▼'} ${sign(w.d)}</b> ${esc(w.cause)}</p>` : ''}</button>`;
  };
  const who = (label, v, cls) => `<div class="who2"><span>${label}</span><div class="mbar ${cls}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v)}"><i style="width:${Math.round(v)}%"></i></div><b>${Math.round(v)}</b></div>`;
  return frame(`${countryScene({ ...src, trust: s.nation.trust, stab: s.nation.stab, oil: !!s.flags.oilLive })}
<section class="paper gap"><h2 class="h sub big">Who is actually doing well?</h2>${who('The government', gap.gov, 'g-gov')}${who('Resource income', gap.resources, 'g-res')}${who('You, personally', gap.you, 'g-you')}${who('Ordinary people', gap.people, 'g-ppl')}<p class="serif verdict">${esc(gap.verdict)}</p></section>
<div class="seg" role="group" aria-label="Scope"><button data-act="scope" data-v="local" aria-pressed="${scope === 'local'}">${ward}</button><button data-act="scope" data-v="nation" aria-pressed="${scope === 'nation'}">The country</button></div>
<p class="muted small">Tap any line to see why it changed.</p>
${scope === 'local' ? `<section class="paper"><h3 class="h sub">How people live in ${ward}</h3>${E.SERVICES.map(row).join('')}</section>` : GROUPS_N.map(([t, ks]) => `<section class="paper"><h3 class="h sub">${t}</h3>${ks.map(row).join('')}</section>`).join('')}
<section class="note"><b>Offline world.</b> The country here is simulated on your device. A real shared world needs a server so other players' choices can change it. See docs/DESIGN.md.</section>`);
}

function viewNews() {
  return frame(`<h2 class="h sec">News &amp; reaction</h2>${G.log.length ? G.log.map(newsItem).join('') : `<div class="empty"><p>Nothing in the papers yet.</p><small>Make some decisions and the press will notice.</small></div>`}`);
}

// ---------- decision / report ---------------------------------------------------------------
function viewDecision() {
  const v = E.decisionView(G, U.ref); if (!v) { U.screen = 'main'; return viewLife(); }
  const move = !!U.ref.move;
  return `<header class="top plain">${move ? `<button class="back" data-act="cancel" aria-label="Back, keep my move">←</button>` : ''}<div class="grow"><span class="kick">${E.when(G.q)} · ${move ? 'Your move' : 'Decision'}</span></div><button class="btn small" data-act="peek">My situation</button></header>
<main id="main" tabindex="-1" class="pad has-dock">${scene(v.scene)}
<section class="paper dec pop"><p class="from">${esc(v.who)}</p><h1 class="serif">${esc(v.title)}</h1><p class="body">${esc(v.body)}</p>${v.pressure ? `<p class="pressure">${esc(v.pressure)}</p>` : ''}</section>
<div class="choices" role="group" aria-label="Your options">${v.choices.map(c => `<button class="choice ${U.sel === c.i ? 'on' : ''}" data-act="${move ? 'commit' : 'pick'}" data-i="${c.i}" ${c.reason ? 'aria-disabled="true"' : ''} aria-pressed="${U.sel === c.i}"><b>${esc(c.label)}</b><span class="chips">${chips(c.stakes)}${c.risky ? '<span class="chip st-risk">Uncertain</span>' : ''}</span>${c.cost ? `<small class="cost">Costs ${esc(c.cost)}</small>` : ''}${c.reason ? `<small class="why-no">${esc(c.reason)}</small>` : ''}</button>`).join('')}</div></main>
${!move ? `<div class="dock"><button class="btn primary big" data-act="commit" data-i="${U.sel ?? ''}" ${U.sel == null ? 'disabled' : ''}>${U.sel == null ? 'Choose an option' : 'Commit to this'}</button></div>` : ''}`;
}

const GROUPS = [['you', 'You'], ['power', 'Power & relationships'], ['public', 'The public & the place'], ['money', 'Money']];
function changes(rows) {
  if (!rows.length) return `<p class="muted">Nothing measurable changed. Sometimes that is the point.</p>`;
  return GROUPS.map(([g, t]) => { const r = rows.filter(x => x.group === g); return r.length ? `<h3 class="h sub">${t}</h3><ul class="chg">${r.map(x => `<li><span>${esc(x.label)}</span><b class="${x.good ? 'pos' : 'neg'}">${x.money ? (x.d > 0 ? '+' : '−') + N(Math.abs(x.d)) : sign(x.d)}<small> ${x.money ? '' : '→ ' + String(x.to).replace('-', '−')}</small></b></li>`).join('')}</ul>` : ''; }).join('');
}
function viewReport() {
  const r = U.report;
  if (r.kind === 'election') return viewElectionResult(r);
  const q = r.kind === 'quarter';
  return `<header class="top plain"><div class="grow"><span class="kick">${q ? 'Time passes' : 'What happened'}</span></div></header><main id="main" tabindex="-1" class="pad has-dock">
<section class="paper pop">${q ? `<h1 class="serif">${r.title}</h1>${r.lines.length ? `<h3 class="h sub">Money in and out</h3>${r.lines.map(l => `<p class="line"><span>${esc(l.label)}</span><b class="${l.amt < 0 ? 'neg' : 'pos'}">${l.amt ? (l.amt > 0 ? '+' : '') + N(l.amt) : ''}</b></p>`).join('')}` : ''}`
      : `<p class="from">You chose</p><h1 class="serif">${esc(r.choice)}</h1><p class="body">${esc(r.text)}</p>${r.rolled ? `<p class="fate ${r.rolled.hit ? 'luck' : 'unlucky'}"><b>${r.rolled.hit ? 'It went your way.' : 'It did not go your way.'}</b> ${esc(r.rolled.text)}</p>` : ''}`}
${r.autos?.length ? `<h3 class="h sub">Earlier choices catch up</h3>${r.autos.map(a => `<p class="auto">${esc(a)}</p>`).join('')}` : ''}
${r.notes?.length ? r.notes.map(n => `<p class="muted small">${esc(n)}</p>`).join('') : ''}</section>
${r.meaning?.length ? `<section class="meaning"><h3 class="h sub">What this means</h3>${r.meaning.map(m => `<p>${esc(m)}</p>`).join('')}</section>` : ''}
<section class="paper"><h2 class="h sub big">Confirmed changes</h2>${changes(r.confirmed)}</section>
${r.news?.length ? `<section><h3 class="h sub">In the news</h3>${r.news.map(newsItem).join('')}</section>` : ''}
${r.uncertain?.length ? `<section class="unsure"><h3 class="h sub">Not confirmed</h3>${r.uncertain.map(u => `<p>${esc(u)}</p>`).join('')}</section>` : ''}</main>
<div class="dock"><button class="btn primary big" data-act="after-report">${q && r.next === 'decision' ? `Next: ${esc(r.nextTitle)}` : q && r.next === 'election' ? 'Election season' : 'Continue'}</button></div>`;
}

// ---------- elections ---------------------------------------------------------------------------
function viewElection() {
  const st = G.pending?.stage;
  const hd = t => `<header class="top plain"><div class="grow"><span class="kick">${E.when(G.q)} · General election</span><h1 class="h">${t}</h1></div></header>`;
  if (st === 'call') {
    const races = E.eligibleRaces(G);
    return `${hd('Which seat?')}<main id="main" tabindex="-1" class="pad"><p class="muted">Parties choose candidates first. Your ticket outlook depends on loyalty, influence and who backs you. <button class="q" data-act="help" data-k="ticket" aria-label="What is a ticket?">?</button></p>
${races.map(r => `<button class="opt race ${r.ok ? '' : 'off'}" data-act="enter" data-role="${r.role}" ${r.ok ? '' : 'aria-disabled="true"'}><b>${r.name}${r.reelect ? ' <small>defend your seat</small>' : ''}</b><span>Ticket outlook: <strong class="st-${r.ticket}">${r.ticket === 'secure' ? 'Secure' : r.ticket === 'contested' ? 'Contested' : 'Denied'}</strong>${r.reason ? ` · ${esc(r.reason)}` : ''}</span></button>`).join('') || '<p>You are not eligible for any seat this cycle.</p>'}
<button class="btn" data-act="sit">Sit this one out${G.office.role >= 2 ? ' (your term ends)' : ''}</button></main>`;
  }
  if (st === 'denied') return `${hd('No ticket')}<main id="main" tabindex="-1" class="pad"><section class="paper alert pop"><p class="serif">The party gave the ${ROLES[G.election.target].name} ticket to someone else.</p></section>
<button class="opt" data-act="deny" data-v="defect"><b>Defect to ${PARTIES.CAM}</b><span>They offer a ticket and campaign money. Your old party will never forgive it.</span></button>
<button class="opt" data-act="deny" data-v="independent"><b>Run as an independent</b><span>No party machine, no party baggage.</span></button>
<button class="opt" data-act="deny" data-v="sit"><b>Sit it out</b><span>Rebuild your standing and try again next cycle.</span></button></main>`;
  // campaign
  const t = G.election.target, unit = ROLES[t].unit, step = Math.max(1000, Math.round(unit / 4 / 1000) * 1000), a = U.alloc, spent = a.media + a.agents + a.gifts, left = G.me.funds - spent;
  const p = E.campaignPreview(G, a);
  const lever = (k, name, sub) => `<div class="lever"><div><b>${name}</b><small>${sub}</small></div><div class="stepper"><button data-act="alloc" data-k="${k}" data-d="-1" aria-label="Spend less on ${name}" ${a[k] <= 0 ? 'disabled' : ''}>−</button><output aria-live="polite">${N(a[k])}</output><button data-act="alloc" data-k="${k}" data-d="1" aria-label="Spend more on ${name}">+</button></div></div>`;
  return `${hd(ROLES[t].name)}<main id="main" tabindex="-1" class="pad has-dock">
<section class="paper pop"><span class="tag">${G.election.ticket === 'independent' ? 'Independent' : esc(PARTIES[G.player.party])}</span><h2 class="serif poll">${E.pollBand(p)}</h2><p class="muted small">Polls are a guess, not a promise. Rival: ${CAST.rival.name}.</p></section>
<section class="paper"><h3 class="h sub">Spend your campaign funds <small class="muted">(${N(left)} left)</small></h3>
<button class="btn small" data-act="split">Split evenly (agents + media)</button>${lever('agents', 'Ward agents', 'Party machinery: turnout on the day')}${lever('media', 'Rallies &amp; media', 'Reach and name recognition')}${lever('gifts', 'Handouts', 'Rice and cash. Vote-buying is an offence.')}</section>
<section class="paper"><h3 class="h sub">What is moving the vote</h3><ul class="chg">${p.factors.filter(f => Math.abs(f.pts) >= 0.5).map(f => `<li><span>${f.label}</span><b class="${f.pts > 0 ? 'pos' : 'neg'}">${f.pts > 0 ? '+' : '−'}${Math.abs(f.pts).toFixed(1)}</b></li>`).join('')}</ul></section></main>
<div class="dock"><button class="btn primary big" data-act="vote">Face the voters</button></div>`;
}

function viewElectionResult(r) {
  const top = [...r.factors].sort((a, b) => Math.abs(b.pts) - Math.abs(a.pts)).filter(f => Math.abs(f.pts) >= 1).slice(0, 5);
  return `<header class="top plain"><div class="grow"><span class="kick">Election night</span></div></header><main id="main" tabindex="-1" class="pad has-dock">
<section class="paper result ${r.win ? 'won' : 'lost'}"><span class="stamp">${r.win ? 'ELECTED' : 'DEFEATED'}</span><h1 class="serif">${esc(r.role)}</h1><p class="share"><b>${r.share}%</b> <span>of the vote</span></p><div class="vsbar" aria-hidden="true"><i style="width:${r.share}%"></i></div><p class="body">${esc(r.text)}</p><p class="muted small">Spent ${N(r.spend)} of campaign funds.</p></section>
<section class="paper"><h3 class="h sub">Why it went this way</h3><ul class="chg">${top.map(f => `<li><span>${f.label}</span><b class="${f.pts > 0 ? 'pos' : 'neg'}">${f.pts > 0 ? '+' : '−'}${Math.abs(f.pts).toFixed(1)}</b></li>`).join('')}</ul><p class="muted small">Plus the unpredictable part: turnout, weather, last-minute rumours.</p></section>
<section class="paper"><h2 class="h sub big">Confirmed changes</h2>${changes(r.confirmed)}</section>
${r.news?.length ? `<section><h3 class="h sub">In the news</h3>${r.news.map(newsItem).join('')}</section>` : ''}
${r.uncertain?.length ? `<section class="unsure"><h3 class="h sub">Not confirmed</h3>${r.uncertain.map(u => `<p>${esc(u)}</p>`).join('')}</section>` : ''}</main>
<div class="dock"><button class="btn primary big" data-act="after-report">Continue</button></div>`;
}

function viewEnding() {
  const l = E.legacy(G);
  return `<main id="main" tabindex="-1" class="pad end"><span class="kick">The end of a career</span><h1 class="h big">${esc(G.player.name)}</h1><section class="paper pop"><h2 class="serif">${l.verdict}</h2><p>You served ${l.years} years. Highest office: <b>${l.peak}</b>. Elections won: ${l.wins}. Lost: ${l.losses}.</p><p class="serif">${esc(l.gap.verdict)}</p><p class="muted">Legacy score ${l.score}</p></section>
<button class="btn primary big" data-act="new">Start a new career</button><button class="btn" data-act="title">Main menu</button></main>`;
}

function viewSheet() {
  const k = U.sheet; if (!k) return '';
  let body = '';
  if (k === 'settings') {
    body = `<h2 class="h" id="sh">Settings</h2>
<div class="set"><span>Text size</span><div class="seg">${[[1, 'A'], [1.15, 'A+'], [1.3, 'A++']].map(([v, l]) => `<button data-act="set" data-k="text" data-v="${v}" aria-pressed="${S.text === v}">${l}</button>`).join('')}</div></div>
<div class="set"><span>Reduce motion</span><button class="toggle" data-act="set" data-k="motion" data-v="${S.motion === 'reduce' ? 'auto' : 'reduce'}" aria-pressed="${S.motion === 'reduce'}">${S.motion === 'reduce' ? 'On' : 'Follows device'}</button></div>
<div class="set"><span>High contrast</span><button class="toggle" data-act="set" data-k="contrast" data-v="${!S.contrast}" aria-pressed="${S.contrast}">${S.contrast ? 'On' : 'Off'}</button></div>
<div class="set"><span>Sound effects</span><button class="toggle" data-act="set" data-k="sound" data-v="${!S.sound}" aria-pressed="${S.sound}">${S.sound ? 'On' : 'Off'}</button></div>
${G ? `<h3 class="h sub">Your save ${saveOk ? '' : '<em class="warn">(could not write to storage!)</em>'}</h3><p class="muted small">Saved automatically after every action.</p>
<div class="row wrap"><button class="btn small" data-act="export">Export backup</button><button class="btn small" data-act="import">Import backup</button>${loadSave(PREV) ? '<button class="btn small" data-act="restore-prev">Restore previous autosave</button>' : ''}</div>
${U.io !== '' ? `<textarea id="io" class="field" rows="4" aria-label="Backup code" spellcheck="false">${esc(U.io)}</textarea>` : ''}
<div class="row wrap"><button class="btn small" data-act="retire">Retire &amp; see legacy</button><button class="btn small danger" data-act="delete">${U.confirm === 'delete' ? 'Tap again to delete' : 'Delete save'}</button></div>` : `<h3 class="h sub">Backup</h3><button class="btn small" data-act="import">Import backup</button>${U.io !== '' ? `<textarea id="io" class="field" rows="4" aria-label="Backup code" spellcheck="false">${esc(U.io)}</textarea>` : ''}`}
<div class="note"><b>Shared world:</b> offline for now. Other players cannot affect your country yet; that needs a server. Details in docs/DESIGN.md.</div>`;
  } else if (k === 'peek') {
    const s = G;
    body = `<h2 class="h" id="sh">Your situation</h2><div class="wallets"><div class="w w-green"><span>Wealth</span><b>${N(s.me.wealth)}</b></div><div class="w w-yellow"><span>Campaign</span><b>${N(s.me.funds)}</b></div><div class="w w-blue"><span>Public</span><b>${s.office.role >= 2 ? N(s.office.budget) : '—'}</b></div></div>
${meter('Public support', s.me.support, 'm-sup')}${meter('Influence', s.me.influence, 'm-inf')}${meter('Party loyalty', s.me.loyalty, 'm-loy')}${meter('Legal exposure', s.me.exposure, 'm-heat')}`;
  } else if (k.startsWith('ind:')) {
    const [, sc, key] = k.split(':'), i = E.indicatorInfo(G, sc, key);
    body = `<h2 class="h" id="sh">${esc(i.label)}</h2><p class="big-n"><b>${i.value}</b> <span class="band b-${i.bad ? cond(100 - i.value) : cond(i.value)}">${i.band}</span></p><p>${esc(i.what)}</p><p><b>Why it matters:</b> ${esc(i.matters)}</p><h3 class="h sub">What changed lately</h3>${i.history.length ? `<ul class="chg">${i.history.map(h => `<li><span>${esc(h.cause)} <small>(${h.when})</small></span><b class="${h.good ? 'pos' : 'neg'}">${h.d > 0 ? '▲' : '▼'} ${sign(h.d)}</b></li>`).join('')}</ul>` : '<p class="muted">No recent change. Without upkeep, roads, power and food supply slowly slip.</p>'}`;
  } else if (HELP[k.slice(5)]) { const [t, d] = HELP[k.slice(5)]; body = `<h2 class="h" id="sh">${t}</h2><p>${d}</p>`; }
  return `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh">${body}<button class="btn primary" data-act="close-sheet">Done</button></div>`;
}

// ---------- render ----------------------------------------------------------------------------
let lastKey = '';
function render() {
  try {
    let html;
    switch (U.screen) {
      case 'title': html = viewTitle(); break;
      case 'create': html = viewCreate(); break;
      case 'decision': html = viewDecision(); break;
      case 'report': html = viewReport(); break;
      case 'election': html = G?.pending?.kind === 'election' ? viewElection() : (U.screen = 'main', viewLife()); break;
      case 'ending': html = viewEnding(); break;
      default: html = ({ life: viewLife, people: viewPeople, money: viewMoney, country: viewCountry, news: viewNews }[U.tab] || viewLife)();
    }
    $app.innerHTML = html + viewSheet() + '<div id="toast" class="toast" hidden></div>';
  } catch (e) {
    console.error(e);
    $app.innerHTML = `<main class="pad"><section class="paper"><h1 class="serif">Something went wrong</h1><p>Your save is safe. Reload or return to the menu.</p><button class="btn primary" data-act="title">Main menu</button></section></main>`;
  }
  const key = U.screen + U.tab + (G?.pending?.stage || '') + (U.report ? U.report.kind : '') + (U.ref ? JSON.stringify(U.ref) : '');
  if (key !== lastKey) { lastKey = key; window.scrollTo(0, 0); if (!U.sheet) $app.querySelector('#main')?.focus({ preventScroll: true }); }
  if (U.sheet) { const sh = $app.querySelector('.sheet'); sh && !sh.contains(document.activeElement) && sh.querySelector('button')?.focus({ preventScroll: true }); }
}

// ---------- actions ----------------------------------------------------------------------------
const go = (screen) => { U.screen = screen; U.sel = null; U.sheet = null; render(); };
const commit = (res, screen = 'report') => {
  if (res.error) { toast(res.error); return false; }
  G = res.state; persist(); U.report = res.report; U.screen = screen; U.sel = null; U.sheet = null; render(); return true;
};
function afterReport() {
  U.report = null;
  if (G.status === 'ended') return go('ending');
  if (G.pending?.kind === 'decision') { U.tab = 'life'; U.ref = { event: G.pending.id }; return go('decision'); }
  if (G.pending?.kind === 'election') { U.alloc = { media: 0, agents: 0, gifts: 0 }; return go('election'); }
  U.tab = 'life'; go('main');
}

const ACT = {
  new() { U.create = { step: 1, name: pickName(), look: { skin: 2, hair: 0, outfit: 0 }, region: 'marina', origin: 'organiser', ideology: 'welfare' }; U.confirm = null; go('create'); },
  title() { go('title'); },
  continue() { const s = loadSave(); if (!s) return toast('No readable save found.'); G = s; U.tab = 'life'; history.replaceState({ tab: 'life' }, '', '#life'); go(G.status === 'ended' ? 'ending' : 'main'); },
  'restore-prev'() { const s = loadSave(PREV); if (!s) return toast('No previous save available.'); G = s; persist(); U.sheet = null; U.tab = 'life'; toast('Previous autosave restored.'); go('main'); },
  settings() { U.sheet = 'settings'; U.io = ''; render(); },
  'close-sheet'() { U.sheet = null; U.confirm = null; render(); },
  help(d) { U.sheet = 'help:' + d.k; render(); },
  peek() { U.sheet = 'peek'; render(); },
  set(d) { const v = d.v === 'true' ? true : d.v === 'false' ? false : isNaN(d.v) ? d.v : Number(d.v); S[d.k] = v; applySettings(); render(); },
  'create-1'() { U.create.step = 1; render(); },
  'create-2'() { U.create.name = ($app.querySelector('#nm')?.value ?? U.create.name); U.create.step = 2; render(); },
  rename() { U.create.name = pickName(); render(); },
  look(d) { U.create.look[d.k] = Number(d.v); render(); },
  region(d) { U.create.region = d.k; U.create.name = $app.querySelector('#nm')?.value ?? U.create.name; render(); },
  origin(d) { U.create.origin = d.k; render(); },
  ideology(d) { U.create.ideology = d.k; render(); },
  start() { const c = U.create; G = E.newGame({ ...c, name: c.name }); persist(); U.tab = 'life'; U.ref = { event: G.pending.id }; history.replaceState({ tab: 'life' }, '', '#life'); go('decision'); },
  tab(d) { U.tab = d.tab; history.pushState({ tab: d.tab }, '', '#' + d.tab); U.sheet = null; if (U.screen !== 'main') U.screen = 'main'; render(); },
  scope(d) { U.scope = d.v; render(); },
  ind(d) { U.sheet = `ind:${d.scope}:${d.k}`; render(); },
  cta() { const p = G.pending; if (p?.kind === 'decision') { U.ref = { event: p.id }; go('decision'); } else if (p?.kind === 'election') { U.alloc = { media: 0, agents: 0, gifts: 0 }; go('election'); } else commit(E.endQuarter(G)); tone(330); },
  move(d) { if (G.movesLeft <= 0) return toast('No moves left this quarter.'); U.ref = { move: d.id }; go('decision'); },
  cancel() { go('main'); },
  pick(d) { if ($app.querySelector(`[data-i="${d.i}"]`)?.getAttribute('aria-disabled') === 'true') return toast($app.querySelector(`[data-i="${d.i}"] .why-no`)?.textContent || 'Not available.'); U.sel = Number(d.i); tone(520, .06); render(); },
  commit(d) {
    if (d.i === '' || d.i == null) return;
    const el = $app.querySelector(`.choice[data-i="${d.i}"]`);
    if (el?.getAttribute('aria-disabled') === 'true') return toast(el.querySelector('.why-no')?.textContent || 'Not available.');
    const ok = commit(E.choose(G, U.ref, Number(d.i))); ok && tone(440, .15);
  },
  'after-report'() { afterReport(); },
  enter(d) { const r = E.enterRace(G, Number(d.role)); if (r.error) return toast(r.error); G = r.state; persist(); U.msg = r.report.text; toast(r.report.text); U.alloc = { media: 0, agents: 0, gifts: 0 }; render(); },
  sit() { commit(E.sitOut(G)); },
  deny(d) { commit(E.ticketDenied(G, d.v)); },
  alloc(d) {
    const t = G.election.target, step = Math.max(1000, Math.round(ROLES[t].unit / 4 / 1000) * 1000), a = U.alloc, dir = Number(d.d);
    const spent = a.media + a.agents + a.gifts;
    if (dir > 0 && spent + step > G.me.funds) return toast('Not enough campaign funds. Raise more from the Life screen.');
    a[d.k] = Math.max(0, a[d.k] + dir * step); render();
  },
  split() { const t = G.election.target, step = Math.max(1000, Math.round(ROLES[t].unit / 4 / 1000) * 1000), half = Math.floor(G.me.funds / 2 / step) * step; U.alloc = { media: half, agents: half, gifts: 0 }; render(); },
  vote() { const r = E.holdElection(G, U.alloc); const ok = commit(r); if (ok) tone(r.report.win ? 660 : 160, .3, 'triangle'); },
  export() { U.io = encode(G); render(); },
  import() {
    const ta = $app.querySelector('#io');
    if (!ta || U.io === '') { U.io = ' '; render(); $app.querySelector('#io')?.focus(); return toast('Paste your backup code, then tap Import again.'); }
    try { const s = decode(ta.value); if (!E.validateState(s)) throw 0; G = s; persist(); U.sheet = null; U.tab = 'life'; toast('Backup imported.'); go('main'); } catch { toast('That backup code is not valid.'); }
  },
  retire() { if (U.confirm !== 'retire') { U.confirm = 'retire'; toast('Tap Retire again to end this career.'); return; } U.confirm = null; commit(E.retire(G), 'ending'); },
  delete() { if (U.confirm !== 'delete') { U.confirm = 'delete'; render(); return; } store.del(KEY); store.del(PREV); G = null; U.confirm = null; U.sheet = null; go('title'); },
};

$app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  ACT[b.dataset.act]?.(b.dataset, b);
});
$app.addEventListener('input', e => { if (e.target.id === 'nm') U.create.name = e.target.value; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && U.sheet) ACT['close-sheet'](); });
window.addEventListener('popstate', e => { if (U.screen === 'main') { U.tab = e.state?.tab || 'life'; render(); } });

applySettings();
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
window.__pp = { get G() { return G; }, E }; // debugging and automated tests
