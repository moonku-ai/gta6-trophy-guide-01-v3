// Vice After Dark — GTA VI trophy guide & tracker.
// Plain ES module, no dependencies, no network: it fetches only
// data/trophies.json from its own folder and stores progress in localStorage.
const STORE_KEY = 'vice-after-dark-v3';

const state = {
  trophies: [],
  earned: new Set(),
  notes: {},
  view: 'checklist',
  openId: null,
  q: '',
  kind: '',
  grade: '',
  diff: '',
  hideEarned: false,
  spoiler: true,
  hoursPerWeek: 10,
  sessionsPerWeek: 3,
};

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned);
    if (data.notes && typeof data.notes === 'object') state.notes = data.notes;
    if (typeof data.hoursPerWeek === 'number') state.hoursPerWeek = data.hoursPerWeek;
    if (typeof data.sessionsPerWeek === 'number') state.sessionsPerWeek = data.sessionsPerWeek;
  } catch { /* corrupted save: start fresh */ }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      earned: [...state.earned],
      notes: state.notes,
      hoursPerWeek: state.hoursPerWeek,
      sessionsPerWeek: state.sessionsPerWeek,
    }));
  } catch { /* storage full or blocked: progress just won't persist */ }
}

function applyParams() {
  const p = new URLSearchParams(location.search);
  const view = p.get('view');
  if (view && ['checklist', 'roadmap', 'missables', 'hardest', 'planner', 'print'].includes(view)) {
    state.view = view;
  }
  const seed = parseInt(p.get('seed') || '', 10);
  if (Number.isFinite(seed) && seed > 0) {
    // Seed the first N non-platinum trophies as earned (demo progress for
    // screenshots): the platinum itself is never seeded.
    state.trophies.filter((t) => t.grade !== 'platinum')
      .slice(0, Math.min(seed, state.trophies.length))
      .forEach((t) => state.earned.add(t.id));
  }
  if (p.get('spoiler') === 'off') state.spoiler = false;
  if (p.get('spoiler') === 'on') state.spoiler = true;
  const open = parseInt(p.get('open') || '', 10);
  if (Number.isFinite(open)) state.openId = open;
  if (p.get('grade')) state.grade = p.get('grade');
  if (p.get('kind')) state.kind = p.get('kind');
  if (p.get('q')) state.q = p.get('q');
}

function isHidden(t) {
  return state.spoiler && t.spoiler && !state.earned.has(t.id);
}

function displayName(t) {
  return isHidden(t) ? 'Hidden story trophy' : t.name;
}

function displayDesc(t) {
  return isHidden(t) ? 'Earn this trophy to reveal its name and description.' : t.description;
}

function diffBar(d) {
  return '●'.repeat(d) + '○'.repeat(10 - d);
}

function totalHours(list) {
  return list.reduce((s, t) => s + t.time_hours, 0);
}

