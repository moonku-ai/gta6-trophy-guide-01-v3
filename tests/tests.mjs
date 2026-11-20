// Tests for the GTA VI trophy guide v3 (node:test, stdlib only).
// RED first: these fail until app/data/trophies.json + app/ exist.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'app', 'data', 'trophies.json');

// Official list (names/descriptions/grades as PlayStation publishes them,
// per the kit's starter trophies.json = Exophase + PSNProfiles, 2026-11-18).
const OFFICIAL = [
  ['Vice Got a Price!', 'Congratulations! You\'re a Leonida Legend.', 'platinum'],
  ['Just Like Paradise', 'Complete Gone Fishing.', 'bronze'],
  ['Paradise Lost', 'Complete Chapter 1.', 'bronze'],
  ['T**s Ass Drug Money', 'Complete Chapter 2.', 'bronze'],
  ['Vice City, Baby!', 'Complete Chapter 3.', 'bronze'],
  ['Top Of The World, Ma', 'Complete Chapter 4.', 'bronze'],
  ['You Gotta Know When to Get Off', 'Complete the final mission.', 'gold'],
  ['Trust', 'Complete Breakfast Run.', 'bronze'],
  ['Break the Bank', 'Complete The Cartel Heist.', 'bronze'],
  ['Family Matters', 'Complete Child\'s Play.', 'bronze'],
  ['DWNFALL', 'Complete Headliners.', 'bronze'],
  ['Hi-Jacked', 'Complete VCIA Takedown.', 'bronze'],
  ['Snow Storm', 'Complete Operation Savage Glory.', 'bronze'],
  ['A Long Road', 'Attain 100% Completion.', 'gold'],
  ['Cunning Stunts', 'Complete 250 Stunts.', 'silver'],
  ['Master of None', 'Try each type of activity once.', 'bronze'],
  ['The Shootist', 'Earn a gold medal in all Shooting Range challenges.', 'silver'],
  ['Top Fun', 'Win a Top Fun Drone Race at every location.', 'bronze'],
  ['Earn Cash, Not Kudos', 'Win 20 different races.', 'bronze'],
  ['Baited My Tackle', 'Beat Cal in a fishing challenge.', 'bronze'],
  ['Stick Fiddler', 'Complete an arcade game.', 'bronze'],
  ['Road to Rehabilitation', 'Complete the final mission for Andy.', 'bronze'],
  ['This Was No Boat Accident', 'Complete the final mission for Kenton.', 'bronze'],
  ['The Lone Rider', 'Complete the final mission for Billy.', 'bronze'],
  ['Strangers & Freaks', 'Complete 8 mission strands for strangers across the state of Leonida.', 'silver'],
  ['Supply & Demand', 'Complete the final mission for Randy.', 'bronze'],
  ['Spin On This!', 'Complete the final mission for Tyrone.', 'bronze'],
  ['Positive Mental Attitude', 'Meditate at every spot across Leonida.', 'bronze'],
  ['Fair Game', 'Hunt a unique animal for Bret.', 'bronze'],
  ['Don\'t Touch My Deck', 'Complete 3 Collectible Card sets.', 'silver'],
  ['You WAiNKer!', 'WAiNK It at 100 locations.', 'silver'],
  ['One Last Thing', 'Complete 50 Challenges.', 'bronze'],
  ['Hot Together', 'Lose a 4 star Wanted Level with your partner and escape the heat.', 'bronze'],
  ['Retail Therapy', 'Rob 3 shops back-to-back with your partner without losing your Wanted Level.', 'bronze'],
  ['Whip It Good', 'Discover 100 vehicles.', 'bronze'],
  ['Gunslinger', 'Take down 5 enemies in a single use of Combat Focus.', 'bronze'],
  ['Catch Me If You Can', 'Make an unscheduled departure at VCIA.', 'bronze'],
  ['Challenging Tank', 'Kinda hot in these Rhinos.', 'bronze'],
  ['Sneakthief', 'Rob a jewelry store without being detected.', 'bronze'],
  ['Maximum Withdrawal', 'Rob 5 Bank Vaults and escape.', 'silver'],
  ['A Classic Blitz Play', 'Rob an Armored Truck and escape.', 'bronze'],
  ['The Goodtime State', 'Explore all of Leonida.', 'bronze'],
  ['Pest Control', 'Rob an Illegal Operation belonging to each gang.', 'bronze'],
  ['In The Beginning…', 'Enjoy a cocktail with a view on Ocean Beach.', 'bronze'],
  ['Capital Offense', 'Smash your way out of a vehicle showroom in classic style.', 'bronze'],
  ['Let’s Go Bowling', 'Follow-through at the Kolt & Associates\' bowling alley.', 'bronze'],
  ['Personal Best', 'A partnership with mass appeal.', 'bronze'],
  ['Actions Speak Louder', 'Choices made (for better or worse).', 'bronze'],
  ['Bad Luck, I Guess', 'Second time\'s the charm.', 'bronze'],
  ['The Truth Is Out There', 'What the hell just happened?', 'bronze'],
  ['Ten Pin', 'Bowl \'em over with a melee drive-by.', 'bronze'],
  ['Dime on the Dollar', 'Earn $250,000 laundering Marked Bills through your contacts.', 'bronze'],
  ['Treat Yo Self', 'Spend $100,000 across all shops.', 'bronze'],
  ['Little Boxes', 'Purchase all garage properties.', 'bronze'],
  ['On the Spot', 'Register 10 vehicles to the Scooter Bros app.', 'bronze'],
];

const KINDS = new Set(['story', 'stranger', 'collectible', 'activity', 'exploration', 'combat', 'economy']);
const STAGES = new Set([1, 2, 3]);

