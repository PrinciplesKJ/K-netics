/**
 * Data loader — single source of truth for fetching entries.
 * Swap this module if the data source changes (e.g. JSON → REST API → GraphQL).
 */

const DATA_URL = 'data/knetics.json';

export async function loadEntries(url = DATA_URL) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();
    return Array.isArray(entries) ? entries : [];
  } catch (err) {
    console.error('Failed to load entries:', err);
    return [];
  }
}