function updateRing() {
  const earned = state.earned.size;
  const total = state.trophies.length || 55;
  const pct = Math.round((earned / total) * 100);
  $('#ring-count').textContent = `${earned} / ${total} earned`;
  const remaining = totalHours(state.trophies.filter((t) => !state.earned.has(t.id)));
  $('#ring-hours').textContent = remaining === 0
    ? 'Platinum earned — Leonida Legend!'
    : `~${Math.round(remaining)} hours left to platinum`;
  $('#ring-pct').textContent = `${pct}%`;
  $('#ring-fill').style.strokeDashoffset = String(263.9 * (1 - earned / total));
  $('#nav-checklist-count').textContent = `${earned}/${total}`;
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade && t.grade !== state.grade) return false;
    if (state.diff && t.difficulty > Number(state.diff)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function nextUp() {
  const rest = state.trophies
    .filter((t) => !state.earned.has(t.id) && t.grade !== 'platinum')
    .sort((a, b) => a.stage - b.stage || a.difficulty - b.difficulty);
  return rest[0] || null;
}

function renderChecklist() {
  const list = filtered();
  const next = nextUp();
  const open = state.openId != null
    ? state.trophies.find((t) => t.id === state.openId) : null;
  main.innerHTML = `
    <section class="view">
      <h2>Checklist — all 55 trophies</h2>
      <p class="lede">Tick trophies off as you earn them. ${next
        ? `Next up: <b>${esc(displayName(next))}</b> — difficulty ${next.difficulty}/10, about ${next.time_hours} hour${next.time_hours === 1 ? '' : 's'}.`
        : 'Every trophy earned — the platinum is yours.'}
      Every guide cites its sources; open one to read it.</p>
      <div class="check-grid">
        <div>
          <div class="toolbar">
            <span>${list.length} of ${state.trophies.length} shown</span>
            <button class="pill" data-filter="missable">Missable only</button>
            <button class="pill" data-filter="unearned">Not earned yet</button>
          </div>
          <ul class="tlist">
            ${list.map((t) => `
            <li class="trow ${state.earned.has(t.id) ? 'earned' : ''} ${state.openId === t.id ? 'open' : ''}" data-id="${t.id}">
              <input type="checkbox" data-check="${t.id}" ${state.earned.has(t.id) ? 'checked' : ''} aria-label="Earned: ${esc(displayName(t))}">
              <span class="medal ${t.grade}" title="${t.grade}"></span>
              <div>
                <div class="tname">${esc(displayName(t))}<span class="grade-tag">${t.grade}</span></div>
                <div class="tdesc">${esc(displayDesc(t))}</div>
                <div class="tmeta">
                  <span class="diffbar" title="Difficulty ${t.difficulty}/10">${diffBar(t.difficulty)}</span>
                  <span>~${t.time_hours}h</span>
                  <span>Stage ${t.stage}</span>
                  ${t.missable ? '<span class="flag-miss">Missable</span>' : ''}
                  ${t.spoiler ? '<span class="flag-spoil">Story spoiler</span>' : ''}
                </div>
              </div>
              <button class="openbtn" data-open="${t.id}">Guide</button>
            </li>`).join('') || '<li class="empty">No trophies match these filters. Clear the search or widen the filters.</li>'}
          </ul>
        </div>
        <aside class="detail" id="detail">${open ? detailHtml(open) : `
          <h3>Pick a trophy</h3>
          <p class="guide">Open any trophy's guide to read what to do, where and when it can be missed — with its difficulty, time estimate, steps and named sources.</p>
          <p class="guide">The guide is written from the official descriptions. Where the official list does not pin a place down, it says so instead of inventing one.</p>`}
        </aside>
      </div>
    </section>`;
}

function detailHtml(t) {
  const hidden = isHidden(t);
  return `
    <button class="closebtn" data-close="1">Close</button>
    <h3>${esc(displayName(t))}</h3>
    <div class="dgrade">${t.grade} · ${t.kind} · Stage ${t.stage}${t.missable ? ' · Missable' : ''}</div>
    <p class="ddesc">${esc(displayDesc(t))}</p>
    ${hidden ? `<p class="guide">The spoiler guard is on: this story trophy's guide, steps and sources stay hidden until you earn it. Tick it off in the checklist to reveal them.</p>` : `
    ${t.missable && t.missable_note ? `<div class="miss-note"><b>Why it can be missed:</b> ${esc(t.missable_note)}</div>` : ''}
    <div class="dstats">
      <span>Difficulty <b>${t.difficulty}/10</b></span>
      <span>Time <b>~${t.time_hours}h</b></span>
      <span class="diffbar">${diffBar(t.difficulty)}</span>
    </div>
    <ul class="sources"><b>Sources</b>
      ${t.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}
    </ul>
    <p class="guide">${esc(t.guide)}</p>
    <ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`}
    <label for="note-${t.id}">Your notes</label>
    <textarea id="note-${t.id}" data-note="${t.id}" placeholder="e.g. 3 of 14 drone races won…">${esc(state.notes[t.id] || '')}</textarea>`;
}

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', text: 'Finish all four chapters and the final mission, and clear the story-tied missables before the finale. Everything else can wait.' },
  { n: 2, title: 'Stage 2 — Sweep Leonida', text: 'Stranger strands, collectibles, activities and exploration. This is the biggest stage — do it by category, not by wandering.' },
  { n: 3, title: 'Stage 3 — The grinds', text: 'The long ones: 42 gold shooting challenges, 250 stunts, 100% completion and the money trophies. Save these for last, when nothing else competes for your time.' },
];

function renderRoadmap() {
  main.innerHTML = `
    <section class="view">
      <h2>Roadmap to the platinum</h2>
      <p class="lede">Three stages, in order. Finish the story first, sweep the map second, grind last. Hours are the guide's estimates from the per-trophy times — the story stage overlaps with some side work, so treat the total as a ceiling, not a promise.</p>
      <div class="cards">
        ${STAGES.map((s) => {
          const items = state.trophies.filter((t) => t.stage === s.n);
          const done = items.filter((t) => state.earned.has(t.id)).length;
          const pct = Math.round((done / items.length) * 100);
          return `<div class="stage-card">
            <h3>${esc(s.title)} <span class="stage-hours">~${Math.round(totalHours(items))}h · ${done}/${items.length}</span></h3>
            <p>${esc(s.text)}</p>
            <div class="pbar"><i style="width:${pct}%"></i></div>
            <ul>${items.map((t) => `<li class="${state.earned.has(t.id) ? 'done' : ''}">${esc(displayName(t))} <span style="color:var(--faint)">(${t.grade}, ${t.time_hours}h)</span></li>`).join('')}</ul>
          </div>`;
        }).join('')}
      </div>
    </section>`;
}

