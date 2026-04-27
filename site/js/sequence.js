/**
 * Sequence rendering — DNA strand with domain colour-coding.
 * Returns an HTML string (use directly in innerHTML of trusted contexts).
 */

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/**
 * Render the invader strand with toehold + branch migration domains.
 * Standard TMSD: invader_seq = toehold_seq + branch_migration_seq (5'→3').
 *
 * @param {object} entry
 * @param {object} opts { showLabel: boolean, mismatchPositions: number[] }
 */
export function renderInvader(entry, { showLabel = true } = {}) {
  const { toehold_seq = '', branch_migration_seq = '', invader_seq = '' } = entry;
  const mismatchSet = new Set(
    (entry.mismatches || []).map(m => m.position)
  );

  // Defensive: if domain seqs don't concatenate to invader, fall back to plain
  if (toehold_seq + branch_migration_seq !== invader_seq) {
    return `<span class="seq">
      ${showLabel ? '<span class="seq-label">inv</span>' : ''}
      <span class="seq-tick">5'-</span>
      <span class="seq-domain bm">${escape(invader_seq)}</span>
      <span class="seq-tick">-3'</span>
    </span>`;
  }

  const bmChars = branch_migration_seq.split('').map((c, i) => {
    const pos = i + 1;
    return mismatchSet.has(pos)
      ? `<span class="seq-mm-char" title="mismatch at position ${pos}">${escape(c)}</span>`
      : escape(c);
  }).join('');

  return `<span class="seq">
    ${showLabel ? '<span class="seq-label">inv</span>' : ''}
    <span class="seq-tick">5'-</span>
    <span class="seq-domain toehold" title="Toehold (${toehold_seq.length} nt)">${escape(toehold_seq)}</span>
    <span class="seq-domain bm" title="Branch migration (${branch_migration_seq.length} nt)">${bmChars}</span>
    <span class="seq-tick">-3'</span>
  </span>`;
}

export function renderStrand(label, seq) {
  return `<span class="seq">
    <span class="seq-label">${escape(label)}</span>
    <span class="seq-tick">5'-</span>
    <span class="seq-domain bm">${escape(seq || '')}</span>
    <span class="seq-tick">-3'</span>
  </span>`;
}
