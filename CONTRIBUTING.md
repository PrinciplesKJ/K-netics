# Contributing to K-netics

Thank you for helping grow this dataset. All contributions go through a curation review before merging.

---

## What we accept (v1)

- Standard toehold-mediated strand displacement (TMSD) reactions
- DNA only
- Published experimental data with a DOI
- Entries without error bars or with unclear methods are accepted but flagged (confidence = 2 or 3)

## How to submit

### Option A — GitHub Issue (preferred for new contributors)

Open an Issue using the **New entry submission** template. Fill in all fields you can. The curator will convert it to a JSON entry and merge it.

### Option B — Pull request

1. Fork the repository
2. Copy `data/entries/K001.json` as a template
3. Create a new file `data/entries/KXXX.json` (use the next available ID)
4. Fill in all required fields (see schema below)
5. Run `python scripts/validate.py` locally — it must pass
6. Open a PR; CI will re-run validation automatically

---

## Data standards

### Sequences
- 5'→3', uppercase, standard DNA alphabet: `A`, `T`, `G`, `C`
- Modified bases: use standard alphabet for the position, describe the modification in `modified_bases`
- For standard TMSD: `len(invader_seq) == toehold_length + branch_migration_length`

### Domain boundaries
- `toehold_seq` is the single-stranded overhang on the **substrate** where the invader first binds
- `branch_migration_seq` is the domain shared between incumbent and invader
- The invader sequence reads: `[toehold_seq][branch_migration_seq]` (5'→3')

### Mismatches
- Report mismatches in the **branch migration domain** only
- Position is 1-indexed from the toehold–duplex junction
- `mismatch_count` must equal `len(mismatches)`; set both to `0` / `null` if none

### Kinetics
- `k_eff` in M⁻¹s⁻¹ always
- `k_leak` units: report as given in the paper and note in `other_features` if units differ from s⁻¹
- If a rate is read from a figure rather than a table, set `confidence = 3`

### Conditions
- Report `na_concentration_mM` and `mg_concentration_mM` as given; `null` if not stated
- `buffer` should be specific: `"1x TAE/Mg"` not just `"TAE"`

### Confidence scoring
| Score | When to use |
|---|---|
| 1 | k_eff with error bars, method clearly named |
| 2 | k_eff without error bars, OR method description ambiguous |
| 3 | Rate estimated from a figure or inferred indirectly |

---

## Required fields

All fields listed as `required` in `schema/entry_schema.json` must be present. Optional fields should be set to `null` (not omitted) to keep entries consistent.

## Local validation

```bash
pip install jsonschema
python scripts/validate.py
```

All entries must pass before a PR can be merged.