function renderMissables() {
  const list = state.trophies.filter((t) => t.missable);
  main.innerHTML = `
    <section class="view">
      <h2>Missables — do these before the finale</h2>
      <p class="lede">Seven trophies are flagged missable, built from the official descriptions: each one names a moment, a partner or a choice that may not come back. Clear them before the final mission — mission replay is the only way back, and the official list does not promise every moment replays.</p>
      <div class="cards">
        ${list.map((t) => `<div class="stage-card">
          <h3>${esc(displayName(t))} <span class="stage-hours">${t.grade} · ~${t.time_hours}h</span></h3>
          <p>${esc(displayDesc(t))}</p>
          <div class="miss-note" style="margin:0"><b>Why it can be missed:</b> ${esc(t.missable_note)}</div>
          <p style="margin-top:10px">${esc(t.guide)}</p>
        </div>`).join('')}
      </div>
    </section>`;
}

function renderHardest() {
  const ranked = [...state.trophies]
    .filter((t) => t.grade !== 'platinum')
    .sort((a, b) => b.difficulty - a.difficulty || b.time_hours - a.time_hours)
    .slice(0, 10);
  main.innerHTML = `
    <section class="view">
      <h2>Hardest trophies</h2>
      <p class="lede">Ranked by the guide's difficulty rating (1–10), then by time. The platinum itself is a 10/10 by definition, so this list ranks the 54 trophies that earn it. Use the difficulty filter in the sidebar to hide anything above your comfort level.</p>
      <div class="hard-list">
        ${ranked.map((t, i) => `<div class="hard-row">
          <span class="rank">#${i + 1}</span>
          <div><b>${esc(displayName(t))}</b> <span style="color:var(--muted)">— ${esc(displayDesc(t))}</span></div>
          <div class="hbar"><i style="width:${t.difficulty * 10}%"></i></div>
          <span>${t.difficulty}/10 · ~${t.time_hours}h</span>
        </div>`).join('')}
      </div>
      <p class="lede" style="margin-top:16px">The Shootist (42 gold shooting challenges) and A Long Road (100% completion) are the two that most players will finish last. Plan for them in the Planner tab.</p>
    </section>`;
}

function renderPlanner() {
  const remaining = state.trophies.filter((t) => !state.earned.has(t.id));
  const hoursLeft = totalHours(remaining);
  const weeks = state.hoursPerWeek > 0 ? Math.ceil(hoursLeft / state.hoursPerWeek) : 0;
  const eta = new Date(Date.now() + weeks * 7 * 86400000);
  const perSession = state.sessionsPerWeek > 0
    ? (hoursLeft / Math.max(weeks * state.sessionsPerWeek, 1)).toFixed(1) : '0';
  main.innerHTML = `
    <section class="view">
      <h2>Platinum planner</h2>
      <p class="lede">Your ETA is computed from the trophies you have not earned yet and the per-trophy time estimates in this guide. Change your weekly play time and it updates instantly.</p>
      <div class="planner-grid">
        <div class="panel">
          <h3>Your sessions</h3>
          <label for="hpw">Hours you play per week</label>
          <input type="number" id="hpw" min="1" max="100" value="${state.hoursPerWeek}">
          <label for="spw">Sessions per week</label>
          <input type="number" id="spw" min="1" max="21" value="${state.sessionsPerWeek}">
          <p style="color:var(--muted);font-size:13px">At ${state.hoursPerWeek} hours a week over ${state.sessionsPerWeek} sessions, each session is about ${perSession} hours of trophy work.</p>
        </div>
        <div class="panel">
          <h3>Your ETA</h3>
          <div class="big-eta">${weeks === 0 ? 'Done!' : `${weeks} week${weeks === 1 ? '' : 's'}`}</div>
          <p>${hoursLeft === 0
            ? 'Every trophy earned. The platinum is yours, Leonida Legend.'
            : `About <b>${Math.round(hoursLeft)} hours</b> of trophy work left across ${remaining.length} trophies — platinum around <b>${eta.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</b> at your current pace.`}</p>
          <table class="plan-table">
            <tr><th>Stage</th><th>Left</th><th class="num">Hours left</th></tr>
            ${STAGES.map((s) => {
              const items = remaining.filter((t) => t.stage === s.n);
              return `<tr><td>Stage ${s.n}</td><td>${items.length} trophies</td><td class="num">~${Math.round(totalHours(items))}h</td></tr>`;
            }).join('')}
          </table>
        </div>
      </div>
    </section>`;
}

function renderPrint() {
  main.innerHTML = `
    <section class="view">
      <h2>Printable checklist</h2>
      <p class="lede">Print this page (Ctrl/Cmd + P) and tick trophies off on paper. Spoiler-hidden story trophies print as “Hidden story trophy” while the spoiler guard is on — turn it off in the sidebar to print the full names.</p>
      <table class="print-table">
        <tr><th></th><th>Trophy</th><th>Grade</th><th>Diff.</th><th>Time</th><th>Stage</th></tr>
        ${state.trophies.map((t) => `<tr>
          <td class="box">${state.earned.has(t.id) ? '☑' : '☐'}</td>
          <td><b>${esc(displayName(t))}</b><br><span style="color:var(--muted)">${esc(displayDesc(t))}</span></td>
          <td>${t.grade}</td><td>${t.difficulty}/10</td><td>~${t.time_hours}h</td><td>${t.stage}</td>
        </tr>`).join('')}
      </table>
    </section>`;
}

function render() {
  document.querySelectorAll('.navbtn').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });
  ({ checklist: renderChecklist, roadmap: renderRoadmap, missables: renderMissables,
    hardest: renderHardest, planner: renderPlanner, print: renderPrint })[state.view]();
  updateRing();
}

