"""
Validates all entries in data/entries/ against schema/entry_schema.json.
Also checks cross-field consistency (sequence lengths, mismatch counts).
Exit code 0 = all valid, 1 = one or more errors.
"""

import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(1)

REPO_ROOT = Path(__file__).parent.parent
SCHEMA_PATH = REPO_ROOT / "schema" / "entry_schema.json"
ENTRIES_DIR = REPO_ROOT / "data" / "entries"


def load_schema():
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def check_consistency(entry: dict) -> list[str]:
    errors = []

    # Sequence length consistency
    if len(entry.get("toehold_seq", "")) != entry.get("toehold_length", -1):
        errors.append("toehold_seq length does not match toehold_length")

    if len(entry.get("branch_migration_seq", "")) != entry.get("branch_migration_length", -1):
        errors.append("branch_migration_seq length does not match branch_migration_length")

    # invader = toehold + branch migration for standard TMSD
    expected_invader_len = entry.get("toehold_length", 0) + entry.get("branch_migration_length", 0)
    actual_invader_len = len(entry.get("invader_seq", ""))
    if actual_invader_len != expected_invader_len:
        errors.append(
            f"invader_seq length ({actual_invader_len}) != "
            f"toehold_length + branch_migration_length ({expected_invader_len})"
        )

    # Mismatch count consistency
    mismatches = entry.get("mismatches")
    mismatch_count = entry.get("mismatch_count", 0)
    if mismatches is None and mismatch_count != 0:
        errors.append("mismatches is null but mismatch_count != 0")
    if mismatches is not None and len(mismatches) != mismatch_count:
        errors.append(
            f"mismatch_count ({mismatch_count}) != len(mismatches) ({len(mismatches)})"
        )

    # clamp_description required if clamps=True
    if entry.get("clamps") and not entry.get("clamp_description"):
        errors.append("clamps=true but clamp_description is null or missing")

    return errors


def validate_entry(path: Path, schema: dict) -> list[str]:
    try:
        with open(path, encoding="utf-8") as f:
            entry = json.load(f)
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

    errors = []

    validator = jsonschema.Draft202012Validator(schema)
    for err in sorted(validator.iter_errors(entry), key=str):
        errors.append(f"Schema: {err.json_path} — {err.message}")

    errors.extend(check_consistency(entry))
    return errors


def main():
    schema = load_schema()
    entry_files = sorted(ENTRIES_DIR.glob("*.json"))

    if not entry_files:
        print("No entries found in data/entries/")
        sys.exit(0)

    all_valid = True
    for path in entry_files:
        errors = validate_entry(path, schema)
        if errors:
            all_valid = False
            print(f"FAIL  {path.name}")
            for e in errors:
                print(f"      {e}")
        else:
            print(f"OK    {path.name}")

    if not all_valid:
        sys.exit(1)
    print(f"\nAll {len(entry_files)} entries valid.")


if __name__ == "__main__":
    main()
