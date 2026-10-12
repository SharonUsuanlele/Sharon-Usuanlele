# Policy Panic: design and implementation notes

A mobile-first political life RPG in a fictional Nigeria. Win power, keep it, try to stay clean.

## How the two guiding repos were used

Both repos were inspected (shallow read-only clones outside the project, nothing installed globally) and their instructions followed.

- **Ponytail** (`DietrichGebert/ponytail`): its documented setup for agents without a plugin system is to copy `AGENTS.md` into the project, which is now `policy-panic/AGENTS.md`. Its ladder (does it need to exist, reuse what exists, platform feature, minimum code, one small test for logic) drove the choices here: no framework or dependencies, one rules engine instead of per-screen logic, new systems added as data plus one `systems()` function, a test for every new rule. The `/plugin` slash-command install is interactive and was not run.
- **UI/UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`): its `search.py` was run (stdlib only, no network calls, checked first) for a design system and for the style, UX and chart domains. What it said and what was done:
  - Its generic design-system output was landing-page oriented (Swiss minimalism), which is the wrong product type for a game, so it was not adopted. Its typography mood ("bold editorial, poster, near-black, vermillion") matches the direction already chosen.
  - *Don't convey information by colour alone*: meters already show numbers; the country view now adds a text band (Low / Fair / Good, or High / Moderate / Low for bad-when-high measures) beside every coloured bar.
  - *Label every range; show number and target beside the gauge*: done on every indicator row.
  - *Touch targets 44-48px with 8px gaps*: all controls are 44px+ with at least 10px gaps.
  - *Parallax storytelling* was rejected: its own data marks it high cost and high accessibility risk, wrong for low-end phones on slow data.

## Stack and why

Vanilla ES modules, static files, `localStorage`, a tiny service worker. Cold load is about 205 KB unminified (roughly 55 KB gzipped) with no images or fonts, and it works offline. The repo was empty, so there was nothing to preserve; this is the smallest thing that does the job.

```
index.html        shell
css/style.css     design tokens + components
js/content.js     all fictional content as data (origins, events, moves, outcomes)
js/engine.js      pure rules engine (no DOM). The only place consequences are computed
js/art.js         inline SVG: hero, avatars, scene banners, icons
js/app.js         UI: renders engine state, routes taps to engine calls
test/*.test.js        node --test (30 tests)
```

Run: `npm start` (serves on :8080), `npm test`.

## Game loop

One turn = one **quarter**. Each quarter:

1. A scheduled consequence from an earlier choice, or a weighted random event, is waiting (decision).
2. Decide, then see a **consequence screen** built from a real before/after state diff.
3. Spend **2 free moves** (walk the ward, raise funds, fund a project, court the party, work the media, earn, train, family). Moves use the same choice engine.
4. **End quarter**: income and living costs, debts, public budget refills, conditions drift, delayed outcomes fire, news is generated, next event drawn.
5. Every 16 quarters (first at quarter 8) a **general election** runs: pick a seat, win the party ticket, spend campaign funds, face the voters.

Time only advances on End quarter. Moves and decisions are instant.

## Screen map

```
Title ─ New game → Create 1 (identity, look, ward) → Create 2 (origin, stance) → Origin decision
      └ Continue ───────────────────────────────────────────────────────────────┐
                                                                                 ▼
Main (tabs): Life · People · Money · Country · News         [Settings sheet from any screen]
   Life ─ Face decision → Decision → Consequence → Life
        ─ Move → Decision (cancel keeps move) → Consequence → Life
        ─ End quarter → Quarter summary → next Decision / Election
   Election: Call (seat + ticket) → [Denied: defect / independent / sit out] → Campaign → Result → Life
   Ending (retire) → Legacy
```

Essential and built: all of the above. Deferred: tutorial overlays, character portraits per NPC, audio beyond beeps, multi-stage crisis storylines beyond the road and the probe-to-court chain, more events and roles beyond councillor in practice.

## Design system

**Direction.** Campaign poster meets tabloid front page. Compared with glassmorphism, flat dashboard and cartoon game styles, this one fits a political-drama life RPG: newsprint cards carry the *story* (high contrast, serif, easy to read quickly), ink background carries *chrome*, and sticker-like chunky buttons give game polish.

| Token | Value | Meaning |
|---|---|---|
| ink `#15110E` | background | night, newsroom |
| paper `#F3E9D2` | story cards | newsprint |
| yellow `#FFC21A` | primary action, loyalty | danfo-bus yellow; use for "do this" |
| red `#E4411B` / `#B52C14` | risk, heat, debt, defeat | panic |
| green `#2FB36F` | personal wealth, support, good | |
| blue `#6F8CFF` | public budget, influence | public / institutional |

Colour is never the only signal: every meter has a number, deltas have signs, risky options say "Uncertain".

**Type.** System fonts only (zero bytes): condensed heavy caps for headlines and stats (`Arial Narrow`/`Roboto Condensed`), Georgia serif for story and news, system sans for UI. Base 16px, user-scalable to 130%.

**Shape.** 2-3px ink borders, hard offset shadows, 12px radii, 48px+ touch targets, one primary button per screen, fixed dock for it.

**Art.** Inline SVG only. Title poster (candidate, crowd, posters, ballot-stamp sun), procedural avatars (5 skin tones, 5 headwear/hair, 4 outfits), event banners with an Ankara-inspired tile pattern and one big symbol. No flags.

**Motion.** 240 ms entrance, stamp animation on election results, meter fill. Off with the OS reduce-motion setting or the in-game toggle.

**States.** Empty (news), disabled with reason (choices you cannot afford say why), error (render crash screen, invalid action toasts), save-failure warning, loading shell.

**Accessibility.** Semantic buttons, `aria-pressed` for selection, `role="meter"` bars, live region for messages, visible 3px focus ring, Escape closes sheets, text size, high contrast and reduced motion settings.

## State model

Owner → fields (ranges):

- **Personal**: `me.wealth` ₦≥0, `me.rep` 0-100, `me.exposure` 0-100 (legal heat), `me.skills.{org,speech,fin}` 0-10, `debts[]`, `player.age`.
- **Political**: `me.influence`, `me.loyalty`, `me.support` 0-100, `me.funds` (campaign) ≥0, `office.role` 0-7, `player.party`, `rel[id].{t -100..100, o 0..100}` (trust, obligation) for nine fixed characters.
- **Government**: `office.budget` ≥0 (public money, lapses past 2x quarterly allocation), `local.{power,jobs,health,edu,transport}`, `nation.{…, debt, trust, inst}`.
- **World/time**: `q` (quarter), `election.nextQ`, `queue[]` (delayed events and outcomes), `flags`, `log[]` (news), `why[]` (causes of indicator changes), seeded `seed`.

Four money pools never combine: personal wealth, campaign funds, public budget, debts/obligations.

Rules in one place: `engine.js`. A choice is data: `{cost, req, fx, roll, after, lean}`. `fx` keys are applied by one `applyFx`. UI never computes outcomes. Money is clamped ≥0 and unaffordable options are rejected. Randomness uses a seeded RNG stored in the save, so the same state and choice always give the same result.

### Delayed consequences (implemented)

- Approve the extra road payment, then **The Road Washes Away** arrives 3 quarters later.
- Promise 500 jobs on radio, then 4 quarters later the engine checks the *real* local jobs figure.
- Use the Alhaji for a favour, then he **calls it in** (also forced when obligation ≥70).
- Expose the contractor, then **party retaliation** hits ticket odds.
- Exposure ≥35 can draw a **Bureau probe**, which can lead to a **court judgment** (conviction bars you from running for 16 quarters).
- Losing an election queues the **aftermath** (rebuild, tribunal petition if the margin was small, or join the winner).

### Elections

`ticketScore` (loyalty, influence, patron and chairman trust, grudges) decides **secure / contested / denied**. The result is `44 + factors` vs `54 + 3 × tier + noise`; factors are popularity, local record, reputation, scandal, party machine, ward agents, media, handouts (raises exposure, may leak), endorsements, incumbency. The result screen lists the factors. Losing an incumbent seat sends you to "former X" with a path back. Sim calibration: a diligent bot wins about 85% of races; a passive player loses.

## Country systems (added for the "whole country" brief)

The player still starts small (ward, councillor) and climbs to President; every decision ripples into the country in proportion to the office held (`nf()` scales effects: 0.3x for a community figure up to 1.2x for a president).

**Eight ways ordinary people live** (tracked for the player's ward *and* the country): jobs & incomes, food affordability, electricity, healthcare, education, roads & transport, land & housing security, environment. **Seven national measures**: government money, resource income, public debt, foreign dependence, public trust, political stability, courts & watchdogs. **Personal wealth** is separate. Nothing is decorative; each one does something:

| Measure | What it does in the game |
|---|---|
| Government money | Sets the size of every public budget (0.6x to 1.4x). Fed by resource income, drained by debt and foreign dependence. |
| Resource income | Fills government money. If courts & watchdogs are weak, part leaks, trust falls, and the press writes "revenue is up but people see no change". |
| Public debt / Foreign dependence | Drain government money; foreign dependence lowers the odds of winning negotiations; both are raised by loans and foreign deals and paid back later. |
| Environment | Below 40, pollution slowly cuts health, food and jobs. Oil projects erode it unless safeguards were negotiated. Low environment triggers pollution protests. |
| Food affordability | Below 35 it drags stability down; price spikes are a recurring event. |
| Land & housing security | Evictions lower it, fuel court cases, and are remembered at election time. |
| Political stability | Follows living conditions and trust. Low stability triggers protests more often and punishes you at the polls. |
| Jobs, power, health, education, transport | Feed support, stability, events and election "record in office". |
| Public trust, courts & watchdogs | Shape negotiation odds, probes, cover-ups, and how much ordinary reforms are believed. |

**Country dashboard.** A landscape that changes with conditions (lights on or off, smoke and haze, farmland green or brown, clean or poisoned river, crowds with placards when stability is low, an oil derrick if drilling), a card "Who is actually doing well?" comparing the government, resource income, you personally and ordinary people with a one-line verdict, then grouped rows. **Tap any row** for what it means, why it matters, and the last few things that moved it.

**Land and law.** Each region has a customary land-title strength. It changes how often families win in court and what a public hearing finds. Outcomes also depend on compensation, consultation, institutions and negotiating skill; there is no single "right" button.

**New stories (15):** The Oil Expansion (approve / renegotiate / delay), Meridian Comes Back, The Creek Turns Black, A Giant Oil Field (auction / local refining / state company), The Industrial Park (evictions), Families Take You to Court, Food Prices Jump, The Factory May Close, The Hospital Runs Out, Dead Fish on the Road, A Big Foreign Loan, The Foreign Company Wants Better Terms, A Generous Donor, Dr. Reis Calls, A Reporter Is Digging (which cites whichever earlier decision you made). Most have three choices, and about two thirds have uncertain or delayed outcomes; follow-ups are scheduled in `queue`.

**Career.** Community figure, party organiser, councillor, LG chairperson, state assembly, governor, federal legislator, senator, president (age 40+, from governor or senator). Non-linear (`from` lists). A "play style" label (patronage builder, deal-maker, public servant, pragmatist) is derived from obligations, wealth, reputation and exposure.

Saves from before this change (version 1) cannot be read by this version.

## Multiplayer and shared world: not implemented

Fake multiplayer is not presented as real. The UI says "Offline world".

What a real version needs:

1. A server holding a single authoritative `world` (nation indicators, calendar, public controversies, seat holders) and per-player state.
2. Accounts and auth; players submit *actions*, never state.
3. The engine is already pure, so the same `choose` / `endQuarter` can run server-side for validation; `nation` is already separate from `me`/`local`.
4. A shared clock (for example one quarter per real day) so players act in the same turn; seats become contested between real players instead of the scripted rival.
5. Cross-player effects through the `queue` (an event addressed to another player), rate limits, and moderation of names.

## Critical UI/UX review of the first playable version

1. **Life screen too long, moves below the fold.** Fixed: moves compact and moved directly under the objective.
2. **Decision banner wasted space on short phones.** Fixed: shorter banner under 760px height.
3. **Country screen repeated "No recent change" five times.** Fixed: one footnote, causes only where they exist.
4. **Negative values rendered `→ -5` and fractional stats leaked (−0.9009…) and caused horizontal overflow at 360px.** Fixed: stats rounded in the engine; flex rows made overflow-safe. Found by browser testing, not by eye.
5. **Dock plus tab bar consumed about 140px.** Slimmed to 56px tabs.

Second review pass (country update): the decision banner cropped its icon on narrow screens (fixed); probe and godfather-call events fired too often for players who pile up obligations (cooldowns added); the high-office events were nearly unreachable (weights raised). A 140-game bot sweep confirms all 30 non-intro events can occur.

Remaining known weaknesses (not fixed): no first-run coaching beyond `?` chips; NPCs have initials, not portraits; decision text is long for one-handed reading; 39 events, so long careers will still repeat; sound is just beeps; Back-button handling is only wired for tabs.

## Test status

`npm test`: 30 tests pass. Engine basics (setup, invalid actions, costs, moves/time, money separation, delayed consequences, determinism, probe to court, elections, defeat, save validation, 40-quarter bot run) plus the country systems (oil approve/delay/renegotiate odds by skill and institutions, land outcomes by region title, resource money without better lives, pollution drift with recorded causes, foreign loan repayment squeeze, donor obligations, press citing earlier decisions, elections remembering land/food/environment, President eligibility). In-browser (Chromium, 360×740 and 390×844 touch emulation): full run through character creation, decisions, moves, 51 quarters, two elections, reload with identical restored state, no console errors, no horizontal overflow. Not tested: real devices, screen readers, Safari, slow-network behaviour of the service worker.
