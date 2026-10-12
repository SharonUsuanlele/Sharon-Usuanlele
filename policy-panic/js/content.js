// Policy Panic content: data only. All people, parties, places and firms are fictional.
// Functions here read state but never mutate it; the engine applies the results.

export const N = n => {
  const a = Math.abs(n), sgn = n < 0 ? '−' : '';
  const t = a >= 1e9 ? (a / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
    : a >= 1e6 ? (a / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    : a >= 1e3 ? Math.round(a / 1e3) + 'k' : String(Math.round(a));
  return sgn + '₦' + t;
};

export const IND = { power: 'Electricity', jobs: 'Jobs & incomes', health: 'Healthcare', edu: 'Education', transport: 'Roads & transport', food: 'Food affordability', land: 'Land & housing security', env: 'Environment', debt: 'Public debt', trust: 'Public trust', inst: 'Courts & watchdogs', gov: 'Government money', resinc: 'Resource income', foreign: 'Foreign dependence', stab: 'Political stability' };
// How people live. Used for both the ward (local) and the country (nation).
export const SERVICES = ['jobs', 'food', 'power', 'health', 'edu', 'transport', 'land', 'env'];
// [what it is, why it matters in the game]
export const IND_INFO = {
  jobs: ['How many people earn a decent living.', 'Low jobs fuel protests and cost you votes.'],
  food: ['Whether ordinary families can afford food. High means affordable.', 'Expensive food causes anger and unrest quickly.'],
  power: ['How reliable the electricity is.', 'Blackouts hurt businesses, jobs and mood.'],
  health: ['Whether clinics and hospitals actually work.', 'Sick communities lose faith in their leaders.'],
  edu: ['Schools, teachers and classrooms.', 'Slow to change, but it shapes jobs over the years.'],
  transport: ['Roads, buses and how easily goods move.', 'Bad roads push prices up and tempers with them.'],
  land: ['How safe families are on their homes and farms.', 'Evictions and land grabs fuel protests and court cases.'],
  env: ['Clean water, soil and air.', 'Pollution makes people ill and ruins farming and fishing.'],
  debt: ['How much the government owes. High is bad.', 'Debt payments eat into government money.'],
  trust: ['Whether people believe the government will do what it says.', 'Low trust makes every reform and every election harder.'],
  inst: ['Courts, watchdogs and honest officials.', 'Strong ones catch cheats and enforce deals. Weak ones let money disappear.'],
  gov: ['The cash the government has to spend.', 'It sets the size of public budgets. Oil money can raise it without helping anyone.'],
  resinc: ['What the country earns from oil, gas and minerals.', 'It feeds government money. If institutions are weak, little of it reaches people.'],
  foreign: ['How much the country depends on foreign lenders and companies. High is risky.', 'It weakens your hand in negotiations.'],
  stab: ['How calm the country is.', 'Low stability means strikes, protests and voters in a punishing mood.'],
};

// Quarterly money. fund = typical small fundraising haul; unit = campaign spending scale.
export const ROLES = [
  { name: 'Community Figure', elected: false, salary: 0, living: 200e3, budget: 0, fund: 300e3, unit: 0, minAge: 18, from: [] },
  { name: 'Party Organiser', elected: false, salary: 150e3, living: 250e3, budget: 0, fund: 300e3, unit: 0, minAge: 18, from: [] },
  { name: 'Ward Councillor', elected: true, salary: 450e3, living: 400e3, budget: 3e6, fund: 600e3, unit: 1e6, minAge: 25, from: [0, 1] },
  { name: 'LG Chairperson', elected: true, salary: 2e6, living: 1e6, budget: 40e6, fund: 3e6, unit: 8e6, minAge: 30, from: [2] },
  { name: 'State Assembly Member', elected: true, salary: 3e6, living: 1.5e6, budget: 25e6, fund: 3e6, unit: 6e6, minAge: 30, from: [2, 3] },
  { name: 'Governor', elected: true, salary: 9e6, living: 4e6, budget: 400e6, fund: 40e6, unit: 200e6, minAge: 35, from: [3, 4, 6] },
  { name: 'Federal Legislator', elected: true, salary: 12e6, living: 5e6, budget: 60e6, fund: 8e6, unit: 20e6, minAge: 30, from: [3, 4] },
  { name: 'Senator', elected: true, salary: 15e6, living: 6e6, budget: 80e6, fund: 15e6, unit: 40e6, minAge: 35, from: [5, 6] },
  { name: 'President', elected: true, salary: 30e6, living: 10e6, budget: 2e9, fund: 80e6, unit: 500e6, minAge: 40, from: [5, 7] },
];

export const REGIONS = {
  marina: { name: 'Marina Coast', ward: 'Idera Ward', blurb: 'Dense, loud, media-hungry. Traffic and traders.', local: { power: 42, jobs: 44, health: 50, edu: 55, transport: 28, food: 40, land: 45, env: 45 }, title: 55 },
  creeks: { name: 'Delta Creeks', ward: 'Kpomu Creek Ward', blurb: 'Riverine and restless. Big money passes through; little stays.', local: { power: 35, jobs: 30, health: 40, edu: 45, transport: 38, food: 38, land: 35, env: 28 }, title: 30 },
  plains: { name: 'Savanna Plains', ward: 'Tudun Rai Ward', blurb: 'Farmland and long roads. Clinics are far; elders matter.', local: { power: 30, jobs: 45, health: 35, edu: 38, transport: 30, food: 45, land: 40, env: 50 }, title: 25 },
  hills: { name: 'Hill Country', ward: 'Gbagba Hill Ward', blurb: 'Mixed communities, farms and mines. Trust is fragile.', local: { power: 48, jobs: 42, health: 45, edu: 50, transport: 40, food: 48, land: 45, env: 55 }, title: 40 },
};

export const IDEOLOGIES = {
  welfare: { name: 'Pro-poor welfarist', blurb: 'Public money for public needs.', opp: 'market' },
  market: { name: 'Business-friendly reformer', blurb: 'Jobs come from enterprise.', opp: 'welfare' },
  community: { name: 'Community-first traditionalist', blurb: 'Respect elders, protect local ways.', opp: 'reform' },
  reform: { name: 'Clean-up crusader', blurb: 'Break the old system.', opp: 'community' },
};

export const PARTIES = { HUP: 'Harvest Unity Party', CAM: "Citizens' Accord Movement" };

export const CAST = {
  chair: { name: 'Chief Ikenna Oduya', role: 'Party chairman', blurb: 'Runs the ward party like a family business. Rewards loyalty, remembers slights.' },
  patron: { name: 'Alhaji Bello Yarima', role: 'Political godfather', blurb: 'Contractor, financier, kingmaker. His help is never free.' },
  rival: { name: 'Hon. Kelechi Wokoma', role: 'Rival aspirant', blurb: 'Smooth on radio, ruthless on posters. Wants your seat.' },
  press: { name: 'Ngozi Eze', role: 'Reporter, The Evening Ledger', blurb: 'Reads the budget line by line. Fair, but she prints.' },
  market: { name: 'Iya Sade', role: "Market women's leader", blurb: 'Speaks for four hundred traders and thousands of votes.' },
  youth: { name: 'Comrade Musa Dauda', role: 'Youth leader', blurb: 'Young, jobless, organised, and online.' },
  family: { name: 'Mama', role: 'Your mother', blurb: 'Proud of you, worried for you, and always asking for something small.' },
  elders: { name: 'Pa Akande', role: "Elders' council", blurb: 'Gives blessings slowly and withdraws them even slower.' },
  lawyer: { name: 'Barr. Ify Nwosu', role: 'Your lawyer', blurb: 'Expensive, discreet, and honest about your chances.' },
  donor: { name: 'Dr. Tayo Reis', role: 'Businessman and donor', blurb: 'Runs a logistics empire. Generous, and never forgets a favour.' },
  foreign: { name: 'Helen Marlowe', role: 'Continental Development Bank', blurb: 'Lends big and reads the small print out loud, exactly once.' },
};

export const WANTS = {
  chair: s => s.flags.retaliation ? 'He is punishing you for crossing him.' : s.rel.chair.o > 30 ? 'He expects you to back him when he asks.' : 'He wants to see you at party meetings.',
  patron: s => s.rel.patron.o > 50 ? 'He is about to call in what you owe.' : s.rel.patron.t > 30 ? 'He likes you, which is dangerous.' : 'He is watching to see if you are worth backing.',
  rival: s => 'He wants your seat and is collecting reasons to take it.',
  press: s => s.me.exposure > 30 ? 'She is digging into your finances.' : 'She wants a story with substance.',
  market: s => s.local.transport < 40 ? 'The traders want roads and fewer levies.' : 'The traders want you visible, not just promising.',
  youth: s => s.local.jobs < 45 ? 'They want jobs, not speeches.' : 'They want a seat at the table.',
  family: s => 'Someone in the family always needs school fees.',
  elders: s => 'They want respect and consultation.',
  lawyer: s => s.me.exposure > 30 ? 'She advises you to tidy your records. Quickly.' : 'She is on retainer. Hopefully idle.',
  donor: s => s.rel.donor.o > 30 ? 'He is waiting for his contract.' : 'He likes people who can be useful.',
  foreign: s => s.nation.debt > 60 ? 'She wants to talk about repayments.' : 'She has a loan to sell you.',
};

// ---- helpers used inside content ------------------------------------------------------
const W = s => REGIONS[s.player.region].ward;
const ROLE = s => s.office.role;
const sc = s => [1, 1, 1, 6, 5, 40, 8, 12, 100][ROLE(s)];
// Ripple: how much of a country-wide effect a player at this level can really cause.
const NS = [0.3, 0.3, 0.4, 0.6, 0.8, 1, 1, 1, 1.2];
const nf = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, s => v * NS[ROLE(s)]]));
const tl = s => REGIONS[s.player.region].title;
const eff = s => ROLE(s) >= 2 ? 1 : 0.6;
const paid = (s, n) => ROLE(s) >= 2 ? { budget: n * sc(s) } : { wealth: n };
const chk = (s, skill, base, per = 0.05) => Math.max(0.05, Math.min(0.95, base + per * s.me.skills[skill]));
const fundBase = s => ROLES[ROLE(s)].fund;
const own = (s, n) => ({ wealth: Math.round(n * (ROLE(s) >= 3 ? 3 : 1)) });
const ch = (label, stakes, text, fx, extra = {}) => ({ label, stakes, text, fx, ...extra });

// ---- origins ---------------------------------------------------------------------------
export const ORIGINS = {
  organiser: { name: 'Community Organiser', age: 31, wealth: 150e3, income: 250e3, me: { influence: 12, support: 38, loyalty: 25, rep: 58, exposure: 0 }, skills: { org: 5, speech: 3, fin: 1 }, rel: { market: 30, youth: 20 },
    blurb: 'You run the ward association and know every street.', strength: 'Grassroots trust', weakness: 'No money, no party backing' },
  loyalist: { name: 'Party Loyalist', age: 36, wealth: 400e3, income: 300e3, me: { influence: 24, support: 28, loyalty: 65, rep: 40, exposure: 2 }, skills: { org: 4, speech: 2, fin: 2 }, rel: { chair: 40, patron: 10 },
    blurb: 'Fifteen years of carrying chairs and counting delegates.', strength: 'Party machine', weakness: 'Seen as someone else’s man' },
  business: { name: 'Businessperson', age: 42, wealth: 12e6, income: 1.5e6, me: { influence: 15, support: 25, loyalty: 30, rep: 45, exposure: 8 }, skills: { org: 2, speech: 2, fin: 5 }, rel: { market: 20, lawyer: 25 },
    blurb: 'Your supermarkets employ sixty people and sponsor the carnival.', strength: 'Deep pockets', weakness: 'Outsider with contracts to explain' },
  activist: { name: 'Activist', age: 27, wealth: 100e3, income: 180e3, me: { influence: 8, support: 40, loyalty: 10, rep: 64, exposure: 0 }, skills: { org: 3, speech: 5, fin: 1 }, rel: { youth: 40, press: 25, chair: -15 },
    blurb: 'Your livestreams from council meetings made headlines.', strength: 'Youth and media goodwill', weakness: 'The party distrusts you' },
  dynasty: { name: 'Political Family', age: 34, wealth: 5e6, income: 600e3, me: { influence: 30, support: 35, loyalty: 55, rep: 35, exposure: 10 }, skills: { org: 3, speech: 3, fin: 3 }, rel: { patron: 35, chair: 20 }, obl: { patron: 20 },
    blurb: 'Your late father was a commissioner. People remember. So do his creditors.', strength: 'Name and connections', weakness: 'Debts and expectations' },
  professional: { name: 'Young Professional', age: 29, wealth: 3e6, income: 900e3, me: { influence: 6, support: 22, loyalty: 20, rep: 60, exposure: 0 }, skills: { org: 2, speech: 4, fin: 4 }, rel: { press: 10 },
    blurb: 'Back from a tech job abroad with savings and big ideas.', strength: 'Savings and credibility', weakness: 'Locals call you "JJC" (just come)' },
  fixer: { name: 'Local Problem Solver', age: 38, wealth: 600e3, income: 350e3, me: { influence: 14, support: 45, loyalty: 35, rep: 52, exposure: 0 }, skills: { org: 4, speech: 3, fin: 2 }, rel: { market: 30, family: 20, elders: 15 },
    blurb: 'Your generator workshop is where the whole ward comes with problems.', strength: 'Everyone knows you', weakness: 'No political platform yet' },
};