function bindGlobal() {
  document.querySelectorAll('.navbtn').forEach((b) => {
    b.addEventListener('click', () => { state.view = b.dataset.view; render(); });
  });
  $('#q').addEventListener('input', (e) => { state.q = e.target.value; if (state.view !== 'checklist') state.view = 'checklist'; render(); });
  $('#kind').addEventListener('change', (e) => { state.kind = e.target.value; if (state.view !== 'checklist') state.view = 'checklist'; render(); });
  $('#grade').addEventListener('change', (e) => { state.grade = e.target.value; if (state.view !== 'checklist') state.view = 'checklist'; render(); });
  $('#diff').addEventListener('change', (e) => { state.diff = e.target.value; if (state.view !== 'checklist') state.view = 'checklist'; render(); });
  $('#hide-earned').addEventListener('change', (e) => { state.hideEarned = e.target.checked; render(); });
  $('#spoiler').addEventListener('change', (e) => { state.spoiler = e.target.checked; render(); });
  $('#export-btn').addEventListener('click', () => {
    const blob = new Blob([localStorage.getItem(STORE_KEY) || '{}'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-after-dark-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.earned)) state.earned = new Set(data.earned);
      if (data.notes) state.notes = data.notes;
      save(); render();
    } catch { alert('That file is not a valid progress export.'); }
  });
  $('#reset-btn').addEventListener('click', () => {
    if (confirm('Reset all progress and notes?')) {
      state.earned = new Set(); state.notes = {}; save(); render();
    }
  });

  // Delegated events inside the rendered main area.
  main.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open]');
    if (openBtn) { state.openId = Number(openBtn.dataset.open); render(); return; }
    if (e.target.closest('[data-close]')) { state.openId = null; render(); return; }
    const pill = e.target.closest('[data-filter]');
    if (pill) {
      if (pill.dataset.filter === 'missable') { state.kind = state.kind === 'missable' ? '' : 'missable'; $('#kind').value = state.kind; }
      if (pill.dataset.filter === 'unearned') { state.hideEarned = !state.hideEarned; $('#hide-earned').checked = state.hideEarned; }
      render();
    }
  });
  main.addEventListener('change', (e) => {
    const check = e.target.closest('[data-check]');
    if (check) {
      const id = Number(check.dataset.check);
      if (check.checked) state.earned.add(id); else state.earned.delete(id);
      save(); render(); return;
    }
    if (e.target.id === 'hpw') { state.hoursPerWeek = Math.max(1, Number(e.target.value) || 10); save(); render(); }
    if (e.target.id === 'spw') { state.sessionsPerWeek = Math.max(1, Number(e.target.value) || 3); save(); render(); }
  });
  main.addEventListener('input', (e) => {
    const note = e.target.closest('[data-note]');
    if (note) { state.notes[Number(note.dataset.note)] = note.value; save(); }
  });
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  state.trophies = Array.isArray(data) ? data : data.trophies;
  loadStored();
  applyParams();
  // Keep the sidebar in sync with URL params.
  $('#spoiler').checked = state.spoiler;
  if (state.grade) $('#grade').value = state.grade;
  if (state.kind) $('#kind').value = state.kind;
  if (state.q) $('#q').value = state.q;
  bindGlobal();
  render();
}

boot();
