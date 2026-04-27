/**
 * Detail panel — slide-in side panel showing all fields of one entry.
 * Swap this for a route-based detail page if you prefer URLs per entry.
 */

const FIELDS = [
  ['Identity', [
    ['id', 'ID'],
    ['doi', 'DOI', v => v ? `<a href="https://doi.org/${v}" target="_blank" rel="noopener">${v}</a>` : '—'],
    ['first_author', 'First author'],
    ['year', 'Year'],
    ['confidence', 'Confidence', v => `<span class="chip chip-confidence-${v}">${v}</span>`],
    ['curated_by', 'Curated by'],
    ['curation_date', 'Curation date'],
  ]],
  ['Reaction', [
    ['reaction_type', 'Type'],
    ['nucleic_acid', 'NA'],
  ]],
  ['Strands (5\'→3\')', [
    ['substrate_seq', 'Substrate'],
    ['incumbent_seq', 'Incumbent'],
    ['invader_seq', 'Invader'],
  ]],
  ['Domains', [
    ['toehold_seq', 'Toehold seq'],
    ['toehold_length', 'Toehold length'],
    ['branch_migration_seq', 'BM seq'],
    ['branch_migration_length', 'BM length'],
  ]],
  ['Features', [
    ['mismatch_count', 'Mismatches'],
    ['hairpin', 'Hairpin', formatBool],
    ['clamps', 'Clamps', formatBool],
    ['clamp_description', 'Clamp desc'],
    ['modified_bases', 'Modified bases'],
    ['terminal_gc', 'Terminal G-C', formatBool],
    ['other_features', 'Other'],
  ]],
  ['Kinetics', [
    ['k_eff', 'k_eff (M⁻¹s⁻¹)', formatNumber],
    ['k_eff_error', 'k_eff error', formatNumber],
    ['k_leak', 'k_leak', formatNumber],
    ['k_leak_error', 'k_leak error', formatNumber],
    ['measurement_method', 'Method'],
  ]],
  ['Conditions', [
    ['temperature', 'T (°C)'],
    ['buffer', 'Buffer'],
    ['na_concentration_mM', '[Na⁺] (mM)'],
    ['mg_concentration_mM', '[Mg²⁺] (mM)'],
  ]],
  ['Thermodynamics', [
    ['dg_toehold_kcal_mol', 'ΔG toehold (kcal/mol)'],
    ['dg_incumbent_duplex_kcal_mol', 'ΔG incumbent (kcal/mol)'],
    ['dg_invader_duplex_kcal_mol', 'ΔG invader (kcal/mol)'],
  ]],
];

function formatBool(v) { return v === true ? 'Yes' : v === false ? 'No' : '—'; }
function formatNumber(v) { return (v == null) ? '—' : (typeof v === 'number' ? v.toExponential(3) : v); }
function formatValue(v) { return (v == null || v === '') ? '—' : escape(String(v)); }
function escape(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function showDetail(entry, panelEl, overlayEl) {
  const sectionsHTML = FIELDS.map(([sectionTitle, fields]) => {
    const rows = fields.map(([key, label, formatter]) => {
      const raw = entry[key];
      const html = formatter ? formatter(raw) : formatValue(raw);
      return `<dt>${escape(label)}</dt><dd>${html}</dd>`;
    }).join('');
    return `
      <h3 style="margin-top: var(--space-6); margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${escape(sectionTitle)}</h3>
      <dl class="detail-grid">${rows}</dl>`;
  }).join('');

  panelEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
      <h2>${escape(entry.id || 'Entry')}</h2>
      <button class="btn btn-ghost" data-close-detail>✕</button>
    </div>
    ${sectionsHTML}
  `;
  panelEl.classList.add('open');
  overlayEl.classList.add('open');

  panelEl.querySelector('[data-close-detail]').addEventListener('click', () => {
    closeDetail(panelEl, overlayEl);
  });
}

export function closeDetail(panelEl, overlayEl) {
  panelEl.classList.remove('open');
  overlayEl.classList.remove('open');
}
