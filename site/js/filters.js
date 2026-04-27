/**
 * Filters — pure functions + UI definitions for the chip/popover system.
 */

export const FILTER_DEFS = {
  toeholdLengthMin: { label: 'Toehold ≥', type: 'number', chipKey: 'toehold≥' },
  toeholdLengthMax: { label: 'Toehold ≤', type: 'number', chipKey: 'toehold≤' },
  kEffMin:          { label: 'k_eff ≥',   type: 'number', chipKey: 'k≥' },
  kEffMax:          { label: 'k_eff ≤',   type: 'number', chipKey: 'k≤' },
  temperatureMin:   { label: 'T ≥ (°C)',  type: 'number', chipKey: 'T≥' },
  temperatureMax:   { label: 'T ≤ (°C)',  type: 'number', chipKey: 'T≤' },
  hasMismatches: {
    label: 'Mismatches',
    type: 'select',
    options: [['', 'any'], ['yes', 'with'], ['no', 'without']],
    chipKey: 'mismatch',
  },
  hasHairpin: {
    label: 'Hairpin',
    type: 'select',
    options: [['', 'any'], ['yes', 'with'], ['no', 'without']],
    chipKey: 'hairpin',
  },
  confidence: {
    label: 'Min conf.',
    type: 'select',
    options: [['', 'any'], ['1', '1'], ['2', '≤ 2'], ['3', '≤ 3']],
    chipKey: 'conf',
  },
};

const PREDICATES = {
  search: (e, q) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return [e.id, e.doi, e.first_author, e.substrate_seq, e.incumbent_seq, e.invader_seq, e.measurement_method, e.buffer]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(needle));
  },
  toeholdLengthMin: (e, v) => v === '' || e.toehold_length >= +v,
  toeholdLengthMax: (e, v) => v === '' || e.toehold_length <= +v,
  kEffMin:          (e, v) => v === '' || e.k_eff >= +v,
  kEffMax:          (e, v) => v === '' || e.k_eff <= +v,
  temperatureMin:   (e, v) => v === '' || e.temperature >= +v,
  temperatureMax:   (e, v) => v === '' || e.temperature <= +v,
  hasMismatches: (e, v) => !v || (v === 'yes' ? e.mismatch_count > 0 : e.mismatch_count === 0),
  hasHairpin:    (e, v) => !v || (v === 'yes' ? e.hairpin === true : e.hairpin === false),
  confidence:    (e, v) => v === '' || e.confidence <= +v,
};

export function applyFilters(entries, state) {
  return entries.filter(e =>
    Object.entries(state).every(([key, value]) => {
      const fn = PREDICATES[key];
      return fn ? fn(e, value) : true;
    })
  );
}

export function defaultFilterState() {
  return {
    search: '',
    ...Object.fromEntries(Object.keys(FILTER_DEFS).map(k => [k, '']))
  };
}

export function activeChips(state) {
  return Object.entries(state)
    .filter(([key, value]) => key !== 'search' && value !== '' && FILTER_DEFS[key])
    .map(([key, value]) => ({
      key,
      chipKey: FILTER_DEFS[key].chipKey,
      value,
    }));
}
