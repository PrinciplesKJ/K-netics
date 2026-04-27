/**
 * Stats — pure functions for aggregating entry data.
 * Easy to extend with new metrics; no side effects.
 */

export function computeStats(entries) {
  if (!entries.length) {
    return { entryCount: 0, paperCount: 0, latestUpdate: null };
  }

  const dois = new Set(entries.map(e => e.doi).filter(Boolean));
  const dates = entries.map(e => e.curation_date).filter(Boolean).sort();

  return {
    entryCount: entries.length,
    paperCount: dois.size,
    latestUpdate: dates[dates.length - 1] || null,
  };
}

export function formatDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
