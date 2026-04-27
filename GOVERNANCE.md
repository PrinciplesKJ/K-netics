# K-netics governance

How entries are reviewed, who has authority over what, and how flags get resolved. Short by design — the goal is *predictable, auditable, low-friction*.

---

## Roles

| Role | What they can do | How to become one |
|---|---|---|
| **Maintainer** | Merge PRs, set confidence scores, resolve flags, manage labels, edit policy | Currently [@PrinciplesKJ](https://github.com/PrinciplesKJ) |
| **Curator** | Review and merge PRs for entries within an agreed topic / lab scope | Invited by maintainer based on track record of accurate contributions |
| **Contributor** | Open PRs and Issues; suggest edits; flag entries | Anyone with a GitHub account |
| **User** | Browse, download, cite | No account needed |

GitHub's repo permissions enforce this directly. There is no separate auth system.

---

## Entry lifecycle

```
   Submitted ──▶ Validated ──▶ Reviewed ──▶ Merged ──▶ Live
   (PR/issue)    (CI passes)   (curator)   (squash)
```

After merge an entry can be:

- **Edited** — anyone proposes a change via PR or `Suggest an edit` issue. Curator reviews against the source paper before merging.
- **Flagged** — anyone opens a flag issue. Stays visible on the site; gains a flag indicator (planned UI feature) until the issue is closed.
- **Deprecated** — for retracted papers or proven-wrong values. Set `confidence: 3` and add a note in `other_features`. Entries are not deleted (history matters).

---

## Quality control

1. **CI validation** runs on every PR. Schema-invalid entries cannot merge.
2. **Curator review** is required for every PR (branch protection on `main`).
3. **Confidence is set by the curator, not the contributor.** This prevents inflated scores.
4. **Sequence consistency** — `len(invader_seq) == toehold_length + branch_migration_length` is enforced by CI.
5. **Source verification** — every numeric value must be traceable to a specific table/figure/equation in the cited DOI.

### Confidence scale

| Score | Meaning |
|---|---|
| 1 | Rate reported with error bars; method clearly described in the paper |
| 2 | Missing error bars OR method description ambiguous |
| 3 | Rate read from a figure rather than tabulated, or inferred indirectly |

Higher = more uncertainty. A confidence-3 entry is still useful but should be treated cautiously and may be improved by future contributions (e.g. someone with access to underlying data).

---

## Flag categories

Each flag issue carries one of these labels (set by the issue template):

| Label | When to use |
|---|---|
| `flag:data-error`     | Numeric or sequence value is demonstrably wrong |
| `flag:method-question`| Methodology unclear or possibly misclassified |
| `flag:duplicate`      | Same reaction is already in the DB under another ID |
| `flag:missing-fields` | Entry could be improved with additional data the curator didn't have |
| `flag:retracted`      | Source paper has been retracted |
| `flag:other`          | Anything else |

---

## Moderation cadence

| Frequency | Action |
|---|---|
| **Per PR** | Validate sequences against source; check confidence; merge or request changes |
| **Weekly** | Triage open flag issues; label, prioritise, assign |
| **Monthly** | Review confidence-3 entries to see if any can be promoted (e.g. someone provided supplementary data) |

This cadence is a *target*, not a contract. Active periods may iterate faster; slow periods may take longer. Maintainers will not be paged for non-urgent flags.

---

## Dispute resolution

If a flag and a counter-flag disagree, or a contributor disputes a curator's confidence assignment:

1. Maintainer requests both parties summarise their position in the issue thread
2. If still unresolved, maintainer makes a final call and documents the reasoning in the issue
3. The decision is captured in the entry's `other_features` field if relevant for downstream users

---

## Versioning

- Entries are **mutable** in v1: edits update the JSON in place. Git history is the version trail.
- Each entry tracks `curated_by` and `curation_date` (when first added). Modification history is `git log`.
- Periodic snapshots are released as Zenodo DOIs (planned), giving citable immutable versions.
- Major schema changes go through an RFC issue and bump a `schema_version` field (added when needed).

---

## How to contribute

- **New entry** → use the `New entry submission` issue template, or open a PR adding `data/entries/KNNN.json` directly
- **Suggest an edit** → use the `Suggest an edit` issue template, or open a PR with the change
- **Flag a problem** → use the `Flag an entry` issue template
- **Discuss anything else** → open a [Discussion](https://github.com/PrinciplesKJ/K-netics/discussions)

See [CONTRIBUTING.md](CONTRIBUTING.md) for data standards.

---

## Changes to this document

Changes to governance must be proposed as a PR to this file. Comment period: 7 days. Maintainer has final approval.