// ---- decisions (events) -------------------------------------------------------------------
// choice: { label, stakes[], text, fx, cost?, req?, roll?, lean?, go? }
// fx keys: wealth funds budget influence loyalty support rep exposure local nation rel skill flags debt news after role
export const EVENTS = {
  // ---------- origin introductions ----------
  intro_organiser: {
    scene: 'water', who: 'Iya Sade', title: 'No Water in the Ward',
    body: s => `The borehole on ${W(s)} Road died on Monday. Four hundred families queue at the creek with jerrycans. Iya Sade finds you at your gate. "You organise everything else. Organise this."`,
    pressure: 'Whoever fixes this becomes the name people remember at election time.',
    choices: [
      ch('Lead a delegation to the council', ['public', 'party'], 'You march forty women and a drum to the secretariat. A repair order is signed before the cameras notice.', { support: 8, influence: 5, rel: { chair: { t: -5 }, market: { t: 12 } }, local: { health: 4 }, news: [['radio', 'Market women storm council secretariat over dead borehole; repair order signed.']] }, { lean: 'welfare' }),
      ch('Raise a levy and fix it yourselves', ['money', 'public'], 'Everyone gives what they can. A welder, two plumbers and a Saturday later, the water runs.', { support: 6, rep: 5, rel: { market: { t: 15 } }, local: { health: 6 }, skill: { org: 1 } }, { cost: { wealth: 60e3 }, lean: 'community' }),
      ch('Film the creek and shame the council online', ['press', 'party'], 'The video travels. The council sends a truck within a day. The chairman sends you a message: "We should talk."', { support: 5, rep: 4, loyalty: -6, rel: { press: { t: 12 }, chair: { t: -12 } }, local: { health: 3 }, news: [['chatter', 'Viral clip: children fetch water from creek while council "awaits funds". #FixIt']] }, { lean: 'reform' }),
    ],
  },
  intro_loyalist: {
    scene: 'briefcase', who: 'Chief Ikenna Oduya', title: 'The Chairman’s Errand',
    body: s => `Ward congress is on Saturday. Chief Oduya hands you a bag. "Transport money for delegates. Make sure they know who sent them." It is heavy. Nobody is counting.`,
    pressure: 'Say yes and you are inside. Say no and you are just another volunteer.',
    choices: [
      ch('Deliver it quietly', ['party', 'law'], 'Delegates smile, shake your hand and remember the chairman. You are now someone he can use.', { loyalty: 10, exposure: 6, rel: { chair: { t: 15, o: 10 } }, influence: 4 }),
      ch('Offer to run the delegate mobilisation instead', ['money', 'party'], 'You turn the handout into a proper operation: lists, buses, receipts. Oduya is impressed, a little suspicious.', { loyalty: 5, influence: 6, rep: 3, rel: { chair: { t: 8 } }, skill: { org: 1 } }, { cost: { wealth: 80e3 } }),
      ch('Refuse politely', ['public', 'party'], 'You hand it back. "Not my style, Chief." The room goes quiet. Some delegates look at you differently, in both ways.', { loyalty: -12, rep: 6, support: 3, rel: { chair: { t: -15 } } }, { lean: 'reform' }),
    ],
  },
  intro_business: {
    scene: 'briefcase', who: 'Council procurement officer', title: 'The Market Contract',
    body: s => `Your firm has bid to rebuild the ${W(s)} market stalls. So has Chief Oduya’s brother. A procurement officer smiles over tea: "A ₦1M processing fee makes paperwork move faster."`,
    pressure: 'Everyone in your industry has been asked. Not everyone has said yes.',
    choices: [
      ch('Pay the fee', ['money', 'law'], 'The paperwork moves faster. The contract is yours, and so is a favour nobody wrote down.', { exposure: 12, rel: { chair: { t: 8, o: 10 } }, wealth: 1.5e6, news: [['chatter', 'How did a supermarket owner win the stalls contract in two weeks? Asking for a friend.']] }, { cost: { wealth: 1e6 } }),
      ch('Bid cleanly and take your chances', ['public'], 'You lose the contract to the chairman’s brother, but traders heard you refused to pay. That counts for something.', { rep: 8, support: 5, rel: { market: { t: 12 }, chair: { t: -4 } }, lean: 'reform' }, { lean: 'reform' }),
      ch('Withdraw and demand an open tender', ['press', 'party'], 'The Ledger runs your statement. The council schedules a public tender and the chairman is not pleased.', { rep: 8, influence: 5, loyalty: -8, rel: { press: { t: 12 }, chair: { t: -15 } }, nation: { inst: 1 }, news: [['ledger', 'Businessman demands open tender for ward market rebuild']] }, { lean: 'reform' }),
      ch('Partner with the chairman’s brother', ['party', 'money'], 'Profits split, risks shared. The chairman now considers you family.', { wealth: 600e3, loyalty: 8, exposure: 4, rel: { chair: { t: 18, o: 15 } } }),
    ],
  },
  intro_activist: {
    scene: 'megaphone', who: 'Chief Ikenna Oduya', title: 'The Fuel Queue March',
    body: s => `Your march over fuel scarcity has blocked ${W(s)} Junction for two days. Police have warned you. Then the party chairman invites you for "dialogue" and mentions a youth empowerment post, very quietly.`,
    pressure: 'The cameras are on you. The offer is real. So is the crowd behind you.',
    choices: [
      ch('Take the post and call off the march', ['party', 'money'], 'You get a title, a small salary and a lot of angry messages from people who called you comrade yesterday.', { wealth: 300e3, loyalty: 15, rep: -10, support: -4, rel: { youth: { t: -25 }, chair: { t: 15 } } }),
      ch('Keep marching', ['public', 'law'], 'Day three. Police tear-gas the crowd. You are carried on shoulders. The chairman is watching.', { rep: 8, support: 8, exposure: 3, rel: { youth: { t: 15 }, chair: { t: -15 } }, local: { transport: -2 } }, { lean: 'reform' }),
      ch('Negotiate a public dialogue with the council', ['public', 'party'], 'The council agrees to a town hall with the budget on the table. It is a small win with your name on it.', { influence: 8, rep: 5, support: 4, rel: { chair: { t: 3 }, youth: { t: 8 } }, skill: { speech: 1 } }, { lean: 'welfare' }),
    ],
  },
  intro_dynasty: {
    scene: 'house', who: 'Alhaji Bello Yarima', title: 'Your Father’s Shadow',
    body: s => `At the memorial reception, Alhaji Yarima embraces you. "Your father and I built this ward." Then he mentions, gently, a ₦3M facilitation loan your father never repaid. "The family name is an asset. Let us not waste it."`,
    pressure: 'His backing could carry you for a decade. It also owns you.',
    choices: [
      ch('Accept his backing and assume the debt', ['party', 'money'], 'The Alhaji arranges introductions and a campaign office. Everyone assumes you are his candidate. You are.', { influence: 10, loyalty: 6, rel: { patron: { t: 15, o: 25 } }, debt: { to: 'Alhaji Yarima', amount: 3e6, in: 8 } }),
      ch('Pay the debt from family savings', ['money'], 'You pay in full, in cash, in front of witnesses. He admires it, grudgingly. You are free, and poorer.', { rep: 6, rel: { patron: { t: 5 } } }, { cost: { wealth: 3e6 }, req: s => null }),
      ch('Publicly distance yourself from "old politics"', ['public', 'party'], 'You tell the Ledger you are your own person. Voters approve; the Alhaji does not forget.', { rep: 8, support: 6, influence: -6, rel: { patron: { t: -25 }, press: { t: 10 } } }, { lean: 'reform' }),
    ],
  },
  intro_professional: {
    scene: 'people', who: 'Pa Akande and the elders', title: 'Back From Abroad',
    body: s => `You return to ${W(s)} with savings, a laptop and a plan. The elders’ council receives you with polite doubt. "Many young people return with ideas. Few stay when the generator breaks."`,
    pressure: 'You have one chance to show you came to stay.',
    choices: [
      ch('Fund a youth coding hub with solar power', ['money', 'public'], 'Forty young people, a rooftop panel, and a waiting list. The ward starts calling it "your hub".', { rep: 5, support: 6, rel: { youth: { t: 20 } }, local: { jobs: 5, power: 3 } }, { cost: { wealth: 1.5e6 }, lean: 'market' }),
      ch('Sit with the elders and ask for their blessing', ['public', 'party'], 'You listen for three hours and leave with a goat and a nod. Not glamorous, but it opens doors.', { support: 6, influence: 4, rel: { elders: { t: 25 } } }, { lean: 'community' }),
      ch('Launch a policy page and start posting', ['press'], 'Your threads on electricity tariffs get shared widely. The elders do not read Chatter. Reporters do.', { rep: 6, rel: { press: { t: 15 }, elders: { t: -5 } }, skill: { speech: 1 } }, { lean: 'reform' }),
    ],
  },
  intro_fixer: {
    scene: 'people', who: 'Two motor-park unions', title: 'The Motor Park Dispute',
    body: s => `Two unions are fighting over who collects levies at the ${W(s)} motor park. Fists have flown. Both sides trust you, which is the problem. Everyone is watching what you do next.`,
    pressure: 'A fair deal makes you a peacemaker. A rigged one makes you someone’s man.',
    choices: [
      ch('Broker a fair rotation and publish the rules', ['public'], 'You draw up a rota on a chalkboard. It is not perfect, but both unions sign. The park is calm.', { support: 8, rep: 6, rel: { market: { t: 10 }, youth: { t: 5 } }, skill: { org: 1 } }, { lean: 'community' }),
      ch('Back the older union that supports the chairman', ['party', 'public'], 'The old union wins. The chairman sends thanks. The younger drivers do not.', { loyalty: 10, rel: { chair: { t: 12 }, youth: { t: -15 } }, support: -2, influence: 4 }),
      ch('Charge a mediation fee', ['money', 'law'], 'You take ₦250k “for logistics”. It pays for your trouble and gets talked about.', { wealth: 250e3, rep: -6, exposure: 4, support: 2 }),
    ],
  },

  // ---------- regular events ----------
  transformer: {
    scene: 'bolt', who: 'Iya Sade', title: 'The Transformer Blows',
    weight: s => s.local.power < 55 ? 6 : 1, cooldown: 6,
    body: s => `The ${W(s)} transformer exploded overnight. Three hundred households and the whole market are dark. Lumina Power asks for a ₦2M "community contribution" before sending a replacement.`,
    pressure: 'Fish are rotting in the market. People are asking who they voted for.',
    choices: [
      ch('Pay the contribution yourself', ['money', 'public'], 'A truck arrives that evening. People remember who paid.', { support: 7, rep: 4, local: { power: 12 } }, { cost: s => paid(s, 2e6) }),
      ch('Organise a household levy', ['public', 'party'], 'Some pay, some argue, but the transformer is replaced by Thursday.', { support: 3, rel: { market: { t: 8 } }, local: { power: 8 }, skill: { org: 1 } }, { roll: { p: s => chk(s, 'org', 0.45), hit: { text: 'The levy fills fast and people feel ownership.', fx: { support: 4, local: { power: 4 } } }, miss: { text: 'The levy falls short and tempers rise.', fx: { support: -3, rel: { market: { t: -4 } } } } } }),
      ch('Call the Alhaji to lean on Lumina Power', ['party', 'law'], 'One phone call, and a crew is there in three hours. The Alhaji says nothing about repayment, which is how you know it is coming.', { local: { power: 12 }, support: 5, rel: { patron: { t: 8, o: 22 } }, after: [{ in: 3, event: 'patron_calls', hint: 'The Alhaji will want something for the call he made.' }] }),
      ch('Petition Lumina publicly and go to the press', ['press'], 'The company drags its feet; the story does not. A crew arrives a few weeks later.', { support: 2, rel: { press: { t: 8 } }, local: { power: 3 }, after: [{ in: 2, outcome: 'power_restored', hint: 'Lumina may finally respond.' }] }),
    ],
  },
  contractor: {
    scene: 'road', who: 'Chief Ikenna Oduya', title: 'The Unfinished Road',
    weight: s => ROLE(s) >= 2 && !s.flags.contractorSeen ? 14 : 0, once: true,
    body: s => `Obafemi Roads & Bridges was paid for the ${W(s)} link road eighteen months ago. It is 40% done and the potholes are filling with rain. Chief Oduya, who recommended the firm, wants an extra ${N(2e6 * sc(s))} approved before the primaries. "A small thing, for stability."`,
    pressure: 'The chairman decides who gets the ticket. The road decides who gets the votes.',
    choices: [
      ch('Approve the extra payment', ['party', 'law'], 'The chairman beams. Work resumes for two weeks, then slows. You are now part of this contract.', { loyalty: 10, rel: { chair: { t: 15, o: 10 } }, exposure: 8, flags: { contractorPaid: true }, after: [{ in: 3, event: 'road_collapse', hint: 'Rains are coming. Cheap work does not survive rain.' }] }, { cost: s => ({ budget: 2e6 * sc(s) }), lean: 'market' }),
      ch('Demand an independent inspection', ['law', 'party'], 'Engineers find substandard materials. The contract is suspended. The chairman is not smiling.', { rep: 8, support: 4, exposure: -2, loyalty: -8, rel: { chair: { t: -20 }, press: { t: 8 } }, nation: { inst: 1 }, after: [{ in: 2, outcome: 'retaliation', hint: 'Oduya will remember this when tickets are decided.' }] }, { cost: s => ({ budget: 150e3 * sc(s) }), lean: 'reform' }),
      ch('Renegotiate: payment only against milestones', ['public', 'party'], 'The firm grumbles, then agrees. Work resumes, slowly. The chairman calls it "disrespectful but fair".', { rel: { chair: { t: -5 } }, support: -2, local: { transport: 3 }, after: [{ in: 2, outcome: 'road_done', hint: 'If the firm delivers, the road could finally open.' }] }, { roll: { p: s => chk(s, 'fin', 0.4), hit: { text: 'Your tight contract language holds.', fx: { rep: 3 } }, miss: { text: 'The firm finds a loophole and stalls.', fx: { support: -3, exposure: 2 } } } }),
      ch('Expose the arrangement publicly', ['press', 'party'], 'Your statement runs on the front page. The chairman’s phone rings all night. So does yours.', { rep: 12, support: 8, loyalty: -20, rel: { chair: { t: -35 }, patron: { t: -10 }, press: { t: 15 } }, nation: { inst: 2, trust: 1 }, news: [['ledger', 'Councillor exposes "bloated" road contract linked to party chairman']] }, { lean: 'reform', roll: { p: () => 0.45, hit: { text: 'The party hesitates to punish a hero.', fx: {} }, miss: { text: 'The party opens disciplinary proceedings.', fx: { after: [{ in: 2, outcome: 'party_sanction', hint: 'A disciplinary panel is forming.' }] } } } }),
    ],
  },
  road_collapse: {
    scene: 'road', who: 'The Evening Ledger', title: 'The Road Washes Away',
    body: s => `Three weeks of rain have undone the new ${W(s)} road. Ngozi Eze's photo of a minibus stuck to its axles is everywhere. Opponents are asking who approved the extra payment.`,
    pressure: 'This is the cost of the decision you made. What do you say?',
    choices: [
      ch('Blame the contractor and cancel the contract', ['public', 'party'], 'You cancel the contract loudly. It is true, but the questions about your signature do not go away.', { rep: -3, support: -2, exposure: 4, local: { transport: -6 }, rel: { chair: { t: -8 }, press: { t: -3 } } }, { cost: s => ({ budget: 300e3 * sc(s) }) }),
      ch('Quietly patch it with your own money', ['money'], 'Patches hold for a month. The story fades. No one thanks you, which is fine.', { support: 1, local: { transport: -2 } }, { cost: s => own(s, 600e3) }),
      ch('Blame the previous administration', ['public'], 'It half works. People are tired of excuses, but the opposition has no easy rebuttal.', { local: { transport: -6 }, support: -5, rep: -4, exposure: 3 }, { roll: { p: () => 0.4, hit: { text: 'The story shifts.', fx: { support: 5, rep: 3 } }, miss: { text: 'It sounds like an excuse.', fx: { support: -3 } } } }),
    ],
  },
  youth_protest: {
    scene: 'megaphone', who: 'Comrade Musa Dauda', title: 'Youths at the Gate',
    weight: s => ROLE(s) >= 1 && (s.local.jobs < 50 || s.me.support < 35 || s.nation.stab < 35) ? 6 : 0, cooldown: 8,
    body: s => `Two hundred graduates, a bin-lorry and a drum are at the council gate. Comrade Musa reads the placard: "SIX YEARS SINCE NYSC. WHAT ARE YOU DOING?" The crowd is growing.`,
    pressure: 'They are right about the jobs. They are also on camera.',
    choices: [
      ch('Meet them and announce a skills scheme', ['public', 'money'], 'You promise a one-year scheme and mean it. The crowd disperses. Now you have to deliver.', { support: 5, rel: { youth: { t: 12 } }, local: { jobs: 6 }, flags: { skillsScheme: true } }, { cost: s => paid(s, 1.5e6) }),
      ch('Join the march', ['public', 'party'], 'You walk with them. The photo goes viral. The party hates it.', { rep: 6, support: 6, loyalty: -8, rel: { youth: { t: 18 }, chair: { t: -10 } } }, { lean: 'reform' }),
      ch('Ask security to clear the gate', ['law', 'public'], 'The gate is cleared by noon. By evening, so is any warmth towards you.', { influence: 4, rep: -10, support: -8, rel: { youth: { t: -30 } } }, { roll: { p: () => 0.3, hit: { text: 'An officer slaps a protester. The clip travels.', fx: { rep: -8, exposure: 4, news: [['chatter', 'Police assault graduate at council gate. Who ordered this?']] } }, miss: { text: 'It stays orderly, but not forgiven.', fx: {} } } }),
      ch('Blame the opposition for stirring trouble', ['press'], 'It makes the evening news. It does not make jobs.', { support: -3 }, { roll: { p: s => chk(s, 'speech', 0.35), hit: { text: 'The narrative sticks.', fx: { support: 6, rel: { rival: { t: -8 } } } }, miss: { text: 'It backfires and you look defensive.', fx: { rep: -6, rel: { youth: { t: -10 } } } } } }),
    ],
  },
  fuel_shock: {
    scene: 'fuel', who: 'Radio Harmattan', title: 'Petrol Doubles Overnight',
    weight: s => s.q >= 3 ? 3 : 0, cooldown: 12,
    body: s => `Petrol price jumps again. Bus fares double in ${W(s)}. Radio Harmattan phone-ins are full of people asking what their leaders are doing about it.`,
    pressure: 'You didn’t cause this, but you’ll be blamed for it.',
    effects: { nation: { transport: -5, trust: -3, food: -3 }, local: { transport: -5, food: -3 } },
    choices: [
      ch('Subsidise bus fares for three months', ['money', 'public'], 'Queues shorten. The ward notices who picked up the bill.', { support: 6, local: { transport: 6 } }, { cost: s => paid(s, 1.2e6), lean: 'welfare' }),
      ch('Push the party for relief measures', ['party', 'public'], 'The chairman agrees to a communiqué. Nothing changes, but you are on record.', { loyalty: 3, influence: 3, support: 2, nation: { trust: 1 } }),
      ch('Work with traders to cap local prices', ['public', 'party'], 'Iya Sade’s network holds the line on food prices for a while.', { rel: { market: { t: 8 } }, local: { jobs: 2 } }, { lean: 'community', roll: { p: s => chk(s, 'org', 0.4), hit: { text: 'The price cap holds.', fx: { support: 6, rep: 3 } }, miss: { text: 'Some traders break ranks.', fx: { rel: { market: { t: -5 } } } } } }),
      ch('Say nothing; wait for it to pass', ['public'], 'Silence feels like a decision to many people.', { support: -4, rep: -2 }),
    ],
  },
  leak: {
    scene: 'phone', who: 'Chatter', title: 'Thread: “Where Does Your Money Come From?”',
    weight: s => s.me.exposure >= 20 ? 3 + s.me.exposure / 8 : s.rel.rival.t < -20 ? 2 : 0.3, cooldown: 6,
    body: s => `An anonymous Chatter thread claims you have taken kickbacks. It has 9,000 shares by breakfast. Ngozi Eze has called twice. ${s.me.exposure >= 25 ? 'You know there is some truth in it.' : 'You know it is mostly invented, but that never stops anything.'}`,
    pressure: 'Rumour travels faster than your answer will.',
    effects: { flags: { rumour: true } },
    choices: [
      ch('Deny it loudly', ['press'], 'You go on radio, jaw set.', { }, { roll: { p: s => 0.75 - s.me.exposure / 100, hit: { text: 'You sound credible. The thread goes quiet.', fx: { rep: 3, rel: { rival: { t: -5 } } } }, miss: { text: 'A screenshot surfaces that contradicts you.', fx: { rep: -10, exposure: 8, support: -4 } } } }),
      ch('Threaten a defamation suit', ['law', 'money'], 'Your lawyer sends a letter. It either scares them or tells everyone you are worried.', { rel: { lawyer: { t: 5 } } }, { cost: s => own(s, 300e3), roll: { p: s => s.me.exposure < 25 ? 0.75 : 0.25, hit: { text: 'The author deletes the thread.', fx: { rep: 4 } }, miss: { text: 'A bigger account republishes it with “threats” added.', fx: { rep: -6, exposure: 5 } } } }),
      ch('Publish your accounts', ['public', 'law'], s => s.me.exposure < 30 ? 'You publish a clean summary. Journalists shrug, which is the best outcome you could hope for.' : 'The accounts hold up but invite more questions.', { rep: 5, exposure: -6 }, { req: s => s.me.exposure >= 45 ? 'Too much to explain right now.' : null, lean: 'reform' }),
      ch('Ignore it', ['press'], 'Silence feels dignified until it doesn’t.', { support: -2, exposure: -2 }),
    ],
  },
  clinic: {
    scene: 'health', who: 'HealthBridge Africa', title: 'Clinic Without Equipment',
    weight: s => ROLE(s) >= 1 && s.local.health < 60 ? 5 : 0, cooldown: 8,
    body: s => `The ${W(s)} health centre has one working fridge and no delivery bed. NGO HealthBridge Africa will match any funds you raise. Separately, a supplier close to the chairman offers cheaper equipment and a "15% commitment fee" for you.`,
    pressure: 'Midwives are asking for gloves. Patrons are asking for loyalty.',
    choices: [
      ch('Match the NGO grant', ['money', 'public'], 'New beds, fridges and a proper delivery room. The ward is proud.', { support: 6, rep: 6, local: { health: 14 }, nation: { inst: 1 }, news: [['radio', 'HealthBridge, ward leaders open upgraded health centre']] }, { cost: s => paid(s, 2.5e6), lean: 'welfare' }),
      ch('Take the supplier’s deal', ['money', 'law'], 'Equipment arrives on time. The “fee” lands in your account. The equipment is cheaper and so are the warranties.', { wealth: 600e3, exposure: 10, local: { health: 5 }, rel: { chair: { t: 8, o: 10 } }, news: [['chatter', 'New clinic equipment looks "second-hand", say nurses']] }, { lean: 'market' }),
      ch('Ask the party to fund it', ['party'], 'The chairman will "see what he can do". He will, and it will cost you.', { loyalty: 5, rel: { chair: { o: 15 } }, local: { health: 4 } }),
      ch('Decline both for now', ['public'], 'Nobody is offended, nobody is helped.', { support: -2 }),
    ],
  },
  patron_calls: {
    scene: 'phone', who: 'Alhaji Bello Yarima', title: 'The Alhaji Calls',
    weight: s => s.rel.patron.o >= 40 && !s.flags.patronBusy ? 6 : 0, cooldown: 8,
    body: s => `Alhaji Yarima's driver brings an invitation. Over pepper soup, he says: "You remember that thing I did? I need something small." He needs ${s.office.budget > 0 ? 'a ward contract awarded to his cousin’s firm, no questions' : 'your public endorsement of his candidate, no questions'}.`,
    pressure: 'You can’t pay back a godfather with thank-you notes.',
    choices: [
      ch('Do as he asks', ['party', 'law'], 'He is pleased. You know a ledger now exists somewhere with your name on it.', { exposure: 10, influence: 8, loyalty: 5, rel: { patron: { t: 15, o: -30 } }, budget: s => s.office.budget > 0 ? -Math.min(s.office.budget, 800e3 * sc(s)) : 0, wealth: 200e3 }),
      ch('Repay him in cash instead', ['money'], 'You count out the money. He looks disappointed — he preferred the favour.', { rel: { patron: { t: -3, o: -35 } } }, { cost: s => own(s, 1.2e6) }),
      ch('Stall and negotiate a smaller favour', ['party'], 'A compromise: you will speak at his rally. It is not nothing, but it is less.', { rel: { patron: { t: -2, o: -15 } }, influence: 3, support: -2, rep: -2 }),
      ch('Refuse and accept the consequences', ['public', 'party'], 'Silence. Then: "I see." You leave. The door closes softly, which is worse.', { rep: 5, influence: -10, rel: { patron: { t: -45, o: -50 } }, flags: { patronEnemy: true } }, { lean: 'reform' }),
    ],
  },
  probe: {
    scene: 'scales', who: 'Federal Integrity Bureau', title: 'A Letter From the Bureau',
    body: s => `A courier delivers a letter on thick paper: the Federal Integrity Bureau is "reviewing certain transactions" connected to you and requests records within fourteen days. Ngozi Eze already knows.`,
    pressure: 'What you’ve done and what can be proved are two different things.',
    choices: [
      ch('Cooperate fully and open the books', ['law', 'public'], s => s.me.exposure <= 30 ? 'The records are clean enough. The Bureau thanks you.' : 'The books raise more questions than they answer.', {}, { roll: { p: s => 0.9 - s.me.exposure / 100 + s.nation.inst / 400, hit: { text: 'You are cleared of wrongdoing, for now.', fx: { exposure: -18, rep: 8, flags: { probe: false } } }, miss: { text: 'They find something. A fine, a leak, a headline.', fx: { exposure: -8, rep: -12, support: -6, wealth: -300e3, flags: { probe: false } } } } }),
      ch('Hire a top lawyer and delay', ['law', 'money'], 'Your lawyer files motions. The case drags on, which is itself a result.', { exposure: -4, rel: { lawyer: { t: 15 } }, flags: { lawyer: true }, after: [{ in: 3, event: 'court', hint: 'This is likely headed to court.' }] }, { cost: s => own(s, 1.5e6) }),
      ch('Call the Alhaji to "settle quietly"', ['party', 'law'], 'He says he will make a call. He always does.', { rel: { patron: { o: 30 } }, exposure: -8 }, { req: s => s.rel.patron.t < -10 ? 'The Alhaji is no longer taking your calls.' : null, roll: { p: s => 0.35 + Math.max(0, s.rel.patron.t) / 150 - s.nation.inst / 400, hit: { text: 'The file goes missing. You owe him dearly.', fx: { exposure: -15, flags: { probe: false }, rep: -2 } }, miss: { text: 'The call fails and the Bureau notes the attempt.', fx: { exposure: 12, rep: -8, flags: { probe: false } } } } }),
      ch('Call it a witch-hunt', ['press', 'public'], 'You rally supporters outside the Bureau. Half see a victim, half see a guilty person shouting.', { }, { roll: { p: s => 0.3 + s.me.support / 250, hit: { text: 'Supporters believe you. The Bureau is cautious.', fx: { support: 8, exposure: -5, flags: { probe: false } } }, miss: { text: 'The shouting makes you look guilty.', fx: { support: -8, rep: -10, exposure: 6, after: [{ in: 3, event: 'court', hint: 'The Bureau will press on.' }], flags: { probe: false } } } } }),
    ],
  },
  court: {
    scene: 'scales', who: 'High Court', title: 'Judgment Day',
    body: s => `After months of adjournments, the High Court sits. ${s.flags.lawyer ? 'Barr. Nwosu looks tired but calm.' : 'You are represented by a junior lawyer.'} Outside, supporters and reporters mingle.`,
    pressure: 'Your reputation, seat and freedom ride on one ruling.',
    choices: [
      ch('Stand before the judge', ['law'], 'Everyone stands.', {}, { roll: { p: s => Math.max(0.1, Math.min(0.9, 0.9 - s.me.exposure / 110 + (s.flags.lawyer ? 0.1 : 0) + (s.nation.inst - 50) / 300)), hit: { text: 'Acquitted. The judge cites “insufficient evidence”. Your supporters cheer.', fx: { exposure: -25, rep: 8, support: 6, flags: { probe: false } } }, miss: { text: 'Convicted. A fine, a ban from the next election and a very bad week.', fx: { exposure: -25, rep: -20, support: -15, wealth: -1e6, influence: -15, flags: { barred: true, probe: false } } } } }),
    ],
  },
  defection: {
    scene: 'handshake', who: 'Dr. Halima Sarkin-Aji', title: 'A Quiet Offer From the Other Side',
    weight: s => s.player.party === 'HUP' && (s.me.loyalty < 40 || s.flags.retaliation) && ROLE(s) < 4 ? 8 : 0, cooldown: 12,
    body: s => `Dr. Halima Sarkin-Aji of the Citizens' Accord Movement meets you at a wedding. "We would give you the ticket and ${N(1.5e6 * Math.max(1, sc(s) / 2))} for the campaign. Think about it." Her smile says she already has the headline written.`,
    pressure: 'Party loyalty is a currency. So is betrayal.',
    choices: [
      ch('Accept and defect', ['party', 'public'], 'You switch parties. It is the lead story. Your old friends are furious; new friends are cautious.', { funds: s => 1.5e6 * Math.max(1, sc(s) / 2), rep: -8, support: -4, influence: 4, rel: { chair: { t: -50 }, patron: { t: -15 } }, flags: { defected: true, retaliation: false, discipline: false }, news: [['ledger', 'Defection! Rising councillor ditches HUP for CAM']], party: 'CAM' }),
      ch('Decline and tell the chairman', ['party'], 'Chief Oduya is moved, or at least pleased to be asked. You are, for now, theirs.', { loyalty: 12, rel: { chair: { t: 15 } }, rep: 2 }),
      ch('Keep her number and play both sides', ['party', 'press'], 'You say neither yes nor no. In politics, that is also a message.', { influence: 3 }, { roll: { p: () => 0.5, hit: { text: 'Both sides court you. Everyone gets nervous.', fx: { influence: 5, loyalty: 3 } }, miss: { text: 'A word reaches Oduya. He is not amused.', fx: { rep: -8, loyalty: -8, rel: { chair: { t: -15 } } } } } }),
    ],
  },
  school_fees: {
    scene: 'house', who: 'Mama', title: 'Tolu’s School Fees',
    weight: s => 3, cooldown: 10,
    body: s => `Mama calls on a Sunday. Your cousin Tolu has been admitted to a polytechnic; fees are ₦400k. Another cousin wants "a small job" at the council. "You are the one who reached the top of the family. Others just want to be seen."`,
    pressure: 'Family doesn’t care how complicated your budget is.',
    choices: [
      ch('Pay the fees', ['money', 'family'], 'Tolu cries. Mama tells the whole church. Your account is lighter but your phone is warmer.', { rep: 3, support: 1, rel: { family: { t: 20 } } }, { cost: { wealth: 400e3 } }),
      ch('Find the cousin a council post', ['family', 'law'], 'He starts Monday. Nobody asks what he does. Someone will.', { rel: { family: { t: 15 } }, exposure: 5, rep: -3, loyalty: 2 }, { req: s => ROLE(s) < 2 ? 'You need an office to hand out posts.' : null }),
      ch('Explain gently that you can’t help right now', ['family'], 'Mama sighs. She understands, a little.', { rel: { family: { t: -10 } }, rep: 2 }),
      ch('Borrow from the Alhaji', ['family', 'party'], 'He lends it with a smile and a long memory.', { rel: { patron: { t: 5, o: 12 }, family: { t: 15 } }, debt: { to: 'Alhaji Yarima', amount: 400e3, in: 6 } }),
    ],
  },
  townhall: {
    scene: 'megaphone', who: 'Hon. Kelechi Wokoma', title: 'Live Radio Town Hall',
    weight: s => ROLE(s) >= 1 || s.q >= 2 ? 4 : 0, cooldown: 8,
    body: s => `Radio Harmattan is hosting a live town hall. Hon. Wokoma has packed the front row. A caller says what everyone is thinking: "What have you done for this ward?"`,
    pressure: 'Four thousand people are listening. What you say becomes the story.',
    choices: [
      ch('Answer calmly with facts', ['press'], 'You stay factual and a little dull.', { skill: { speech: 1 } }, { roll: { p: s => chk(s, 'speech', 0.5), hit: { text: 'Calm authority. The phone-in lines light up with approval.', fx: { support: 5, rep: 4 } }, miss: { text: 'You stumble over a figure. Wokoma pounces.', fx: { support: -3, rep: -2 } } } }),
      ch('Tell a personal story', ['public'], 'You tell them about your mother’s kitchen and a night without light. It lands.', { support: 5, rel: { elders: { t: 4 } } }, { lean: 'community' }),
      ch('Attack Wokoma’s record', ['press', 'party'], 'The room gasps, then laughs, then argues. It is memorable.', { rel: { rival: { t: -15 }, press: { t: 3 } } }, { roll: { p: s => chk(s, 'speech', 0.4), hit: { text: 'He has no good answer.', fx: { support: 5 } }, miss: { text: 'You look petty.', fx: { rep: -5, support: -3 } } } }),
      ch('Promise jobs for 500 youths within a year', ['public'], 'The crowd roars. You’ve made a promise you must now keep.', { support: 9, rep: -2, flags: { bigPromise: true }, after: [{ in: 4, outcome: 'promise_due', hint: 'People will check if the jobs came.' }] }),
    ],
  },
  minigrid: {
    scene: 'bolt', who: 'Sunrise Power Partners', title: 'The Solar Mini-Grid Pitch',
    weight: s => s.local.power < 60 && ROLE(s) >= 2 ? 4 : 0, once: true,
    body: s => `Sunrise Power Partners proposes a solar mini-grid for ${W(s)}. They need a land allocation and permits. Bureaucrats whisper that "processing" could take a year, or a month, depending.`,
    pressure: 'Reliable power transforms a ward. So does a reliable bribe.',
    choices: [
      ch('Fast-track the permits with local hiring terms', ['public', 'party'], 'You sign with local-content clauses. Sunrise grumbles, then agrees.', { support: 4, rep: 4, local: { power: 3 }, nation: { inst: 1 }, after: [{ in: 2, outcome: 'minigrid_live', hint: 'The panels could be lit within two quarters.' }] }, { lean: 'market' }),
      ch('Ask for a “facilitation fee”', ['money', 'law'], 'Sunrise pays, thinks, and later tells a journalist.', { wealth: 1.2e6, exposure: 12, local: { power: 3 }, after: [{ in: 2, outcome: 'minigrid_live', hint: 'The grid is still coming — the question is who knows.' }] }),
      ch('Stall to negotiate better local jobs', ['public'], 'Eight weeks of letters later, Sunrise is still interested. Mostly.', { local: { jobs: 3 } }, { roll: { p: s => chk(s, 'fin', 0.45), hit: { text: 'You win real hiring commitments.', fx: { local: { jobs: 5 }, after: [{ in: 3, outcome: 'minigrid_live', hint: 'Sunrise may still build.' }] } }, miss: { text: 'Sunrise goes to the next ward.', fx: { support: -3, local: { power: -2 } } } } }),
      ch('Decline politely', ['public'], 'Nothing changes, which is also a decision.', { support: -2 }),
    ],
  },
  flood: {
    scene: 'wave', who: 'Radio Harmattan', title: 'Flood Relief Trucks',
    weight: s => (s.q % 4 === 2) && ['creeks', 'marina'].includes(s.player.region) ? 8 : 0, cooldown: 8,
    body: s => `Floods cut off parts of ${W(s)}. Relief trucks arrive from the state emergency agency with rice, mattresses and sachet water. Several local officials crowd around, each with "lists".`,
    pressure: 'Hungry people can see the trucks. They will also see where the trucks go.',
    choices: [
      ch('Supervise distribution personally and publish the list', ['public', 'press'], 'It is slow, tiring and public. Nobody can say you diverted anything.', { rep: 8, support: 7, nation: { inst: 1 }, rel: { press: { t: 8 }, chair: { t: -4 } } }, { lean: 'reform' }),
      ch('Let party coordinators handle it', ['party', 'law'], 'Supporters get rice first, others wait. Some mattresses are sold on Monday.', { loyalty: 8, support: 2, exposure: 7, rel: { chair: { t: 8 } }, news: [['chatter', 'Flood mattresses seen in Iyana market. Who sold them?']] }),
      ch('Take over the whole thing and sell some surplus', ['money', 'law'], 'You sell some bags “to cover transport”. It is a lot of rice.', { wealth: 500e3, exposure: 14, rep: -8 }),
      ch('Appeal to NGOs for extra aid', ['public', 'press'], 'Two NGOs respond. The trucks come faster.', { support: 4, rep: 2, local: { health: 3 } }),
    ],
  },
  after_defeat: {
    scene: 'people', who: 'Mama', title: 'After the Count',
    body: s => `The results are final. You are no longer in the race. The campaign office is quiet, the posters are peeling, and a few people have stopped answering your calls. But some still do.`,
    pressure: 'Politics is long. What you do now defines the comeback, if there is one.',
    choices: [
      ch('Go back to the community and rebuild', ['public'], 'You hold meetings in compounds and listen to what you missed. It is humbling.', { support: 6, rep: 5, rel: { market: { t: 8 }, youth: { t: 8 } }, skill: { org: 1 } }, { lean: 'community' }),
      ch('Petition the election tribunal', ['law', 'money'], 'Your lawyer files evidence of irregularities. Anything could happen.', { rel: { lawyer: { t: 10 } }, flags: { tribunal: true }, after: [{ in: 3, outcome: 'tribunal', hint: 'The tribunal may rule on your petition.' }] }, { cost: s => own(s, 1.5e6), req: s => s.election.last && s.election.last.margin <= 12 ? null : 'Your loss was too wide to challenge credibly.' }),
      ch('Join the winner’s team as an aide', ['party', 'money'], 'You swallow your pride and accept a modest role. Doors reopen slowly.', { loyalty: 12, wealth: 250e3, influence: 3, rel: { chair: { t: 10 } }, rep: -3 }),
    ],
  },
  intro_default: { scene: 'people', who: 'Mama', title: 'First Steps', body: () => 'You decide to enter politics.', pressure: '', choices: [ch('Begin', [], 'The journey begins.', {})] },
};

