/**
 * Table renderer — sortable columns, click-to-detail.
 * Swap COLUMNS or replace this whole module to change the table presentation.
 */

export const COLUMNS = [
  { key: 'id',                label: 'ID',         sortable: true,  format: v => v ?? '—' },
  { key: 'first_author',      label: 'Author',     sortable: true,  format: v => v ?? '—' },
  { key: 'year',              label: 'Year',       sortable: true,  format: v => v ?? '—', cls: 'num' },
  { key: 'toehold_length',    label: 'Toehold',    sortable: true,  format: v => v ?? '—', cls: 'num' },
  { key: 'k_eff',             label: 'k_eff (M⁻¹s⁻¹)', sortable: true, format: v => v == null ? '—' : v.toExponential(2), cls: 'num' },
  { key: 'temperature',       label: 'T (°C)',     sortable: true,  format: v => v ?? '—', cls: 'num' },
  { key: 'mismatch_count',    label: 'MM',         sortable: true,  format: v => v ?? 0, cls: 'num' },
  { key: 'confidence',        label: 'Conf.',      sortable: true,  format: v => `<span class="chip chip-confidence-${v}">${v}</span>` },
];

export function renderTable(container, entries, { onRowClick, sortKey, sortDir }) {
  if (!entries.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">∅</div>
        <p>No entries match the current filters.</p>
      </div>`;
    return;
  }

  const sorted = sortKey
    ? [...entries].sort((a, b) => compareValues(a[sortKey], b[sortKey], sortDir))
    : entries;

  const headerHTML = COLUMNS.map(col => `
    <th data-sort-key="${col.key}"
        class="${sortKey === col.key ? `sorted-${sortDir}` : ''} ${col.cls || ''}">
      ${escape(col.label)}
    </th>
  `).join('');

  const rowsHTML = sorted.map(entry => `
    <tr data-id="${escape(entry.id)}">
      ${COLUMNS.map(col => `
        <td class="${col.cls || ''}">${col.format(entry[col.key])}</td>
      `).join('')}
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="data-table">
      <thead><tr>${headerHTML}</tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>`;

  container.querySelectorAll('th[data-sort-key]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortKey;
      const dir = (sortKey === key && sortDir === 'asc') ? 'desc' : 'asc';
      container.dispatchEvent(new CustomEvent('sort', { detail: { key, dir } }));
    });
  });

  container.querySelectorAll('tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const id = tr.dataset.id;
      const entry = entries.find(e => e.id === id);
      if (entry && onRowClick) onRowClick(entry);
    });
  });
}

function compareValues(a, b, dir) {
  if (a == null) return 1;
  if (b == null) return -1;
  const cmp = typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b));
  return dir === 'desc' ? -cmp : cmp;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
