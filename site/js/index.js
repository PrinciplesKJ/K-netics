/**
 * Landing page controller — fills live stats from the JSON dataset.
 */

import { loadEntries } from './data.js';
import { computeStats, formatDate } from './stats.js';

async function init() {
  const entries = await loadEntries();
  const stats = computeStats(entries);

  setText('stat-entries', stats.entryCount);
  setText('stat-papers',  stats.paperCount);
  setText('stat-updated', stats.latestUpdate ? formatDate(stats.latestUpdate) : '—');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

init();