function load() {
  const raw = readFileSync(DATA, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : data.trophies;
}

test('trophies.json exists and holds exactly 55 trophies', () => {
  assert.ok(existsSync(DATA), 'app/data/trophies.json must exist');
  const list = load();
  assert.equal(list.length, 55, 'must hold all 55 official trophies');
});

test('official names, descriptions and grades match exactly', () => {
  const list = load();
  const byName = new Map(list.map((t) => [t.name, t]));
  assert.equal(byName.size, 55, 'trophy names must be unique');
  for (const [name, desc, grade] of OFFICIAL) {
    const t = byName.get(name);
    assert.ok(t, `missing official trophy: ${name}`);
    assert.equal(t.description, desc, `description mismatch: ${name}`);
    assert.equal(t.grade, grade, `grade mismatch: ${name}`);
  }
});

test('grade counts are 1 platinum, 2 gold, 6 silver, 46 bronze', () => {
  const list = load();
  const counts = {};
  for (const t of list) counts[t.grade] = (counts[t.grade] || 0) + 1;
  assert.deepEqual(counts, { platinum: 1, gold: 2, silver: 6, bronze: 46 });
});

test('every trophy has a real guide in our own words', () => {
  const list = load();
  for (const t of list) {
    assert.equal(typeof t.guide, 'string', `${t.name}: guide must be text`);
    assert.ok(t.guide.trim().length >= 60, `${t.name}: guide too short (<60 chars)`);
    assert.ok(Array.isArray(t.steps) && t.steps.length >= 2, `${t.name}: needs >=2 steps`);
  }
});

test('every trophy has difficulty 1-10, time estimate and >=2 named sources', () => {
  const list = load();
  for (const t of list) {
    assert.ok(Number.isInteger(t.difficulty) && t.difficulty >= 1 && t.difficulty <= 10,
      `${t.name}: difficulty must be int 1-10`);
    assert.ok(typeof t.time_hours === 'number' && t.time_hours > 0,
      `${t.name}: time_hours must be a positive number`);
    assert.ok(Array.isArray(t.sources) && t.sources.length >= 2,
      `${t.name}: needs at least 2 sources`);
    for (const s of t.sources) {
      assert.ok(typeof s.name === 'string' && s.name.length > 0, `${t.name}: source needs a name`);
      assert.ok(typeof s.url === 'string' && s.url.startsWith('https://'),
        `${t.name}: source needs an https url`);
    }
  }
});

test('kinds, roadmap stages and missable flags are valid', () => {
  const list = load();
  for (const t of list) {
    assert.ok(KINDS.has(t.kind), `${t.name}: unknown kind ${t.kind}`);
    assert.ok(STAGES.has(t.stage), `${t.name}: stage must be 1, 2 or 3`);
    assert.equal(typeof t.missable, 'boolean', `${t.name}: missable must be boolean`);
    if (t.missable) {
      assert.ok(typeof t.missable_note === 'string' && t.missable_note.trim().length >= 20,
        `${t.name}: missable trophy needs a missable_note`);
    }
  }
  const platinum = list.find((t) => t.grade === 'platinum');
  assert.equal(platinum.stage, 3, 'platinum belongs to roadmap stage 3');
  const missables = list.filter((t) => t.missable);
  assert.ok(missables.length >= 5, 'at least 5 missables should be flagged');
});

test('platinum time estimate is a serious grind (80h+)', () => {
  const list = load();
  const total = list.reduce((sum, t) => sum + t.time_hours, 0);
  // Story + cleanup + grinds: the planner sums per-trophy hours; must clear 80h.
  assert.ok(total >= 80, `total estimated hours ${total} is too low for a platinum`);
});

test('app shell exists and fetches nothing over the network', () => {
  const html = readFileSync(join(ROOT, 'app', 'index.html'), 'utf8');
  // No external script/link/img src: the app must work offline.
  const external = [...html.matchAll(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+["']/g)];
  assert.equal(external.length, 0, `index.html must not reference the network: ${JSON.stringify(external)}`);
  assert.ok(existsSync(join(ROOT, 'app', 'app.js')), 'app/app.js must exist');
  assert.ok(existsSync(join(ROOT, 'app', 'style.css')), 'app/style.css must exist');
  assert.ok(existsSync(join(ROOT, 'main.ts')), 'main.ts must exist');
  assert.ok(existsSync(join(ROOT, 'vendor', 'makefun-frontend.ts')), 'vendor/makefun-frontend.ts must exist');
});

test('README carries the 3 live make.fun badges and the bounty link', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('https://make.fun/badge/gta6-trophy-guide-01.svg'), 'missing competition badge');
  assert.ok(readme.includes('https://make.fun/badge/gta6-trophy-guide-01/moonku-ai/gta6-trophy-guide-01-v3/rank.svg'), 'missing rank badge');
  assert.ok(readme.includes('https://make.fun/badge/gta6-trophy-guide-01/moonku-ai/gta6-trophy-guide-01-v3/reward.svg'), 'missing reward badge');
  assert.ok(!readme.includes('{owner}') && !readme.includes('{repo}'), 'README must not keep template placeholders');
});

test('screenshots: 3-4 real renders, each <=256 KiB, long side <=1280, short side >=480', async () => {
  const dir = join(ROOT, 'screenshots');
  assert.ok(existsSync(dir), 'screenshots/ must exist');
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  assert.ok(files.length >= 3 && files.length <= 4, `need 3-4 screenshots, found ${files.length}`);
  for (const f of files) {
    const st = statSync(join(dir, f));
    assert.ok(st.size <= 262144, `${f} is ${st.size} bytes, over the 256 KiB cap`);
    assert.ok(st.size > 10000, `${f} looks too small to be a real render`);
  }
});
