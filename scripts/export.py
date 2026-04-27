"""
Exports all validated entries to:
  - exports/knetics.csv
  - exports/knetics.db  (SQLite)

Run after validate.py passes. Usage: python scripts/export.py
"""

import csv
import json
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
ENTRIES_DIR = REPO_ROOT / "data" / "entries"
EXPORTS_DIR = REPO_ROOT / "exports"

COLUMNS = [
    "id", "doi", "year", "first_author", "curated_by", "curation_date", "confidence",
    "reaction_type", "nucleic_acid",
    "substrate_seq", "incumbent_seq", "invader_seq",
    "toehold_seq", "toehold_length", "branch_migration_seq", "branch_migration_length",
    "mismatch_count", "hairpin", "clamps", "clamp_description",
    "modified_bases", "terminal_gc", "other_features",
    "k_eff", "k_eff_error", "k_leak", "k_leak_error", "measurement_method",
    "temperature", "buffer", "na_concentration_mM", "mg_concentration_mM",
    "dg_toehold_kcal_mol", "dg_incumbent_duplex_kcal_mol", "dg_invader_duplex_kcal_mol",
]

MISMATCHES_COLUMNS = ["entry_id", "position", "base_incumbent", "base_invader"]


def load_entries() -> list[dict]:
    entries = []
    for path in sorted(ENTRIES_DIR.glob("*.json")):
        with open(path) as f:
            entries.append(json.load(f))
    return entries


def flatten(entry: dict) -> dict:
    row = {col: entry.get(col) for col in COLUMNS}
    # Serialize mismatches list to JSON string for CSV; handled separately for SQLite
    mismatches = entry.get("mismatches")
    row["mismatches_json"] = json.dumps(mismatches) if mismatches else None
    return row


def export_csv(entries: list[dict]):
    path = EXPORTS_DIR / "knetics.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS + ["mismatches_json"])
        writer.writeheader()
        for entry in entries:
            writer.writerow(flatten(entry))
    print(f"CSV  → {path}")


def export_sqlite(entries: list[dict]):
    path = EXPORTS_DIR / "knetics.db"
    if path.exists():
        path.unlink()

    con = sqlite3.connect(path)
    cur = con.cursor()

    col_defs = ", ".join(f'"{c}" TEXT' for c in COLUMNS)
    cur.execute(f'CREATE TABLE entries ({col_defs})')

    cur.execute(
        'CREATE TABLE mismatches ('
        '"entry_id" TEXT, "position" INTEGER, '
        '"base_incumbent" TEXT, "base_invader" TEXT)'
    )

    for entry in entries:
        row = [entry.get(c) for c in COLUMNS]
        cur.execute(
            f'INSERT INTO entries VALUES ({",".join("?" * len(COLUMNS))})', row
        )
        for mm in (entry.get("mismatches") or []):
            cur.execute(
                'INSERT INTO mismatches VALUES (?,?,?,?)',
                [entry["id"], mm["position"], mm["base_incumbent"], mm["base_invader"]]
            )

    con.commit()
    con.close()
    print(f"SQLite → {path}")


def main():
    EXPORTS_DIR.mkdir(exist_ok=True)
    entries = load_entries()
    if not entries:
        print("No entries found.")
        sys.exit(0)
    export_csv(entries)
    export_sqlite(entries)
    print(f"\nExported {len(entries)} entries.")


if __name__ == "__main__":
    main()
