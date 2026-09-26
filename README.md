# claire-dash — Inventory & Forecasting Cell Dashboard

Next.js 16 + TypeScript + Tailwind v4 + Recharts dashboard for the Inventory & Forecasting Cell.

## What it does

Publishes a full SAP-extract analysis to a live dashboard with five tabs:
- **Overview** — headline KPIs (gross inventory value, turnover, DOH, NMI/SMI counts, critical spares availability, forecast accuracy)
- **Forecasts** — 3/6/12-month material demand forecasts from the MCP engine, forecast-vs-actual chart
- **Alerts** — overstock, understock, NM/SM trending materials with inventory-value opportunity
- **PR Recommendations** — prioritised purchase requisition table with suggested dates and quantities
- **Data Quality** — data profiling findings, missing fields, duplicate candidates

## Data

`app/data/inventory_data.json` — generated from mock_inventory_input_data.xlsx (18 materials × 20 columns, snapshot 2026-09-01, 217 monthly consumption rows Oct-2025 to Sep-2026).

## Running

```bash
npm ci
npm run build
npm run start
```

Dev server: `npm run dev`

## SAP HANA table inventory (read-only)

`scripts/list_hana_tables.py` enumerates every schema and table the connected
SAP HANA user can reach. It is a **read-only catalog scan** — it only SELECTs
from `SYS.SCHEMAS` / `SYS.TABLES` and never modifies any HANA data.

It writes a CSV (`schema_name`, `table_name`, sorted and grouped by schema) and
prints a human-readable summary grouped by schema, noting which schemas were
reachable if access is scoped.

```bash
# 1. Install the client
pip install -r scripts/requirements.txt

# 2. Configure credentials (copy the template, fill in real values)
cp .env.example .env
#    then edit .env — HANA_HOST, HANA_USER, HANA_PASSWORD (.env is gitignored)

# 3. Run it
python scripts/list_hana_tables.py            # writes scripts/hana_tables.csv
python scripts/list_hana_tables.py --output /tmp/tables.csv   # custom path
```

Connection settings come from the environment or a local `.env` file
(see `.env.example`): `HANA_HOST`, `HANA_PORT` (default 443), `HANA_USER`,
`HANA_PASSWORD`, `HANA_ENCRYPT` (default `true`).

## Ticket

S-1 — Analyse SAP extract and publish full inventory dashboard to claire-dash
