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

## Ticket

S-1 — Analyse SAP extract and publish full inventory dashboard to claire-dash