// Automatic delayed consequences (no choice, narrated in the quarter summary).
export const OUTCOMES = {
  road_done: s => ({ text: `The ${W(s)} link road opens, finally. Taxi drivers honk their approval.`, fx: { local: { transport: 10 }, support: 5, rep: 3, news: [['radio', `${W(s)} link road opens after two-year delay.`]] } }),
  retaliation: s => ({ text: 'Chief Oduya’s allies are quietly telling delegates you are “not a team player”.', fx: { flags: { retaliation: true }, loyalty: -5, rel: { chair: { t: -5 } } } }),
  party_sanction: s => ({ text: 'The party disciplinary committee suspends your membership rights for a few months.', fx: { flags: { discipline: true }, loyalty: -15, influence: -5, news: [['ledger', 'Party disciplines councillor over public criticism']] } }),
  power_restored: s => ({ text: 'After public pressure, Lumina Power finally replaces the transformer.', fx: { local: { power: 8 }, support: 2 } }),
  minigrid_live: s => ({ text: 'The mini-grid switches on. Cold-room stalls, barbers and a small clinic have steady power for the first time.', fx: { local: { power: 12, jobs: 4 }, support: 4, rep: 2, nation: { trust: 1 }, news: [['radio', 'Solar mini-grid switches on; traders celebrate.']] } }),
  promise_due: s => s.local.jobs >= 55 ? { text: 'People check. The jobs scheme has delivered enough to count. Your promise looks credible.', fx: { support: 8, rep: 5, flags: { bigPromise: false } } } : { text: 'A year later, the jobs are not there. Wokoma replays your town hall clip every week.', fx: { support: -12, rep: -8, rel: { youth: { t: -15 } }, flags: { bigPromise: false } } },
  tribunal: (s, r) => {
    const l = s.election.last;
    return l && r < 0.35 + s.nation.inst / 250 && l.margin <= 12
      ? { text: 'The tribunal finds irregularities and awards you the seat.', fx: { role: l.target, influence: 8, support: 6, rep: 4, news: [['ledger', 'Tribunal reverses result']] } }
      : { text: 'The tribunal dismisses your petition for lack of evidence. The headline is brief.', fx: { rep: -3, support: -2, news: [['ledger', 'Tribunal dismisses petition']] } };
  },
};

