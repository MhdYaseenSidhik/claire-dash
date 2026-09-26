#!/usr/bin/env python3
"""Enumerate every reachable schema and table in the team's SAP HANA database.

Read-only catalog inventory: this script only SELECTs from the SYS system
views (SYS.SCHEMAS and SYS.TABLES). It never creates, alters or drops
anything, and never touches application data.

It:
  * reads connection details from the environment (or a local .env file),
  * connects read-only via hdbcli,
  * lists every schema/table the connected user can reach,
  * writes the results to a CSV (columns: schema_name, table_name), sorted
    and grouped by schema,
  * prints a human-readable summary grouped by schema and notes which schemas
    were reachable (useful when access is scoped to specific schemas).

Usage:
    python scripts/list_hana_tables.py [--output PATH]

Environment variables (see .env.example):
    HANA_HOST      HANA Cloud host, e.g. <id>.hna0.prod-us10.hanacloud.ondemand.com
    HANA_PORT      Port (default 443 for HANA Cloud)
    HANA_USER      Database user
    HANA_PASSWORD  Database password
    HANA_ENCRYPT   "true" (default) to use TLS — required for HANA Cloud
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
from collections import defaultdict
from pathlib import Path


def load_dotenv(path: Path) -> None:
    """Minimal .env loader: KEY=VALUE lines, '#' comments, no external deps.

    Values already present in the real environment win over the file.
    """
    if not path.exists():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def read_config() -> dict:
    """Collect HANA connection settings from the environment."""
    missing = [v for v in ("HANA_HOST", "HANA_USER", "HANA_PASSWORD") if not os.environ.get(v)]
    if missing:
        sys.stderr.write(
            "ERROR: missing required environment variable(s): "
            + ", ".join(missing)
            + "\nSet them in your environment or a .env file (see .env.example).\n"
        )
        sys.exit(2)

    encrypt = os.environ.get("HANA_ENCRYPT", "true").lower() in ("1", "true", "yes")
    return {
        "address": os.environ["HANA_HOST"],
        "port": int(os.environ.get("HANA_PORT", "443")),
        "user": os.environ["HANA_USER"],
        "password": os.environ["HANA_PASSWORD"],
        "encrypt": encrypt,
        # HANA Cloud uses a public CA-signed cert; validate it.
        "sslValidateCertificate": encrypt,
    }


def fetch_tables(config: dict) -> list[tuple[str, str]]:
    """Return a sorted list of (schema_name, table_name) the user can reach.

    Read-only: a single SELECT against SYS.TABLES. We exclude the pure SAP
    system schemas (SYS and *_SYS_* internals) so the inventory reflects
    reachable application/content schemas rather than engine internals.
    """
    try:
        from hdbcli import dbapi
    except ImportError:
        sys.stderr.write(
            "ERROR: the 'hdbcli' package is not installed.\n"
            "Install it with:  pip install -r scripts/requirements.txt\n"
        )
        sys.exit(2)

    conn = dbapi.connect(
        address=config["address"],
        port=config["port"],
        user=config["user"],
        password=config["password"],
        encrypt=config["encrypt"],
        sslValidateCertificate=config["sslValidateCertificate"],
    )
    try:
        # Read-only session guard: refuse to let this connection write.
        try:
            cur = conn.cursor()
            cur.execute("SET TRANSACTION READ ONLY")
            cur.close()
        except Exception:
            # Not fatal — we only ever issue SELECTs below regardless.
            pass

        cur = conn.cursor()
        cur.execute(
            """
            SELECT SCHEMA_NAME, TABLE_NAME
            FROM SYS.TABLES
            WHERE SCHEMA_NAME NOT LIKE '\\_SYS\\_%' ESCAPE '\\'
              AND SCHEMA_NAME <> 'SYS'
              AND SCHEMA_NAME NOT LIKE 'SYS\\_%' ESCAPE '\\'
            ORDER BY SCHEMA_NAME, TABLE_NAME
            """
        )
        rows = [(str(s), str(t)) for s, t in cur.fetchall()]
        cur.close()
        return rows
    finally:
        conn.close()


def write_csv(rows: list[tuple[str, str]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["schema_name", "table_name"])
        writer.writerows(rows)


def print_summary(rows: list[tuple[str, str]], output: Path) -> None:
    by_schema: dict[str, list[str]] = defaultdict(list)
    for schema, table in rows:
        by_schema[schema].append(table)

    print("\nSAP HANA table inventory (read-only catalog scan)")
    print("=" * 52)
    if not rows:
        print("No tables reachable for the connected user.")
        return

    for schema in sorted(by_schema):
        tables = by_schema[schema]
        print(f"\n{schema}  ({len(tables)} table{'s' if len(tables) != 1 else ''})")
        for table in tables:
            print(f"    {table}")

    schemas = sorted(by_schema)
    print("\n" + "-" * 52)
    print(f"Reachable schemas ({len(schemas)}): {', '.join(schemas)}")
    print(f"Total tables: {len(rows)}")
    print(f"CSV written to: {output}")
    print(
        "\nScope note: this lists every schema/table the connected user can reach.\n"
        "If your access is restricted, only the schemas above were returned;\n"
        "pure SAP system schemas (SYS, SYS_*, _SYS_*) are excluded by design."
    )


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    load_dotenv(repo_root / ".env")

    parser = argparse.ArgumentParser(description="Enumerate SAP HANA schemas and tables (read-only).")
    parser.add_argument(
        "--output",
        type=Path,
        default=repo_root / "scripts" / "hana_tables.csv",
        help="Path for the CSV output (default: scripts/hana_tables.csv).",
    )
    args = parser.parse_args()

    config = read_config()
    rows = fetch_tables(config)
    write_csv(rows, args.output)
    print_summary(rows, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
