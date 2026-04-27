/**
 * Table renderer — CSS grid rows, inline expand-on-click.
 * Pure rendering: no internal state. Caller manages selection/expansion.
 */

import { renderInvader, renderStrand } from './sequence.js';

/** Approximate log-scale max for k_eff bar (10^8 saturates the bar). */
const K_EFF_LOG_MAX = 8;
const K_EFF_LOG_MIN = 0;

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fmtKEff(v) {
  if (v == null || !isFinite(v)) return '—';
  return v.toExponential(2).replace('e+', 'e');
}

function kEffBarPct(v) {
  if (v == null || v <= 0) return 0;
  const logV = Math.log10(v);
  const pct = ((logV - K_EFF_LOG_MIN) / (K_EFF_LOG_MAX - K_EFF_LOG_MIN)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export const COLUMNS = [
  { key: 'id',             label: 'ID',          cls: 'col-id' },
  { key: 'first_author',   label: 'Author',      cls: 'col-author' },
  { key: 'year',           label: 'Year',        cls: 'col-year' },
  { key: 'invader_seq',    label: 'Sequence',    cls: 'col-seq',  sortable: false },
  { key: 'k_eff',          label: 'k_eff',       cls: 'col-keff' },
  { key: 'temperature',    label: 'T',           cls: 'col-temp' },
  { key: 'mismatch_count', label: 'MM',          cls: 'col-mm' },
  { key: 'confidence',     label: 'Conf',        cls: 'col-conf' },
];

function renderRow(entry, index, { selected, expanded }) {
  const cls = ['entry'];
  if (selected) cls.push('selected');
  if (expanded) cls.push('expanded');

  return `
    <div class="${cls.join(' ')}" data-id="${escape(entry.id)}" data-index="${index}">
      <div class="entry-row">
        <div class="col-id">${escape(entry.id)}</div>
        <div class="col-author">${escape(entry.first_author || '—')}</div>
        <div class="col-year">${escape(entry.year ?? '—')}</div>
        <div class="col-seq">${renderInvader(entry, { showLabel: false })}</div>
        <div class="col-keff">
          <span class="keff-value">${fmtKEff(entry.k_eff)}</span>
          <span class="keff-bar"><span class="keff-fill" style="width: ${kEffBarPct(entry.k_eff)}%"></span></span>
        </div>
        <div class="col-temp">${entry.temperature ?? '—'}</div>
        <div class="col-mm">${entry.mismatch_count ?? 0}</div>
        <div class="col-conf">
          <span class="conf-dot conf-${entry.confidence}"></span>${entry.confidence ?? '—'}
        </div>
      </div>
      ${expanded ? renderDetail(entry) : ''}
    </div>
  `;
}

const REPO = 'https://github.com/PrinciplesKJ/K-netics';

function renderDetail(entry) {
  const doi = entry.doi
    ? `<a href="https://doi.org/${escape(entry.doi)}" target="_blank" rel="noopener">${escape(entry.doi)} ↗</a>`
    : '—';

  const editUrl    = `${REPO}/edit/main/data/entries/${escape(entry.id)}.json`;
  const flagUrl    = `${REPO}/issues/new?template=flag.yml&entry_id=${escape(entry.id)}&title=${encodeURIComponent('Flag ' + entry.id)}`;
  const historyUrl = `${REPO}/commits/main/data/entries/${escape(entry.id)}.json`;

  return `
    <div class="entry-detail">
      <div class="detail-actions">
        <a class="btn btn-ghost" href="${editUrl}" target="_blank" rel="noopener" title="Open this entry in the GitHub web editor">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Suggest edit
        </a>
        <a class="btn btn-ghost" href="${flagUrl}" target="_blank" rel="noopener" title="Open a flag issue for this entry">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></svg>
          Flag
        </a>
        <a class="btn btn-ghost" href="${historyUrl}" target="_blank" rel="noopener" title="View edit history of this entry">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>
          History
        </a>
      </div>
      <div class="detail-strands">
        ${renderStrand('sub', entry.substrate_seq)}
        ${renderStrand('inc', entry.incumbent_seq)}
        ${renderInvader(entry, { showLabel: true })}
      </div>

      <div class="detail-grid" style="margin-top: var(--space-4);">
        <div class="detail-section">
          <div class="detail-section-title">Source</div>
          <dl class="detail-row"><dt>DOI</dt><dd>${doi}</dd></dl>
          <dl class="detail-row"><dt>First author</dt><dd>${escape(entry.first_author || '—')} (${entry.year ?? '—'})</dd></dl>
          <dl class="detail-row"><dt>Curated by</dt><dd>${escape(entry.curated_by || '—')} · ${escape(entry.curation_date || '—')}</dd></dl>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">Domains</div>
          <dl class="detail-row"><dt>Toehold</dt><dd>${entry.toehold_length} nt · ${escape(entry.toehold_seq || '—')}</dd></dl>
          <dl class="detail-row"><dt>BM</dt><dd>${entry.branch_migration_length} nt · ${escape(entry.branch_migration_seq || '—')}</dd></dl>
          <dl class="detail-row"><dt>Mismatches</dt><dd>${entry.mismatch_count || 0}${entry.mismatches?.length ? ' · pos ' + entry.mismatches.map(m => m.position).join(',') : ''}</dd></dl>
          <dl class="detail-row"><dt>Features</dt><dd>${[
            entry.hairpin && 'hairpin',
            entry.clamps && 'clamps',
            entry.terminal_gc && 'GC-clamp',
            entry.modified_bases,
          ].filter(Boolean).join(' · ') || 'none'}</dd></dl>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">Kinetics</div>
          <dl class="detail-row"><dt>k_eff</dt><dd>${fmtKEff(entry.k_eff)} M⁻¹s⁻¹${entry.k_eff_error ? ' ± ' + fmtKEff(entry.k_eff_error) : ''}</dd></dl>
          <dl class="detail-row"><dt>k_leak</dt><dd>${entry.k_leak == null ? '—' : fmtKEff(entry.k_leak)}</dd></dl>
          <dl class="detail-row"><dt>Method</dt><dd>${escape(entry.measurement_method || '—')}</dd></dl>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">Conditions</div>
          <dl class="detail-row"><dt>T</dt><dd>${entry.temperature ?? '—'} °C</dd></dl>
          <dl class="detail-row"><dt>Buffer</dt><dd>${escape(entry.buffer || '—')}</dd></dl>
          <dl class="detail-row"><dt>[Na⁺]</dt><dd>${entry.na_concentration_mM ?? '—'} mM</dd></dl>
          <dl class="detail-row"><dt>[Mg²⁺]</dt><dd>${entry.mg_concentration_mM ?? '—'} mM</dd></dl>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">Thermodynamics</div>
          <dl class="detail-row"><dt>ΔG toehold</dt><dd>${entry.dg_toehold_kcal_mol ?? '—'}</dd></dl>
          <dl class="detail-row"><dt>ΔG inc:sub</dt><dd>${entry.dg_incumbent_duplex_kcal_mol ?? '—'}</dd></dl>
          <dl class="detail-row"><dt>ΔG inv:sub</dt><dd>${entry.dg_invader_duplex_kcal_mol ?? '—'}</dd></dl>
        </div>
      </div>
    </div>
  `;
}

export function renderTable(container, entries, { selectedIndex, expandedId, sortKey, sortDir }) {
  const headerHTML = COLUMNS.map(col => {
    const isSorted = sortKey === col.key;
    return `<div class="${col.cls} ${isSorted ? `sorted ${sortDir}` : ''}" data-sort="${col.key}">${escape(col.label)}</div>`;
  }).join('');

  const rowsHTML = entries.length
    ? entries.map((e, i) => renderRow(e, i, {
        selected: i === selectedIndex,
        expanded: e.id === expandedId,
      })).join('')
    : `<div class="empty-state">
        <div class="empty-state-icon">∅</div>
        No entries match the current filters.
      </div>`;

  container.innerHTML = `
    <div class="entries-header">${headerHTML}</div>
    ${rowsHTML}
  `;
}
