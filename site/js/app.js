/**
 * App controller — wires data, filters, table, keyboard shortcuts.
 * One module, one page.
 */

import { loadEntries } from './data.js';
import { computeStats, formatDate } from './stats.js';
import { applyFilters, defaultFilterState, activeChips, FILTER_DEFS } from './filters.js';
import { renderTable, COLUMNS } from './table.js';

const state = {
  entries: [],
  filterState: defaultFilterState(),
  selectedIndex: 0,
  expandedId: null,
  sortKey: 'id',
  sortDir: 'asc',
};

const els = {};

async function init() {
  cacheElements();
  bindEvents();
  state.entries = await loadEntries();
  updateStats();
  rerender();
}

function cacheElements() {
  els.statEntries = document.getElementById('stat-entries');
  els.statPapers  = document.getElementById('stat-papers');
  els.statUpdated = document.getElementById('stat-updated');
  els.search      = document.getElementById('search');
  els.chips       = document.getElementById('chips');
  els.addFilter   = document.getElementById('add-filter');
  els.filterPopover = document.getElementById('filter-popover');
  els.export      = document.getElementById('export-btn');
  els.help        = document.getElementById('help-btn');
  els.helpModal   = document.getElementById('help-modal');
  els.resultInfo  = document.getElementById('result-info');
  els.entries     = document.getElementById('entries');
}

function updateStats() {
  const stats = computeStats(state.entries);
  els.statEntries.textContent = stats.entryCount;
  els.statPapers.textContent  = stats.paperCount;
  els.statUpdated.textContent = stats.latestUpdate ? formatDate(stats.latestUpdate) : '—';
}

function bindEvents() {
  els.search.addEventListener('input', e => {
    state.filterState.search = e.target.value;
    state.selectedIndex = 0;
    rerender();
  });

  els.addFilter.addEventListener('click', e => {
    e.stopPropagation();
    toggleFilterPopover();
  });

  document.addEventListener('click', e => {
    if (!els.filterPopover.contains(e.target) && e.target !== els.addFilter) {
      els.filterPopover.hidden = true;
    }
  });

  els.export.addEventListener('click', () => downloadCSV());
  els.help.addEventListener('click', () => els.helpModal.classList.add('open'));
  els.helpModal.addEventListener('click', e => {
    if (e.target === els.helpModal) els.helpModal.classList.remove('open');
  });

  // chip remove
  els.chips.addEventListener('click', e => {
    const x = e.target.closest('.chip-x');
    if (!x) return;
    const key = x.dataset.key;
    if (key) {
      state.filterState[key] = '';
      rerender();
    }
  });

  // table interactions: row click toggles expand; header click sorts
  els.entries.addEventListener('click', e => {
    const sortHeader = e.target.closest('.entries-header > div');
    if (sortHeader) {
      const key = sortHeader.dataset.sort;
      if (!key) return;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = 'asc';
      }
      rerender();
      return;
    }

    const entryEl = e.target.closest('.entry');
    if (!entryEl) return;
    const id = entryEl.dataset.id;
    state.expandedId = state.expandedId === id ? null : id;
    state.selectedIndex = +entryEl.dataset.index;
    rerender();
  });

  // global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== els.search) {
      e.preventDefault();
      els.search.focus();
      return;
    }
    if (e.key === '?' && document.activeElement !== els.search) {
      els.helpModal.classList.add('open');
      return;
    }
    if (e.key === 'Escape') {
      if (els.helpModal.classList.contains('open')) {
        els.helpModal.classList.remove('open');
      } else if (state.expandedId) {
        state.expandedId = null;
        rerender();
      } else if (els.search.value) {
        els.search.value = '';
        state.filterState.search = '';
        rerender();
      } else {
        els.search.blur();
      }
      return;
    }
    if (document.activeElement === els.search) return;

    const filtered = currentFiltered();
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      state.selectedIndex = Math.min(state.selectedIndex + 1, filtered.length - 1);
      rerender();
      scrollSelectedIntoView();
    }
    if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
      rerender();
      scrollSelectedIntoView();
    }
    if (e.key === 'Enter') {
      const entry = filtered[state.selectedIndex];
      if (entry) {
        state.expandedId = state.expandedId === entry.id ? null : entry.id;
        rerender();
      }
    }
  });
}

function toggleFilterPopover() {
  if (els.filterPopover.hidden) {
    renderFilterPopover();
    els.filterPopover.hidden = false;
  } else {
    els.filterPopover.hidden = true;
  }
}

function renderFilterPopover() {
  const html = Object.entries(FILTER_DEFS).map(([key, def]) => {
    const value = state.filterState[key] ?? '';
    if (def.type === 'select') {
      const options = def.options.map(([v, label]) =>
        `<option value="${v}" ${v === value ? 'selected' : ''}>${label}</option>`
      ).join('');
      return `
        <div class="popover-row">
          <label>${def.label}</label>
          <select data-filter="${key}">${options}</select>
        </div>`;
    }
    return `
      <div class="popover-row">
        <label>${def.label}</label>
        <input type="number" step="any" data-filter="${key}" value="${value}" />
      </div>`;
  }).join('');

  els.filterPopover.innerHTML = html;
  els.filterPopover.querySelectorAll('[data-filter]').forEach(input => {
    input.addEventListener('input', e => {
      state.filterState[e.target.dataset.filter] = e.target.value;
      state.selectedIndex = 0;
      rerender();
    });
  });
}

function rerender() {
  const filtered = currentFiltered();
  const sorted = sortEntries(filtered);

  // chips
  const chips = activeChips(state.filterState);
  els.chips.innerHTML = chips.length === 0 ? '' : chips.map(c => `
    <span class="chip">
      <span class="chip-key">${c.chipKey}</span>${escape(c.value)}
      <span class="chip-x" data-key="${c.key}" title="Remove filter">×</span>
    </span>`).join('');

  // result info
  els.resultInfo.innerHTML = state.entries.length === 0
    ? `<span>No entries yet — <a href="https://github.com/PrinciplesKJ/K-netics/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">contribute the first one ↗</a></span>`
    : `<strong>${sorted.length}</strong> of ${state.entries.length} ${state.entries.length === 1 ? 'entry' : 'entries'}
       ${chips.length || state.filterState.search ? '· filtered' : ''}`;

  renderTable(els.entries, sorted, {
    selectedIndex: state.selectedIndex,
    expandedId: state.expandedId,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
  });
}

function currentFiltered() {
  return applyFilters(state.entries, state.filterState);
}

function sortEntries(entries) {
  const key = state.sortKey;
  const dir = state.sortDir;
  return [...entries].sort((a, b) => {
    const va = a[key], vb = b[key];
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = (typeof va === 'number' && typeof vb === 'number')
      ? va - vb
      : String(va).localeCompare(String(vb));
    return dir === 'desc' ? -cmp : cmp;
  });
}

function scrollSelectedIntoView() {
  const el = els.entries.querySelector('.entry.selected');
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function downloadCSV() {
  const filtered = sortEntries(currentFiltered());
  if (!filtered.length) return;

  const cols = COLUMNS.map(c => c.key);
  const header = cols.join(',');
  const rows = filtered.map(e => cols.map(c => csvCell(e[c])).join(','));
  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `knetics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

init();
