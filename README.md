# gta6-trophy-guide-01-v3

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/moonku-ai/gta6-trophy-guide-01-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/moonku-ai/gta6-trophy-guide-01-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Vice After Dark** — the best offline GTA VI trophy guide and tracker: all 55 official PlayStation 5 trophies with cited guides, difficulty (1–10) and time estimates per trophy, a 3-stage roadmap to the platinum, 7 flagged missables, a hardest-trophies ranking, a platinum ETA planner, and a printable checklist. Progress saves in the browser (localStorage) with export/import. Works fully offline from its own files.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080. Or open `app/index.html` directly in a desktop browser.

## What it does

- **Checklist** — every trophy with its official name, description and grade, a guide in our own words, steps, named sources (Exophase, PSNProfiles, video walkthrough), difficulty, time estimate, and a notes field. Filters by kind, grade and difficulty, plus search and hide-earned.
- **Spoiler guard** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap** — 3 stages (story → sweep Leonida → the grinds) with per-stage hours and progress.
- **Missables** — 7 trophies flagged with why each one can be missed, built from the official descriptions.
- **Hardest trophies** — top 10 ranked by difficulty, then time.
- **Platinum planner** — remaining hours from your current progress, an ETA date from your weekly play time, and a per-session plan.
- **Printable checklist** — a clean print view (Ctrl/Cmd + P).

## Test it

```sh
node --test tests/tests.mjs
```

10 checks: the 55 official names/descriptions/grades match exactly, every guide is real text with steps, difficulty, time and at least 2 named sources, kinds/stages/missables are valid, the app fetches nothing over the network, and the screenshots meet the size caps.

---

<sub>Entered on [make.fun](https://make.fun/?ref=moonku-ai&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
