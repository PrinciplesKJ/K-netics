# K-netics: DNA Strand Displacement Kinetics Database
## Live Project Plan

**GitHub:** https://github.com/PrinciplesKJ/K-netics (to be created)
**Maintainer:** PrinciplesKJ (solo, v1)
**Last updated:** 2026-04-27

---

## Vision

A curated, community-maintainable, open-access database of experimentally measured kinetic parameters for DNA strand displacement (DSD) reactions. Intended to fill a critical gap in the field and serve as a training/benchmarking resource for predictive (ML) models of DSD kinetics.

---

## Scope (v1)

- **Reaction type:** Standard toehold-mediated strand displacement (TMSD) only — no toehold exchange, no remote toehold, no allosteric/associative topologies
- **Nucleic acid:** DNA only
- **Data source:** Published literature with DOIs only (no unpublished datasets in v1)
- **Kinetics:** Second-order rate constants (k_eff) as primary measurable; leak rates where reported
- **Quality:** All entries accepted but flagged with a confidence score (see below)

---

## Data Schema

Each entry is one JSON file (`K001.json`, `K002.json`, ...) following the schema below.

### Identity & Provenance
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique entry ID (e.g. `K001`) |
| `doi` | string | DOI of source paper |
| `year` | integer | Publication year |
| `first_author` | string | First author surname |
| `curated_by` | string | GitHub handle of curator |
| `curation_date` | string | ISO date of curation (YYYY-MM-DD) |
| `confidence` | integer (1–3) | 1 = full data + clear method; 2 = missing error bars or ambiguous method; 3 = estimated/inferred rate |

### Reaction
| Field | Type | Description |
|---|---|---|
| `reaction_type` | string | Always `"tmsd"` in v1 |
| `nucleic_acid` | string | Always `"DNA"` in v1 |

### Strand Sequences (5'→3', uppercase, DNA alphabet)
| Field | Type | Description |
|---|---|---|
| `substrate_seq` | string | Full sequence of the substrate strand |
| `incumbent_seq` | string | Full sequence of the incumbent strand |
| `invader_seq` | string | Full sequence of the invader strand |

### Domain Annotations
| Field | Type | Description |
|---|---|---|
| `toehold_seq` | string | Sequence of the toehold domain |
| `toehold_length` | integer | Length of toehold in nt |
| `branch_migration_seq` | string | Sequence of the branch migration domain |
| `branch_migration_length` | integer | Length of branch migration domain in nt |

### Special Features
| Field | Type | Description |
|---|---|---|
| `mismatches` | list\|null | List of `{position: int, type: string}` objects; null if none |
| `mismatch_count` | integer | Number of mismatches (0 if none) |
| `hairpin` | boolean | Any strand contains a hairpin motif |
| `clamps` | boolean | Clamp base pairs present (BP in initial state, absent in final) |
| `clamp_description` | string\|null | Brief description if clamps present |
| `modified_bases` | string\|null | Description of any modified bases (e.g. LNA, BNA); null if none |
| `terminal_gc` | boolean | Terminal base pair of toehold is a G–C pair |
| `other_features` | string\|null | Free-text for anything else |

### Kinetics
| Field | Type | Description |
|---|---|---|
| `k_eff` | float | Second-order rate constant (M⁻¹s⁻¹) |
| `k_eff_error` | float\|null | Uncertainty / std dev (M⁻¹s⁻¹); null if not reported |
| `k_leak` | float\|null | Leak rate constant if reported; null otherwise |
| `k_leak_error` | float\|null | Uncertainty on k_leak; null if not reported |
| `measurement_method` | string | e.g. `"FRET"`, `"bulk_fluorescence"`, `"gel"` |

### Experimental Conditions
| Field | Type | Description |
|---|---|---|
| `temperature` | float | Temperature in °C |
| `buffer` | string | Buffer identity (e.g. `"1x TAE"`, `"PBS"`) |
| `na_concentration_mM` | float\|null | [Na⁺] in mM; null if not reported |
| `mg_concentration_mM` | float\|null | [Mg²⁺] in mM; null if not reported |

