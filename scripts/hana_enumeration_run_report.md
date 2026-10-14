# SAP HANA Table Enumeration — Run Report (S-3)

**Date:** 2026-10-14  
**Ticket:** S-3  
**Branch:** feature/s-3-s-3-report-current-hana-table-list  
**Script:** `scripts/list_hana_tables.py`

## Execution Status

**BLOCKED — SAP HANA connector unavailable at time of execution.**

The `hana_list_tables`, `hana_query`, and `hana_query_table` platform tools all
returned `"SAP HANA request failed. Check the connection under Connectors and try again."`
when called at 2026-10-14T06:18–06:25 UTC.

The sandbox does not have HANA credentials injected as environment variables
(`HANA_HOST`, `HANA_USER`, `HANA_PASSWORD` are absent from the process
environment). The script requires these to connect; without them it exits with
code 2 and the message:

```
ERROR: missing required environment variable(s): HANA_HOST, HANA_USER, HANA_PASSWORD
```

**No output was fabricated.** The `scripts/hana_tables.csv` file is NOT
committed because doing so with invented data would be incorrect.

## What Is Needed to Unblock

1. Restore the SAP HANA connector in the Integrations panel
   (host: `a90cbb14-5ad3-48af-ba3b-f6042c94f8bd.hna0.prod-us10.hanacloud.ondemand.com`,
   port 443, TLS on).
2. Re-run this task — the script, branch and PR are already in place.

## Script Verification (Tests)

The enumeration script was verified against all acceptance criteria using the
mocked test suite:

| Test suite | Tests | Passed | Failed |
|---|---|---|---|
| `tests/test_kpi_calculations.py` + `tests/test_hana_enumeration.py` | 104 | 104 | 0 |

The script itself is correct; only the live connection is unavailable.

## Previously Recorded Inventory (2026-09-26)

From `repo_recall` notes recorded after the actual run on 2026-09-26, the
connected HANA user reached **180 tables across 8 schemas**:

| Schema | Notes |
|---|---|
| `VEDANTA_POC` | 21 business tables — DIM_*/FACT_*/inventory analytics |
| `PAL_CONTENT` | SAP ML/PAL system schema |
| `PAL_ANNS_CONTENT` | SAP ML/PAL system schema |
| `PAL_EMBEDDING_VECTOR_PCA` | SAP ML/PAL system schema |
| `PAL_ML_TRACK` | SAP ML/PAL system schema |
| `PAL_SCHEDULED_EXECUTION` | SAP ML/PAL system schema |
| `PAL_STEM_TFIDF` | SAP ML/PAL system schema |
| `SAP_PA_APL` | SAP APL system schema |

**Total: 180 tables, 8 schemas** (as of 2026-09-26 run).

This is informational only. The authoritative CSV must come from a live run.
