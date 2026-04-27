# K-netics

A curated, open-access database of experimentally measured kinetic parameters for DNA strand displacement (DSD) reactions.

**Maintainer:** [@PrinciplesKJ](https://github.com/PrinciplesKJ)

---

## Why

Quantitative prediction of DSD reaction kinetics remains an open problem. A reliable, well-annotated experimental dataset does not currently exist in a machine-readable form. K-netics aims to fill that gap — both as a reference for researchers and as a training/benchmarking resource for predictive models.

## Scope (v1)

- **Reaction type:** Standard toehold-mediated strand displacement (TMSD) only
- **Nucleic acid:** DNA
- **Data source:** Published literature with DOIs

## Database format

Each entry is a single JSON file in `data/entries/` (e.g. `K001.json`) validated against `schema/entry_schema.json`.

### Key fields

| Category | Fields |
|---|---|
| Provenance | `id`, `doi`, `year`, `first_author`, `confidence` |
| Strands | `substrate_seq`, `incumbent_seq`, `invader_seq` |
| Domains | `toehold_seq`, `toehold_length`, `branch_migration_seq`, `branch_migration_length` |
| Features | `mismatches`, `hairpin`, `clamps`, `modified_bases`, `terminal_gc` |
| Kinetics | `k_eff` (M⁻¹s⁻¹), `k_eff_error`, `k_leak`, `measurement_method` |
| Conditions | `temperature`, `buffer`, `na_concentration_mM`, `mg_concentration_mM` |
| Thermodynamics | `dg_toehold_kcal_mol`, `dg_incumbent_duplex_kcal_mol`, `dg_invader_duplex_kcal_mol` |

Full schema: [`schema/entry_schema.json`](schema/entry_schema.json)

### Confidence scores

| Score | Meaning |
|---|---|
| 1 | Rate reported with error bars, method clearly described |
| 2 | Missing error bars or ambiguous method |
| 3 | Rate estimated / inferred (e.g. read from a figure) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Submit entries via a GitHub Issue or pull request.

## Exporting

```bash
pip install jsonschema
python scripts/validate.py   # check all entries
python scripts/export.py     # export to exports/knetics.csv and exports/knetics.db
```

## Citation

If you use K-netics, please cite the database and the source papers for each entry you use.

*Preprint / data descriptor forthcoming.*