### Thermodynamics (NUPACK-computed at curation time)
| Field | Type | Description |
|---|---|---|
| `dg_toehold_kcal_mol` | float | ΔG of toehold binding (kcal/mol) |
| `dg_incumbent_duplex_kcal_mol` | float | ΔG of incumbent:substrate duplex (kcal/mol) |
| `dg_invader_duplex_kcal_mol` | float | ΔG of invader:substrate duplex (kcal/mol) |
| `nupack_version` | string | NUPACK version used (e.g. `"4.0.1"`) — *deferred to Phase 3* |
| `nupack_model` | string | Thermodynamic model (e.g. `"DNA04"`) — *deferred to Phase 3* |
| `nupack_temperature` | float | Temperature used for NUPACK calc (°C) — *deferred to Phase 3* |

---

## Repository Structure

```
K-netics/
├── README.md                    # Project overview, citation, quick start
├── CONTRIBUTING.md              # Submission guide + data standards
├── PLAN.md                      # This document (live project tracker)
├── schema/
│   └── entry_schema.json        # JSON Schema for validation
├── data/
│   └── entries/                 # One JSON per entry: K001.json, K002.json ...
├── scripts/
│   ├── validate.py              # Validate entries against JSON Schema
│   └── export.py                # Export full DB to CSV / SQLite
│   # compute_dg.py              → deferred to Phase 3 (NUPACK integration)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── new_entry.md         # Structured issue template for submissions
│   └── workflows/
│       └── validate.yml         # CI: run validate.py on every PR
└── site/                        # (future) Datasette or static browse interface
```

---

## Contribution Workflow

1. Contributor opens a GitHub Issue using the `new_entry` template (or submits a PR directly with a JSON file)
2. Curator (PrinciplesKJ) reviews for correctness, runs `compute_dg.py` to fill thermodynamic fields, sets confidence score
3. Validated entry merged to `main`
4. CI (`validate.yml`) runs `validate.py` on every PR — rejects malformed entries automatically

---

## Roadmap & Task Tracker

### Phase 0 — Setup
- [ ] Create GitHub repo `PrinciplesKJ/K-netics`
- [x] Write `README.md` (brief, citable, with schema summary)
- [x] Write `schema/entry_schema.json` (JSON Schema)
- [x] Write `scripts/validate.py`
- [x] Write `scripts/export.py`
- [ ] ~~Write `scripts/compute_dg.py`~~ — deferred to Phase 3
- [x] Set up GitHub Actions CI (`validate.yml`)
- [x] Write `CONTRIBUTING.md`
- [x] Write GitHub Issue template for new entries
- [x] Write example entry `data/entries/K001.json`

### Phase 1 — Seed Dataset
- [ ] Identify 5–8 landmark papers as seed sources
  - Zhang & Winfree 2009 (JACS) — toehold length dependence
  - Srinivas et al. 2013 — comprehensive TMSD characterisation
  - Machinek et al. 2014 — mismatches
  - Possible others TBD
- [ ] Manually curate 50–100 entries from seed papers
- [ ] Run `compute_dg.py` on all seed entries
- [ ] Spot-check schema completeness

### Phase 2 — Public Launch
- [ ] Set up Datasette or GitHub Pages browse interface
- [ ] Connect Zenodo for DOI and citable releases
- [ ] Write brief methods note / data descriptor (for submission to e.g. Scientific Data)
- [ ] Announce to DSD community

### Phase 3 — Future Extensions (not v1)
- [ ] Toehold exchange reactions
- [ ] RNA/DNA hybrid reactions
- [ ] NUPACK API live link per entry
- [ ] Automated mismatch detection from sequences
- [ ] ML benchmark suite using K-netics data

---

## Conventions & Standards

- **Sequence notation:** 5'→3', uppercase, standard DNA alphabet (A, T, G, C). Modified bases noted in `modified_bases` field.
- **Domain boundaries:** Must be consistent with full strand sequences. toehold + branch_migration domains must together equal the invader length for standard TMSD.
- **Rate constant units:** Always M⁻¹s⁻¹ for k_eff; s⁻¹ for k_leak.
- **Confidence scoring:**
  - `1` — rate constant reported with error bars, method clearly described
  - `2` — rate reported without error bars, OR method ambiguous
  - `3` — rate estimated/inferred (e.g. read from a figure without raw data)
- **NUPACK ΔG:** Always computed at the same temperature as the experiment. Use `DNA04` model unless specified otherwise.
