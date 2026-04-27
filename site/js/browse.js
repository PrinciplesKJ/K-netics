/**
 * Browse page controller — wires data, filters, table, and detail panel.
 * UI elements are looked up by id; replace HTML structure freely as long as ids match.
 */

import { loadEntries } from './data.js';
import { applyFilters, defaultFilterState, FILTER_DEFS } from './filters.js';
import { renderTable, COLUMNS } from './table.js';
import { showDetail, closeDetail } from './detail.js';

const state = {
  entries: [],
  filterState: defaultFilterState(),
  sortKey: 'id',
  sortDir: 'asc',
};

const els = {};

async function init() {
  cacheElements();
  buildFilterUI();
  bindEvents();
  state.entries = await loadEntries();
  rerender();
}

function cacheElements() {
  els.filters    = document.getElementById('filters');
  els.table      = document.getElementById('table');
  els.resultInfo = document.getElementById('result-info');
  els.detail     = document.getElementById('detail-panel');
  els.overlay    = document.getElementById('detail-overlay');
  els.download   = document.getElementById('download-filtered');
  els.reset      = document.getElementById('reset-filters');
}

function buildFilterUI() {
  els.filters.innerHTML = Object.entries(FILTER_DEFS).map(([key, def]) => {
    if (def.type === 'select') {
      const options = def.options.map(([v, label]) =>
        `<option value="${v}">${label}</option>`).join('');
      return `
        <div class="filter-group">
          <label class="filter-label" for="f-${key}">${def.label}</label>
          <select class="input" id="f-${key}" data-filter="${key}">${options}</select>
        </div>`;
    }
    if (def.type === 'text') {
      return `
        <div class="filter-group">
          <label class="filter-label" for="f-${key}">${def.label}</label>
          <input class="input input-search" id="f-${key}" type="search"
                 data-filter="${key}" placeholder="${def.placeholder || ''}">
        </div>`;
    }
    return `
      <div class="filter-group">
        <label class="filter-label" for="f-${key}">${def.label}</label>
        <input class="input" id="f-${key}" type="number" step="any"
               data-filter="${key}" placeholder="${def.default ?? ''}">
      </div>`;
  }).join('');
}

function bindEvents() {
  els.filters.addEventListener('input', e => {
    const key = e.target.dataset.filter;
    if (!key) return;
    state.filterState[key] = e.target.value;
    rerender();
  });

  els.table.addEventListener('sort', e => {
    state.sortKey = e.detail.key;
    state.sortDir = e.detail.dir;
    rerender();
  });

  els.reset?.addEventListener('click', () => {
    state.filterState = defaultFilterState();
    els.filters.querySelectorAll('[data-filter]').forEach(el => el.value = '');
    rerender();
  });

  els.download?.addEventListener('click', () => downloadFilteredCSV());

  els.overlay?.addEventListener('click', () => closeDetail(els.detail, els.overlay));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetail(els.detail, els.overlay);
  });
}

function rerender() {
  const filtered = applyFilters(state.entries, state.filterState);
  renderTable(els.table, filtered, {
    onRowClick: entry => showDetail(entry, els.detail, els.overlay),
    sortKey: state.sortKey,
    sortDir: state.sortDir,
  });
  els.resultInfo.textContent =
    `${filtered.length} of ${state.entries.length} ${state.entries.length === 1 ? 'entry' : 'entries'}`;
}

function downloadFilteredCSV() {
  const filtered = applyFilters(state.entries, state.filterState);
  if (!filtered.length) return;

  const cols = COLUMNS.map(c => c.key);
  const header = cols.join(',');
  const rows = filtered.map(e =>
    cols.map(c => csvCell(e[c])).join(',')
  );
  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `knetics-filtered-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

init();