// ---- moves: free actions each quarter (two per quarter) -----------------------------------
const stakeNone = [];
export const MOVES = {
  visit: { icon: 'people', name: 'Walk the ward', sub: 'Visit people, build trust',
    title: 'Walk the Ward', who: 'Out and about', scene: 'people', body: s => `Where do you spend today in ${W(s)}?`, pressure: '',
    choices: [
      ch('Market and motor park', ['public'], 'You buy yams, shake hands and hear every grievance twice.', { support: 4, rel: { market: { t: 8 } } }),
      ch('Churches, mosques and elders’ meeting', ['public'], 'You sit through a long sermon, a long prayer and a short, valuable conversation.', { support: 3, rep: 2, rel: { elders: { t: 8 } } }),
      ch('Youth hangout and football viewing centre', ['public'], 'You lose an argument about the league and win a few sceptics.', { support: 3, rel: { youth: { t: 8 } } }),
    ] },
  fundraise: { icon: 'money', name: 'Raise campaign money', sub: 'Add to campaign funds',
    title: 'Raise Campaign Funds', who: 'Your phone', scene: 'briefcase', body: s => 'Money for rallies, posters and ward agents has to come from somewhere. Where?', pressure: 'Every naira comes with a story about who gave it.',
    choices: [
      ch('Small donors and supporters', ['public'], 'Small amounts from many hands. It takes time but it’s clean.', { funds: s => fundBase(s), rep: 2, support: 1 }),
      ch('Business friends and associations', ['money', 'party'], 'Contractors and traders give — and make polite notes about what they might need later.', { funds: s => Math.round(fundBase(s) * 2.5), rel: { market: { o: 6 } }, exposure: 3 }),
      ch('The Alhaji’s envelope', ['party', 'law'], 'A large sum, delivered by a driver in a car with tinted windows.', { funds: s => fundBase(s) * 6, exposure: 6, loyalty: 3, rel: { patron: { t: 5, o: 25 } } }),
    ] },
  project: { icon: 'house', name: 'Fund a project', sub: 'Improve the ward',
    title: 'Fund a Project', who: 'Your desk', scene: 'house', body: s => ROLE(s) >= 2 ? `Your office has ${N(s.office.budget)} in public funds. Use it or lose some next quarter.` : 'You’re not in office, so this comes out of your own pocket. It buys less.', pressure: 'Visible results are the best campaign poster.',
    choices: [
      ch('Borehole and solar street lights', ['public', 'money'], 'The lights come on at dusk. Children play outside and no one trips.', { support: s => Math.round(3 * eff(s)), local: { power: s => Math.round(8 * eff(s)), health: s => Math.round(3 * eff(s)) } }, { cost: s => paid(s, 1.5e6) }),
      ch('Patch the main road', ['public', 'money'], 'The drivers stop swearing. For a while.', { support: s => Math.round(3 * eff(s)), local: { transport: s => Math.round(9 * eff(s)) } }, { cost: s => paid(s, 1.5e6) }),
      ch('Repair classrooms and desks', ['public', 'money'], 'Teachers hold a thank-you event. Parents bring more chairs than needed.', { support: s => Math.round(3 * eff(s)), local: { edu: s => Math.round(9 * eff(s)) } }, { cost: s => paid(s, 1.5e6) }),
      ch('Grants for traders and apprentices', ['public', 'money'], 'A hundred small businesses get a boost. Some will fail; some will stand.', { support: s => Math.round(3 * eff(s)), local: { jobs: s => Math.round(8 * eff(s)) } }, { cost: s => paid(s, 1.5e6) }),
    ] },
  party: { icon: 'handshake', name: 'Court the party', sub: 'Loyalty, tickets, backers',
    title: 'Court the Party', who: 'Chief Ikenna Oduya', scene: 'handshake', body: s => 'The party decides who gets tickets. Which relationship do you work on?', pressure: 'Every favour you ask is a favour you owe.',
    choices: [
      ch('Attend the chairman’s strategy dinner', ['party'], 'You are seen in the right chair at the right table.', { loyalty: 8, influence: 3, rel: { chair: { t: 8 } } }, { cost: { wealth: 100e3 } }),
      ch('Ask for a party post', ['party'], 'You make your case. Chief Oduya says he will "think about it".', {}, { req: s => ROLE(s) !== 0 ? 'Only available to Community Figures.' : s.me.loyalty < 35 ? 'Loyalty 35+ needed.' : null, roll: { p: s => 0.2 + s.me.loyalty / 150 + Math.max(0, s.rel.chair.t) / 300, hit: { text: 'You are named ward party organiser.', fx: { role: 1, influence: 8, loyalty: 4, rel: { chair: { t: 5 } } } }, miss: { text: 'Not yet.', fx: { loyalty: -3 } } } }),
      ch('Seek the Alhaji’s blessing', ['party', 'money'], 'Tea, small talk, and a hint of future help.', { influence: 6, rel: { patron: { t: 10, o: 10 } } }),
    ] },
  media: { icon: 'phone', name: 'Work the media', sub: 'Interviews, coverage, leaks',
    title: 'Work the Media', who: 'Ngozi Eze', scene: 'phone', body: s => 'Radio, newspapers and Chatter shape how the ward sees you. What is your angle?', pressure: 'Tomorrow’s headline starts with today’s decision.',
    choices: [
      ch('Radio phone-in', ['press'], 'You take calls for an hour and learn something every time.', {}, { roll: { p: s => chk(s, 'speech', 0.55), hit: { text: 'Warm, funny, credible.', fx: { support: 5, rep: 3, rel: { press: { t: 3 } } } }, miss: { text: 'You answer a loaded question badly.', fx: { support: -3 } } } }),
      ch('Pay for "friendly coverage"', ['money', 'law'], 'A glossy supplement appears. The Ledger notices.', { rep: 3, support: 3, exposure: 3, rel: { press: { t: -4 } } }, { cost: { wealth: 250e3 } }),
      ch('Leak a rival’s secret', ['press', 'party'], 'A reporter gets an anonymous message. Fingers cross.', { rel: { rival: { t: -15 }, press: { t: 5 } }, support: 3 }, { roll: { p: () => 0.35, hit: { text: 'The leak is traced to a "source close to the matter".', fx: { exposure: 8, rep: -6 } }, miss: { text: 'It sticks and he stumbles.', fx: { support: 3 } } } }),
    ] },
  earn: { icon: 'briefcase', name: 'Earn a living', sub: 'Add to personal wealth',
    title: 'Earn a Living', who: 'Your work', scene: 'briefcase', body: s => 'Politics costs money. What are you doing about it?', pressure: 'Legitimate income keeps you independent.',
    choices: [
      ch('Take consulting or contract work', ['money'], 'A few good weeks. Fees land in your account.', { wealth: s => Math.round(ORIGINS[s.player.origin].income * 1.2) }),
      ch('Push your business hard', ['money'], 'A bad quarter for sleep, a good one for your accounts.', { wealth: s => Math.round(ORIGINS[s.player.origin].income * 0.6) }, { roll: { p: () => 0.5, hit: { text: 'A great month. Orders flood in.', fx: { wealth: s => Math.round(ORIGINS[s.player.origin].income * 1.6) } }, miss: { text: 'A supplier lets you down.', fx: { rep: -1 } } } }),
    ] },
  train: { icon: 'book', name: 'Sharpen yourself', sub: 'Learn a political skill',
    title: 'Sharpen Yourself', who: 'You', scene: 'book', body: s => 'Politics rewards people who learn quickly. Which skill do you build?', pressure: 'Skills improve odds in organising, speeches and money matters.',
    choices: [
      ch('Organising workshop', ['public'], 'You learn how to turn one volunteer into twenty.', { skill: { org: 1 } }, { cost: { wealth: 150e3 } }),
      ch('Public speaking coach', ['press'], 'You find your voice, and your volume knob.', { skill: { speech: 1 } }, { cost: { wealth: 150e3 } }),
      ch('Public finance short course', ['law'], 'Budgets stop being scary.', { skill: { fin: 1 } }, { cost: { wealth: 150e3 } }),
    ] },
  family: { icon: 'house', name: 'Family time', sub: 'Lie low, rebuild goodwill',
    title: 'Family Time', who: 'Mama', scene: 'house', body: s => 'A quiet Sunday. No cameras.', pressure: '',
    choices: [
      ch('Sunday lunch with the family', ['family'], 'Rice, laughter and a lot of unsolicited advice.', { rel: { family: { t: 10 } }, rep: 1, exposure: -2 }),
    ] },
};

