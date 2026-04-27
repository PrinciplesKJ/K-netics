/**
 * Filters — pure functions, each takes (entries, value) → filtered entries.
 * Add new filters by adding a key to FILTERS; UI auto-derives from FILTER_DEFS.
 */

export const FILTER_DEFS = {
  search: {
    label: 'Search',
    type: 'text',
    placeholder: 'DOI, author, sequence…',
    default: '',
  },
  toeholdLengthMin: { label: 'Toehold length min', type: 'number', default: '' },
  toeholdLengthMax: { label: 'Toehold length max', type: 'number', default: '' },
  kEffMin:          { label: 'k_eff min (M⁻¹s⁻¹)',  type: 'number', default: '' },
  kEffMax:          { label: 'k_eff max (M⁻¹s⁻¹)',  type: 'number', default: '' },
  temperatureMin:   { label: 'Temperature min (°C)', type: 'number', default: '' },
  temperatureMax:   { label: 'Temperature max (°C)', type: 'number', default: '' },
  hasMismatches:    {
    label: 'Mismatches',
    type: 'select',
    options: [['', 'Any'], ['yes', 'With mismatches'], ['no', 'Without mismatches']],
    default: '',
  },
  hasHairpin: {
    label: 'Hairpin',
    type: 'select',
    options: [['', 'Any'], ['yes', 'With hairpin'], ['no', 'Without hairpin']],
    default: '',
  },
  confidence: {
    label: 'Min confidence',
    type: 'select',
    options: [['', 'Any'], ['1', '1 — full data'], ['2', '2 — partial'], ['3', '3 — figure-read']],
    default: '',
  },
};

const FILTERS = {
  search: (e, q) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return [e.doi, e.first_author, e.substrate_seq, e.incumbent_seq, e.invader_seq, e.id]
      .filter(Boolean)
      .some(v => v.toLowerCase().includes(needle));
  },
  toeholdLengthMin: (e, v) => v === '' || e.toehold_length >= +v,
  toeholdLengthMax: (e, v) => v === '' || e.toehold_length <= +v,
  kEffMin:          (e, v) => v === '' || e.k_eff >= +v,
  kEffMax:          (e, v) => v === '' || e.k_eff <= +v,
  temperatureMin:   (e, v) => v === '' || e.temperature >= +v,
  temperatureMax:   (e, v) => v === '' || e.temperature <= +v,
  hasMismatches: (e, v) => {
    if (!v) return true;
    return v === 'yes' ? e.mismatch_count > 0 : e.mismatch_count === 0;
  },
  hasHairpin: (e, v) => {
    if (!v) return true;
    return v === 'yes' ? e.hairpin === true : e.hairpin === false;
  },
  confidence: (e, v) => v === '' || e.confidence <= +v,
};

export function applyFilters(entries, state) {
  return entries.filter(entry =>
    Object.entries(state).every(([key, value]) => {
      const fn = FILTERS[key];
      return fn ? fn(entry, value) : true;
    })
  );
}

export function defaultFilterState() {
  return Object.fromEntries(
    Object.entries(FILTER_DEFS).map(([key, def]) => [key, def.default])
  );
}
