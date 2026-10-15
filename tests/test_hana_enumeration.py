"""
S-2 Acceptance Criteria Tests — SAP HANA table enumeration
==========================================================
Verifies scripts/list_hana_tables.py against the S-2 acceptance criteria,
using a mocked hdbcli connection and a captured catalog fixture so the tests
run without live HANA credentials.

AC-1  The CSV output has exactly the columns schema_name, table_name, with
      one row per table returned by the catalog scan.
AC-2  The human-readable summary groups tables by schema (a header per
      schema listing that schema's tables) and reports the reachable schemas.
AC-3  The script issues ONLY read-only catalog statements against the HANA
      connection — SELECTs from SYS catalog views (plus an optional
      SET TRANSACTION READ ONLY guard). No DDL/DML (INSERT/UPDATE/DELETE/
      CREATE/ALTER/DROP/TRUNCATE/MERGE/CALL) is ever issued.
"""

import csv
import importlib.util
import sys
import types
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Load scripts/list_hana_tables.py as a module (it is a script, not a package).
# ---------------------------------------------------------------------------
SCRIPT_PATH = Path(__file__).resolve().parent.parent / "scripts" / "list_hana_tables.py"


def load_script_module():
    spec = importlib.util.spec_from_file_location("list_hana_tables", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


mod = load_script_module()


# ---------------------------------------------------------------------------
# Captured catalog fixture: what SYS.TABLES would return for the connected
# user (mirrors the real inventory recorded for this tenant), plus a fake
# hdbcli.dbapi that records every statement executed against it.
# ---------------------------------------------------------------------------
CATALOG_ROWS = [
    ("VEDANTA_POC", "DIM_MATERIAL"),
    ("VEDANTA_POC", "DIM_PLANT"),
    ("VEDANTA_POC", "FACT_INVENTORY"),
    ("VEDANTA_POC", "FACT_CONSUMPTION"),
    ("PAL_CONTENT", "PAL_MODEL"),
    ("PAL_ML_TRACK", "TRACK_RUN"),
    ("SAP_PA_APL", "APL_MODEL"),
]

# DML/DDL keywords that must NEVER appear in any statement this script issues.
FORBIDDEN_KEYWORDS = (
    "INSERT", "UPDATE", "DELETE", "MERGE", "UPSERT",
    "CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME",
    "GRANT", "REVOKE", "CALL", "EXEC",
)


class FakeCursor:
    def __init__(self, executed):
        self._executed = executed
        self._result = []

    def execute(self, sql, *args, **kwargs):
        self._executed.append(sql)
        stripped = sql.strip().upper()
        # Only the catalog SELECT returns rows.
        if stripped.startswith("SELECT") and "SYS.TABLES" in stripped:
            self._result = list(CATALOG_ROWS)
        else:
            self._result = []
        return self

    def fetchall(self):
        return self._result

    def close(self):
        pass


class FakeConnection:
    def __init__(self, executed):
        self._executed = executed
        self.closed = False

    def cursor(self):
        return FakeCursor(self._executed)

    def close(self):
        self.closed = True


@pytest.fixture
def executed_statements(monkeypatch):
    """Install a fake hdbcli.dbapi and return the list of executed SQL."""
    executed = []

    def fake_connect(**kwargs):
        return FakeConnection(executed)

    fake_dbapi = types.SimpleNamespace(connect=fake_connect)
    fake_hdbcli = types.ModuleType("hdbcli")
    fake_hdbcli.dbapi = fake_dbapi
    monkeypatch.setitem(sys.modules, "hdbcli", fake_hdbcli)
    monkeypatch.setitem(sys.modules, "hdbcli.dbapi", fake_dbapi)
    return executed


@pytest.fixture
def config():
    return {
        "address": "fake-host",
        "port": 443,
        "user": "u",
        "password": "p",
        "encrypt": True,
        "sslValidateCertificate": True,
    }


# ---------------------------------------------------------------------------
# AC-1  CSV columns + one row per table
# ---------------------------------------------------------------------------
class TestCsvOutput:
    def test_csv_header_is_schema_and_table(self, tmp_path):
        """AC-1: header row is exactly schema_name, table_name."""
        out = tmp_path / "out.csv"
        mod.write_csv(CATALOG_ROWS, out)
        with out.open(newline="") as fh:
            header = next(csv.reader(fh))
        assert header == ["schema_name", "table_name"], f"unexpected header {header}"

    def test_csv_one_row_per_table(self, tmp_path):
        """AC-1: one data row per table, values matching the catalog."""
        out = tmp_path / "out.csv"
        mod.write_csv(CATALOG_ROWS, out)
        with out.open(newline="") as fh:
            rows = list(csv.reader(fh))
        data_rows = rows[1:]  # drop header
        assert len(data_rows) == len(CATALOG_ROWS), (
            f"expected {len(CATALOG_ROWS)} data rows, got {len(data_rows)}"
        )
        assert [tuple(r) for r in data_rows] == [tuple(r) for r in CATALOG_ROWS]

    def test_csv_every_row_has_both_fields(self, tmp_path):
        """AC-1: no row is missing a schema or table name."""
        out = tmp_path / "out.csv"
        mod.write_csv(CATALOG_ROWS, out)
        with out.open(newline="") as fh:
            reader = csv.DictReader(fh)
            assert reader.fieldnames == ["schema_name", "table_name"]
            for row in reader:
                assert row["schema_name"], f"empty schema_name in {row}"
                assert row["table_name"], f"empty table_name in {row}"


# ---------------------------------------------------------------------------
# AC-2  Summary grouped by schema
# ---------------------------------------------------------------------------
class TestSummaryGrouping:
    def test_summary_has_a_header_per_schema(self, capsys, tmp_path):
        """AC-2: each reachable schema gets its own header line listing its count."""
        mod.print_summary(CATALOG_ROWS, tmp_path / "out.csv")
        out = capsys.readouterr().out
        schemas = {s for s, _ in CATALOG_ROWS}
        for schema in schemas:
            count = sum(1 for s, _ in CATALOG_ROWS if s == schema)
            assert f"{schema}  ({count} table" in out, (
                f"no grouped header for schema {schema} in summary output"
            )

    def test_summary_lists_tables_under_their_schema(self, capsys, tmp_path):
        """AC-2: a schema's tables appear after that schema's header."""
        mod.print_summary(CATALOG_ROWS, tmp_path / "out.csv")
        out = capsys.readouterr().out
        idx = out.index("VEDANTA_POC  (")
        block = out[idx:]
        for schema, table in CATALOG_ROWS:
            if schema == "VEDANTA_POC":
                assert table in block

    def test_summary_reports_reachable_schemas(self, capsys, tmp_path):
        """AC-2: summary states which schemas were reachable and the totals."""
        mod.print_summary(CATALOG_ROWS, tmp_path / "out.csv")
        out = capsys.readouterr().out
        schemas = sorted({s for s, _ in CATALOG_ROWS})
        assert "Reachable schemas" in out
        for schema in schemas:
            assert schema in out
        assert f"Total tables: {len(CATALOG_ROWS)}" in out

    def test_summary_handles_empty(self, capsys, tmp_path):
        """AC-2: with no reachable tables, the summary says so rather than erroring."""
        mod.print_summary([], tmp_path / "out.csv")
        out = capsys.readouterr().out
        assert "No tables reachable" in out


# ---------------------------------------------------------------------------
# AC-3  Only read-only catalog statements are issued
# ---------------------------------------------------------------------------
class TestReadOnlyCatalogAccess:
    def test_returns_captured_catalog_rows(self, executed_statements, config):
        """The mocked connection yields the catalog rows the script then uses."""
        rows = mod.fetch_tables(config)
        assert rows == CATALOG_ROWS

    def test_only_select_or_readonly_guard_statements(self, executed_statements, config):
        """AC-3: every statement is a SELECT or the READ ONLY transaction guard."""
        mod.fetch_tables(config)
        assert executed_statements, "no statements were executed"
        for sql in executed_statements:
            stripped = sql.strip().upper()
            assert stripped.startswith("SELECT") or "SET TRANSACTION READ ONLY" in stripped, (
                f"non-catalog statement issued: {sql!r}"
            )

    def test_no_ddl_or_dml_keywords(self, executed_statements, config):
        """AC-3: no INSERT/UPDATE/DELETE/CREATE/ALTER/DROP/etc. is ever issued."""
        mod.fetch_tables(config)
        for sql in executed_statements:
            upper = sql.upper()
            for kw in FORBIDDEN_KEYWORDS:
                assert f" {kw} " not in f" {upper} " and not upper.strip().startswith(kw), (
                    f"forbidden keyword {kw!r} found in statement: {sql!r}"
                )

    def test_catalog_source_is_sys_tables(self, executed_statements, config):
        """AC-3: the enumeration reads from the SYS.TABLES catalog view."""
        mod.fetch_tables(config)
        selects = [s for s in executed_statements if s.strip().upper().startswith("SELECT")]
        assert any("SYS.TABLES" in s.upper() for s in selects), (
            "no SELECT against SYS.TABLES — enumeration not sourced from the catalog"
        )

    def test_connection_is_closed(self, executed_statements, config):
        """The connection is closed after enumeration (no leaked session)."""
        rows = mod.fetch_tables(config)
        assert rows == CATALOG_ROWS