export const SOURCES = { ledger: 'The Evening Ledger', radio: 'Radio Harmattan', chatter: 'Chatter', official: 'Official Gazette' };

// =====================================================================================
// Country-level stories: land, resources, foreign influence, survival, ordinary lives.
// Effects on the nation are scaled by nf(): a councillor ripples less than a governor.
// =====================================================================================
const revenue = { in: 2, outcome: 'oil_revenue', hint: 'Money should start reaching the government.' };

Object.assign(EVENTS, {
  // ---------- natural resources ----------
  oil_deal: {
    scene: 'fuel', who: 'Meridian Delta Petroleum', title: 'The Oil Expansion',
    weight: s => !s.flags.oilLive && !s.flags.oilStalled && !s.flags.oilGone && s.q >= 2 ? 5 : 0, once: true,
    body: s => `Meridian Delta Petroleum, a foreign-owned company, wants to expand drilling near ${W(s)}, where families live off farming and fishing. It promises jobs and a big payment to the government. ${ROLE(s) >= 4 ? 'The state looks to you for the final yes.' : 'The state will not approve it without local sign-off, and your voice carries weight.'} Residents fear losing land and breathing the smoke.`,
    pressure: 'The government needs the money. The creek feeds a thousand families.',
    choices: [
      ch('Approve it quickly', ['money', 'public', 'law'], 'Meridian is delighted and the first payment lands within weeks. Residents were never asked, and they know it.',
        { support: -4, rep: -3, rel: { youth: { t: -8 }, elders: { t: -8 } }, local: { jobs: 3, env: -4, land: -3 }, nation: nf({ gov: 6, resinc: 10, foreign: 3, trust: -2 }), flags: { oilLive: true, oilNoConsult: true }, after: [revenue, { in: 3, event: 'oil_spill', hint: 'Rushed approvals skip safety checks. Pollution may follow.' }] }),
      ch('Renegotiate: safeguards, compensation, local jobs', ['law', 'public', 'money'], 'You put three demands on the table: a clean-up guarantee, pay for affected families, and local hiring. Meridian\'s lawyers go quiet.',
        { rep: 2 }, { roll: { p: s => 0.3 + 0.05 * s.me.skills.fin + (s.nation.inst - 45) / 200 + (s.nation.gov - 45) / 250 - (s.nation.foreign - 45) / 250,
          hit: { text: 'Meridian blinks. You get safeguards, a compensation fund and 200 local jobs.', fx: { support: 5, rep: 4, local: { jobs: 6, env: -1 }, nation: nf({ gov: 5, resinc: 7, trust: 1, foreign: 1 }), flags: { oilLive: true, oilSafeguards: true }, after: [revenue] } },
          miss: { text: 'Meridian threatens to take its money elsewhere. Talks stall and investors grumble.', fx: { support: -2, flags: { oilStalled: true }, rel: { patron: { t: -6 } }, after: [{ in: 3, event: 'oil_return', hint: 'The company may come back, with different terms.' }] } } } }),
      ch('Delay until the community is consulted', ['public'], 'You tell Meridian: no signature until families have their say. Open meetings run for three weeks. For once, people feel heard.',
        { support: 4, rep: 4, rel: { youth: { t: 8 }, elders: { t: 10 }, patron: { t: -8 } }, nation: nf({ trust: 1 }), flags: { consulted: true, oilStalled: true }, after: [{ in: 3, event: 'oil_return', hint: 'Investors are impatient. Meridian will be back.' }] }, { lean: 'community' }),
    ],
  },
  oil_return: {
    scene: 'fuel', who: 'Meridian Delta Petroleum', title: 'Meridian Comes Back',
    body: s => `Meridian is back with a revised offer. ${s.flags.consulted ? 'This time the community has already spoken, which gives you leverage.' : 'They know you are under pressure to bring in money.'} ${s.nation.gov < 40 ? 'The government is short of cash, and they know that too.' : ''}`,
    pressure: 'Walking away costs money. Signing badly costs trust.',
    choices: [
      ch('Sign the revised offer as it stands', ['money', 'law'], 'You sign. Money will flow, with fewer protections than anyone would like.', { support: -2, local: { jobs: 2, env: -3 }, nation: nf({ gov: 6, resinc: 8, foreign: 3 }), flags: { oilLive: true, oilStalled: false }, after: [revenue, { in: 5, event: 'oil_spill', hint: 'Fewer safeguards mean more risk later.' }] }),
      ch('Sign only with a community benefit agreement', ['public', 'law'], 'You insist the community gets written guarantees: jobs, clean-up funds and a share of the profits.', {}, { roll: { p: s => 0.45 + (s.flags.consulted ? 0.25 : 0) + (s.nation.inst - 45) / 250,
        hit: { text: 'Meridian signs. The community gets guarantees in writing.', fx: { support: 6, rep: 5, local: { jobs: 5, env: -1, land: 1 }, nation: nf({ gov: 4, resinc: 6, trust: 2 }), flags: { oilLive: true, oilSafeguards: true, oilStalled: false }, after: [revenue] } },
        miss: { text: 'No deal. Meridian leaves for a neighbouring state.', fx: { support: -2, nation: nf({ gov: -2, resinc: -2 }), flags: { oilStalled: false, oilGone: true } } } } }),
      ch('Reject it and back local industry instead', ['public', 'money'], 'You turn the company down and back a fish-processing and farm co-operative. It will not be fast.', { support: 3, rep: 3, local: { jobs: 4, food: 3 }, nation: nf({ foreign: -2 }), flags: { oilStalled: false, oilGone: true }, after: [{ in: 4, outcome: 'local_processing', hint: 'Local industry takes time to grow.' }] }, { cost: s => paid(s, 2e6), lean: 'community' }),
    ],
  },
  oil_spill: {
    scene: 'wave', who: 'Fishermen of the creek', title: 'The Creek Turns Black',
    body: s => `A pipeline leak has poisoned the creek near ${W(s)}. ${s.flags.oilSafeguards ? 'The safeguards you insisted on limit the damage, but fishing has stopped for now.' : 'Nobody checked the pipeline and there was no clean-up plan. Dead fish float past the market.'}`,
    pressure: 'Families are asking who allowed this.',
    choices: [
      ch('Order Meridian to clean up at its own cost', ['law', 'public'], 'You send the order and wait for the lawyers.', {}, { roll: { p: s => 0.35 + (s.flags.oilSafeguards ? 0.3 : 0) + (s.nation.inst - 45) / 150 - (s.nation.foreign - 45) / 300,
        hit: { text: 'Meridian pays and the clean-up starts. A clear warning to other companies.', fx: { local: { env: 7 }, rep: 5, support: 5, nation: nf({ inst: 2, trust: 2 }) } },
        miss: { text: 'Meridian\'s lawyers tie it up in court. Months pass.', fx: { local: { env: -1 }, support: -3, nation: nf({ trust: -1 }) } } } }),
      ch('Pay for the clean-up from public money', ['money', 'public'], 'A crew arrives. Meridian quietly thanks you.', { local: { env: 6 }, support: 2, nation: nf({ gov: -2 }) }, { cost: s => paid(s, 3e6) }),
      ch('Downplay it and blame vandals', ['press', 'law'], 'The statement calls it "minor and under control". Locals post photos.', { rep: -6, support: -6, exposure: 5, local: { env: -3, health: -2 }, flags: { coverup: true }, nation: nf({ trust: -2 }) }),
    ],
  },
  oil_discovery: {
    scene: 'fuel', who: 'Geological Survey', title: 'A Giant Oil Field',
    weight: s => ROLE(s) >= 3 && !s.flags.discovery ? 8 : 0, once: true,
    body: s => `A survey finds a huge oil field under swamp and farmland near ${W(s)}. Overnight, everyone has an opinion on who should get the rights and who should keep the profits.`,
    pressure: 'Whoever controls this decides who benefits for thirty years.',
    choices: [
      ch('Auction the rights to the highest bidder', ['money', 'law'], 'Foreign majors bid hard. The government banks a huge upfront payment. Most of the oil will be shipped out raw, with little added value at home.', { rep: -1, local: { jobs: 2, land: -4, env: -4 }, nation: nf({ gov: 10, resinc: 14, foreign: 6, env: -4 }), flags: { discovery: true, rawExport: true }, after: [revenue] }),
      ch('Sell only to firms that refine and train people locally', ['public', 'law', 'money'], 'You tell bidders: refine here, hire here, train here.', {}, { roll: { p: s => 0.5 + (s.nation.inst - 45) / 200 - (s.nation.foreign - 45) / 250,
        hit: { text: 'A firm accepts. A local refinery and a training college are on the way.', fx: { rep: 4, nation: nf({ gov: 4, resinc: 8, foreign: 2 }), flags: { discovery: true, localProc: true }, after: [{ in: 5, outcome: 'refinery_ready', hint: 'A local refinery could create jobs in about a year.' }] } },
        miss: { text: 'Only one bidder shows up and demands softer terms. You take the money.', fx: { nation: nf({ gov: 6, resinc: 9, foreign: 4, env: -3 }), flags: { discovery: true, rawExport: true }, after: [revenue] } } } }),
      ch('Develop it through a state-owned company', ['public', 'money', 'party'], 'It will be slow and expensive. But the profits stay home, if the company is run honestly.', { nation: nf({ gov: -3, foreign: -3 }), flags: { discovery: true }, after: [{ in: 6, outcome: 'national_co', hint: 'Success depends on how honestly it is run.' }] }, { cost: s => paid(s, 3e6) }),
    ],
  },

  // ---------- land and ownership ----------
  land_eviction: {
    scene: 'house', who: 'Skyline Estates', title: 'The Industrial Park',
    weight: s => s.q >= 1 ? 7 : 0, cooldown: 12,
    body: s => `Skyline Estates plans an industrial park on farmland at the edge of ${W(s)}. About 120 families have farmed it for generations, mostly without paper titles. ${tl(s) < 40 ? 'The law favours the developer here: customary land rights are weakly protected.' : 'Some families hold old documents, which gives them a fighting chance.'}`,
    pressure: 'Jobs for hundreds, or homes for 120 families. Both have votes.',
    choices: [
      ch(s => ROLE(s) >= 2 ? 'Approve the eviction notices and standard payout' : 'Advise families to take the standard payout', ['money', 'law'], 'The payout is small and the notices go out. The park will bring jobs, but 120 families lose their farms.',
        { support: -8, rep: -6, rel: { elders: { t: -10 }, youth: { t: -8 }, market: { t: -4 } }, local: { jobs: 4, land: -12, food: -3 }, nation: nf({ gov: 2, land: -3, trust: -1 }), flags: { evicted: true }, after: [{ in: 2, event: 'land_court', hint: 'Families may take this to court.' }, { in: 4, outcome: 'park_opens', hint: 'The park could open within a year.' }] }),
      ch(s => ROLE(s) >= 2 ? 'Insist on fair pay and a community share' : 'Organise families to demand fair pay and a share', ['law', 'public', 'money'], 'You put it plainly: pay market value and give the community a stake in the park.', { rep: 2 }, { roll: { p: s => 0.35 + tl(s) / 200 + (s.nation.inst - 45) / 300 + 0.04 * s.me.skills.org,
        hit: { text: 'Skyline agrees: fair payouts and a 10% community stake.', fx: { support: 7, rep: 6, rel: { elders: { t: 8 }, market: { t: 6 } }, local: { land: -2, jobs: 3 }, nation: nf({ land: 1, trust: 1 }), flags: { landTrust: true, consulted: true }, after: [{ in: 4, outcome: 'land_trust_dividend', hint: 'The community stake could start paying out.' }] } },
        miss: { text: 'Skyline refuses and pauses the project. Some families get a little, others nothing.', fx: { support: 1, local: { jobs: -1 }, flags: { consulted: true } } } } }),
      ch('Commission a land survey and public hearing first', ['law', 'public'], 'A surveyor walks the farms with the families. Old boundary markers, a 1960s deed and a witness list appear.', { support: 3, rep: 3, flags: { consulted: true }, after: [{ in: 2, outcome: 'hearing_result', hint: 'The hearing will decide who really has rights.' }] }, { cost: s => paid(s, 400e3), lean: 'community' }),
    ],
  },
  land_court: {
    scene: 'scales', who: 'High Court', title: 'Families Take You to Court',
    body: s => `Forty of the evicted families have filed suit over the ${W(s)} land. ${tl(s) >= 40 ? 'Their old documents give them a real case.' : 'Without formal titles their case is weak, but the sympathy is real.'}`,
    pressure: 'Every court date puts the project, and your name, in the news.',
    choices: [
      ch('Settle with fair payouts now', ['money', 'public'], 'Families accept a better deal. The park proceeds with less anger.', { support: 5, rep: 4, local: { land: 5 }, nation: nf({ trust: 1 }) }, { cost: s => paid(s, 2e6) }),
      ch('Fight it in court', ['law'], 'Lawyers file motion after motion.', {}, { roll: { p: s => Math.max(0.15, 0.75 - tl(s) / 150 - (s.nation.inst - 45) / 300),
        hit: { text: 'The court sides with the developer. The families lose.', fx: { support: -5, rep: -4, local: { land: -3 }, nation: nf({ land: -2, trust: -1 }) } },
        miss: { text: 'The court rules for the families and orders compensation.', fx: { support: 2, rep: -1, local: { land: 5 }, nation: nf({ inst: 1 }), flags: { evicted: false } } } } }),
      ch('Publicly side with the families', ['public', 'press', 'party'], 'You say it plainly: the families were treated unfairly. Skyline is furious.', { rep: 8, support: 8, loyalty: -6, rel: { elders: { t: 10 }, youth: { t: 8 }, patron: { t: -10 }, press: { t: 6 } }, local: { land: 4 }, nation: nf({ trust: 1 }) }, { lean: 'welfare' }),
    ],
  },

  // ---------- ordinary people's lives ----------
  food_prices: {
    scene: 'money', who: 'Iya Sade and the traders', title: 'Food Prices Jump',
    weight: s => s.local.food < 55 ? 6 : 1, cooldown: 8,
    effects: { local: { food: -4 }, nation: { food: -3, stab: -1 } },
    body: s => `A bag of rice now costs more than many families earn in two days. Iya Sade says traders are squeezed too: imports, transport and fuel have all gone up. Radio phone-ins are angry.`,
    pressure: 'Hungry people do not wait for the next election.',
    choices: [
      ch('Allow duty-free grain imports', ['money', 'public'], 'Imported rice floods in. Prices fall fast, but local farmers cannot compete.', { support: 4, local: { food: 9, jobs: -1 }, nation: nf({ food: 6, foreign: 3 }), after: [{ in: 3, outcome: 'farmers_squeeze', hint: 'Cheap imports can hurt local farmers.' }] }, { lean: 'market' }),
      ch('Cap prices and subsidise traders', ['money', 'public'], 'Prices are capped and traders get support to cover the gap.', { support: 4, rel: { market: { t: 6 } }, local: { food: 6 }, nation: nf({ food: 4, gov: -3 }), after: [{ in: 2, outcome: 'shortage', hint: 'Price caps can cause hoarding.' }] }, { cost: s => paid(s, 2e6), lean: 'welfare' }),
      ch('Back local farmers: storage, transport, seed', ['public', 'money'], 'Cold stores and a farmers\' co-operative will help food reach markets. It will not fix prices this month.', { support: 1, rel: { market: { t: 4 } }, local: { food: 2 }, after: [{ in: 4, outcome: 'harvest_gain', hint: 'If it works, food gets cheaper at harvest.' }] }, { cost: s => paid(s, 2.5e6), lean: 'community' }),
    ],
  },
  factory_power: {
    scene: 'bolt', who: 'Ade Plastics', title: 'The Factory May Close',
    weight: s => s.local.power < 58 && s.local.jobs < 60 ? 5 : 0, cooldown: 10,
    body: s => `Ade Plastics, the biggest employer in ${W(s)} with 300 workers, says electricity bills and blackouts may force it to close. The owner wants help. The workers are watching.`,
    pressure: 'No power, no jobs. But every fix has a price.',
    choices: [
      ch('Subsidise its electricity bills', ['money'], 'The factory stays open. Critics ask why one firm gets help.', { support: 3, local: { jobs: 4 }, nation: nf({ gov: -1 }) }, { cost: s => paid(s, 1.5e6) }),
      ch('Allow a gas-powered generator plant', ['public', 'law'], 'The factory gets steady power quickly. The plant also burns gas next to homes.', { support: 2, local: { power: 6, jobs: 3, env: -5, health: -1 }, nation: nf({ env: -1 }) }),
      ch('Partner on a solar mini-grid', ['public', 'money'], 'A solar mini-grid will take time, but it could power the market too.', { rep: 3, after: [{ in: 3, outcome: 'factory_solar', hint: 'If built, it will power the whole area.' }] }, { cost: s => paid(s, 3e6) }),
    ],
  },
  hospital_supplies: {
    scene: 'health', who: 'Matron Grace Okoro', title: 'The Hospital Runs Out',
    weight: s => s.local.health < 55 ? 5 : 0, cooldown: 8,
    body: s => `The ${W(s)} General Hospital has run out of oxygen and basic drugs. Matron Okoro says mothers are being sent home with a prescription and a prayer.`,
    pressure: 'Lives are at stake this week, not next year.',
    choices: [
      ch('Make an emergency purchase', ['money', 'public'], 'Oxygen cylinders and drugs arrive within days. Wards breathe again.', { support: 5, local: { health: 8 }, nation: nf({ gov: -2 }) }, { cost: s => paid(s, 3e6), lean: 'welfare' }),
      ch('Accept a foreign donor package with conditions', ['public', 'law'], 'Shipping containers of supplies arrive. The donor\'s conditions are in the fine print.', { support: 3, local: { health: 7 }, nation: nf({ foreign: 4 }), rel: { foreign: { t: 5 } }, after: [{ in: 4, outcome: 'supplier_lock', hint: 'Donor packages can come with strings.' }] }),
      ch('Move money from school repairs', ['public'], 'Supplies arrive; classroom repairs are paused.', { support: -1, rep: -2, local: { health: 6, edu: -5 } }),
    ],
  },
  pollution_protest: {
    scene: 'wave', who: 'Fishermen\'s union', title: 'Dead Fish on the Road',
    weight: s => s.local.env < 45 ? 6 : 0, cooldown: 8,
    body: s => `Fishermen and farmers from ${W(s)} have dumped dead fish on the main road. "You promised us clean water," one shouts into a radio microphone. Traffic is stuck for hours.`,
    pressure: 'The water is the problem. The cameras are the deadline.',
    choices: [
      ch('Order an inspection and fine the polluter', ['law', 'public'], 'Inspectors go out at dawn.', {}, { roll: { p: s => 0.35 + (s.nation.inst - 45) / 150 + (s.flags.oilSafeguards ? 0.15 : 0),
        hit: { text: 'Inspectors find clear violations. The company pays and cleans up.', fx: { local: { env: 6 }, support: 6, rep: 5, nation: nf({ inst: 1, trust: 1 }) } },
        miss: { text: 'The inspection "finds nothing". People smell a cover-up.', fx: { support: -4, rep: -3, exposure: 3 } } } }),
      ch('Set up a compensation fund', ['money', 'public'], 'A fund pays affected families. It does not clean the water.', { support: 5, rel: { youth: { t: 4 } }, local: { env: 1 } }, { cost: s => paid(s, 2e6) }),
      ch('Send security to clear the road', ['law'], 'The road is cleared. The water is not.', { support: -6, rep: -6, influence: 3, nation: nf({ stab: -2 }) }),
    ],
  },

  // ---------- foreign influence ----------
  foreign_loan: {
    scene: 'handshake', who: 'Helen Marlowe, Continental Development Bank', title: 'A Big Foreign Loan',
    weight: s => ROLE(s) >= 3 && s.nation.gov < 65 ? 8 : 0, cooldown: 12,
    body: s => `Continental Development Bank offers a large loan to build a railway and a power plant. The conditions: a foreign contractor, a currency clause and cuts to fuel subsidies. ${s.nation.debt > 60 ? 'The country already owes a lot.' : 'The government is short of cash for big projects.'}`,
    pressure: 'The projects are real. So is the repayment schedule.',
    choices: [
      ch('Accept the loan as offered', ['money', 'law'], 'Money arrives and cranes appear. The repayment schedule goes in a drawer.', { local: { jobs: 3 }, rel: { foreign: { t: 10 } }, nation: nf({ gov: 10, debt: 10, foreign: 7, trust: -1 }), after: [{ in: 5, outcome: 'debt_squeeze', hint: 'Repayments start in about a year.' }, { in: 6, outcome: 'rail_built', hint: 'The railway could be finished in about eighteen months.' }] }),
      ch('Negotiate better terms', ['law', 'money'], 'You ask for a lower rate, local contractors and protection for fuel subsidies.', {}, { roll: { p: s => 0.3 + 0.05 * s.me.skills.fin + (s.nation.inst - 45) / 200 - (s.nation.foreign - 45) / 200,
        hit: { text: 'You secure a lower rate, local contractors and a clause protecting fuel subsidies.', fx: { rep: 4, local: { jobs: 4 }, rel: { foreign: { t: 4 } }, nation: nf({ gov: 7, debt: 5, foreign: 2 }), after: [{ in: 6, outcome: 'rail_built', hint: 'The railway could be finished in about eighteen months.' }] } },
        miss: { text: 'The bank walks away. Headlines say "talks collapse".', fx: { support: -3, rel: { foreign: { t: -8 } } } } } }),
      ch('Refuse and raise money at home', ['public'], 'Slower and smaller, but nobody abroad can dictate terms.', { rep: 3, nation: nf({ foreign: -3 }), after: [{ in: 4, outcome: 'domestic_bond', hint: 'A domestic bond might raise some money.' }] }),
    ],
  },
  contract_terms: {
    scene: 'phone', who: 'Lumen Telecom', title: 'The Foreign Company Wants Better Terms',
    weight: s => ROLE(s) >= 2 && s.q >= 4 ? 4 : 0, cooldown: 12,
    body: s => `Lumen Telecom, a foreign company, is building phone and internet networks across the region. Now it wants a seven-year tax holiday and exclusive rights, or it will "reconsider" its investment.`,
    pressure: 'Foreign money brings jobs and skills. It can also bring dependence.',
    choices: [
      ch('Give them the tax holiday and exclusivity', ['money', 'law'], 'Lumen builds fast. In seven years the government will have little to show in tax.', { support: 2, local: { jobs: 4 }, nation: nf({ jobs: 3, gov: -2, foreign: 5 }), flags: { lumen: true } }),
      ch('Hold firm on the original terms', ['law'], 'You tell Lumen the terms stand.', {}, { roll: { p: s => 0.35 + (65 - s.nation.foreign) / 150 + (s.nation.inst - 45) / 250,
        hit: { text: 'Lumen grumbles and signs. The country\'s share is intact.', fx: { rep: 4, local: { jobs: 3 }, nation: nf({ jobs: 2, gov: 2 }) } },
        miss: { text: 'Lumen scales back and builds in the next country.', fx: { support: -3, local: { jobs: -2 }, nation: nf({ jobs: -2, foreign: 1 }) } } } }),
      ch('Offer a deal with local partners and local hiring', ['public', 'law'], 'You propose a joint venture with a local firm, local hiring and training.', {}, { roll: { p: s => 0.45 + s.me.skills.fin * 0.03,
        hit: { text: 'You get a joint venture, training and a share of the revenue.', fx: { support: 4, rep: 3, local: { jobs: 5, edu: 2 }, nation: nf({ jobs: 3, gov: 1, foreign: -2 }) } },
        miss: { text: 'Talks drag on. Lumen starts only the easy parts.', fx: { local: { jobs: 1 }, nation: nf({ foreign: 2 }) } } } }),
    ],
  },

  // ---------- political survival ----------
  donor_favour: {
    scene: 'briefcase', who: 'Dr. Tayo Reis', title: 'A Generous Donor',
    weight: s => s.q >= 2 ? 4 : 0, cooldown: 12,
    body: s => `Dr. Tayo Reis of Reis Logistics offers to bankroll your campaign with ${N(fundBase(s) * 8)}, no strings, he says. Over lunch he mentions he would like his firm "considered" for the next big transport contract.`,
    pressure: 'Campaigns run on money. Money has owners.',
    choices: [
      ch('Take the money and the favour', ['money', 'law', 'party'], 'Funds arrive that afternoon. So does a note: "Looking forward to working together."', { funds: s => fundBase(s) * 8, exposure: 8, rel: { donor: { t: 15, o: 35 } }, flags: { donorOwed: true }, after: [{ in: 4, event: 'donor_calls', hint: 'Donors expect something back.' }] }),
      ch('Take the money, but any contract goes to open tender', ['money', 'law'], 'You say it plainly: any contract goes through open tender.', { rep: 2 }, { roll: { p: () => 0.6,
        hit: { text: 'Reis laughs. "Fair enough." The cheque stays.', fx: { funds: s => fundBase(s) * 4, rel: { donor: { t: 3, o: 10 } }, after: [{ in: 4, event: 'donor_calls', hint: 'He may test that promise later.' }] } },
        miss: { text: 'Reis shrinks the donation, annoyed.', fx: { funds: s => fundBase(s) * 2, rel: { donor: { t: -4, o: 5 } } } } } }),
      ch('Politely refuse', ['public'], 'You hand back the brochure. Your campaign manager stares at you.', { rep: 5, support: 2, rel: { donor: { t: -8 } } }, { lean: 'reform' }),
    ],
  },
  donor_calls: {
    scene: 'phone', who: 'Dr. Tayo Reis', title: 'Dr. Reis Calls',
    body: s => `Dr. Reis wants Reis Logistics to run the ${ROLE(s) >= 2 ? 'ward transport and market contract' : 'new motor-park project'}. ${s.flags.donorOwed ? 'He reminds you of his donation, politely.' : 'You said it would go to open tender; he says his bid will be "very competitive".'}`,
    pressure: 'Everyone is watching who gets what.',
    choices: [
      ch('Award it to him directly', ['money', 'law'], 'It goes through with a signature. The ledger now carries your name.', { exposure: 10, influence: 4, rep: -3, rel: { donor: { t: 10, o: -35 } }, local: { transport: 4 }, nation: nf({ inst: -1 }) }),
      ch('Run an open tender and let him bid', ['law', 'public'], 'A public tender goes out. Three firms bid.', { rep: 3, rel: { donor: { t: -4, o: -20 } }, nation: nf({ inst: 1 }) }),
      ch('Refuse, and repay him', ['money', 'public'], 'You hand back the money. He does not look happy.', { rep: 4, support: 2, rel: { donor: { t: -10, o: -60 } } }, { cost: s => ({ funds: fundBase(s) * 4 }) }),
    ],
  },
  journalist_contract: {
    scene: 'phone', who: 'Ngozi Eze', title: 'A Reporter Is Digging',
    weight: s => (s.flags.contractorPaid || s.flags.oilNoConsult || s.flags.coverup || s.flags.evicted || s.me.exposure >= 15) ? 5 : 0, cooldown: 10,
    body: s => {
      const t = s.flags.coverup ? 'your statement on the oil spill' : s.flags.oilNoConsult ? 'how the oil deal was approved without asking residents' : s.flags.contractorPaid ? 'the extra payment on the road contract' : s.flags.evicted ? 'the evictions for the industrial park' : 'your finances';
      return `Ngozi Eze of The Evening Ledger is asking questions about ${t}. She wants documents, and she has already spoken to people who were there.`;
    },
    pressure: 'Earlier decisions come back, usually with a notebook.',
    choices: [
      ch('Open the books and answer everything', ['press', 'law'], 'You clear your diary for her.', {}, { roll: { p: s => 0.85 - s.me.exposure / 90 - (s.flags.coverup ? 0.2 : 0),
        hit: { text: 'The documents hold up. Her story is fair, and you look transparent.', fx: { rep: 6, support: 3, exposure: -6, rel: { press: { t: 8 } }, nation: nf({ trust: 1, inst: 1 }) } },
        miss: { text: 'The documents raise more questions than they answer.', fx: { rep: -8, support: -5, exposure: 6, rel: { press: { t: 2 } } } } } }),
      ch('Stonewall and threaten to pull government ads', ['press', 'law'], 'The Ledger prints "No comment" and your threat.', { rep: -6, support: -4, exposure: 4, rel: { press: { t: -20 } }, nation: nf({ inst: -1, trust: -1 }) }),
      ch('Point her towards a rival\'s dealings', ['press', 'party'], 'You hand her a thick file about the rival\'s cousin\'s firm. She notices who gave it.', { support: 2, rel: { rival: { t: -12 }, press: { t: -4 } } }, { roll: { p: () => 0.5,
        hit: { text: 'The story shifts focus.', fx: { exposure: -3 } }, miss: { text: 'She prints both stories.', fx: { rep: -4, exposure: 3 } } } }),
    ],
  },
});

Object.assign(OUTCOMES, {
  oil_revenue: s => ({ text: s.flags.oilSafeguards ? 'The first oil payment reaches the treasury. Part of it funds the compensation scheme you negotiated.' : 'The first oil payment reaches the treasury. How much reaches ordinary people is another question.', fx: { nation: nf({ gov: 5 }), news: [['ledger', 'Oil money flows in: government revenue jumps.']] } }),
  park_opens: s => ({ text: 'The industrial park opens. Some local people get jobs; many evicted families are not among them.', fx: { local: { jobs: 5 }, nation: nf({ jobs: 2 }), news: [['radio', 'Industrial park opens; evicted families picket the gate.']] } }),
  land_trust_dividend: s => ({ text: 'The community\'s 10% stake pays its first dividend: more cash than many families ever saw from that land.', fx: { support: 6, rep: 3, local: { jobs: 2, land: 3 }, nation: nf({ trust: 1 }) } }),
  hearing_result: s => tl(s) >= 35
    ? { text: 'The hearing recognises the families\' customary claims. The developer must negotiate properly.', fx: { support: 5, rep: 3, local: { land: 4 }, nation: nf({ land: 1, inst: 1 }) } }
    : { text: 'The hearing finds most families have no formal papers. The developer pays modest compensation. The law, not fairness, decided this.', fx: { support: 1, local: { land: -2 }, nation: nf({ land: -1 }) } },
  refinery_ready: s => ({ text: 'The local refinery opens. It employs hundreds and keeps more of the oil\'s value at home.', fx: { support: 5, local: { jobs: 8 }, nation: nf({ jobs: 4, gov: 4, resinc: 4 }), news: [['radio', 'Local refinery opens; hundreds hired.']] } }),
  national_co: (s, r) => r < 0.25 + s.nation.inst / 150
    ? { text: 'The national oil company turns a profit and runs cleanly.', fx: { rep: 4, nation: nf({ gov: 8, resinc: 10, trust: 2 }) } }
    : { text: 'Contracts at the national oil company go to friends. Costs balloon and money disappears.', fx: { rep: -5, exposure: 6, nation: nf({ gov: -3, trust: -3, inst: -1 }), news: [['ledger', 'Questions over oil company contracts.']] } },
  farmers_squeeze: s => ({ text: 'Cheap imports make local crops hard to sell. Many farmers cut back; some leave the land.', fx: { support: -4, local: { jobs: -3, food: -2 }, nation: nf({ jobs: -2 }) } }),
  shortage: (s, r) => r < 0.3 + (50 - s.nation.inst) / 150
    ? { text: 'Traders hoard stock because of the price cap. Shelves empty and street prices rise again.', fx: { support: -4, local: { food: -5 } } }
    : { text: 'Prices hold and shelves stay stocked. The cap works, for now.', fx: { support: 2, local: { food: 2 } } },
  harvest_gain: s => ({ text: 'Storage and transport pay off at harvest. More food reaches the market and prices ease.', fx: { support: 5, local: { food: 8, jobs: 3 }, nation: nf({ food: 5 }) } }),
  factory_solar: s => ({ text: 'The solar mini-grid switches on. The factory runs steadily and the market gets power too.', fx: { support: 4, local: { power: 8, jobs: 3, env: 1 }, nation: nf({ power: 2 }) } }),
  debt_squeeze: s => ({ text: 'Loan repayments begin. Money that could have built clinics now goes abroad.', fx: { nation: nf({ gov: -6, trust: -1 }), news: [['ledger', 'Repayments on foreign loan bite into budgets.']] } }),
  rail_built: s => ({ text: 'The new railway opens, cutting travel times and moving goods more cheaply.', fx: { support: 4, local: { transport: 8, jobs: 2 }, nation: nf({ transport: 6, jobs: 2 }), news: [['radio', 'New railway opens; commuters celebrate.']] } }),
  domestic_bond: (s, r) => r < 0.3 + s.nation.trust / 200
    ? { text: 'Citizens and banks buy the bond. Money is raised without foreign strings.', fx: { rep: 3, nation: nf({ gov: 4, trust: 2, foreign: -1 }) } }
    : { text: 'The bond is undersubscribed. Less money comes in than hoped.', fx: { nation: nf({ gov: 1 }) } },
  supplier_lock: s => ({ text: 'The donor package locks the hospital into buying only from approved suppliers, at higher prices.', fx: { local: { health: -2 }, nation: nf({ gov: -2 }) } }),
  local_processing: s => ({ text: 'The fish-processing and farm co-operative takes off, employing hundreds locally.', fx: { support: 4, local: { jobs: 6, food: 3 }, nation: nf({ jobs: 2 }) } }),
});
