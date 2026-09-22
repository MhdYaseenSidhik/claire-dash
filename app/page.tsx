"use client";
import { useState } from "react";
import data from "./data/inventory_data.json";
import OverviewTab from "./components/OverviewTab";
import ForecastsTab from "./components/ForecastsTab";
import AlertsTab from "./components/AlertsTab";
import PRTab from "./components/PRTab";
import DataQualityTab from "./components/DataQualityTab";

const TABS = [
  { id: "overview",     label: "Overview" },
  { id: "forecasts",    label: "Forecasts" },
  { id: "alerts",       label: "Alerts" },
  { id: "pr",           label: "PR Recommendations" },
  { id: "dataquality",  label: "Data Quality" },
];

export default function Home() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top Nav */}
      <header style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#0f172a"
          }}>I</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
            Inventory &amp; Forecasting Cell
          </span>
          <span style={{
            fontSize: 11, color: "var(--text-dim)",
            background: "var(--surface-2)",
            padding: "2px 8px", borderRadius: 4,
            marginLeft: 4
          }}>claire-dash</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Snapshot: <strong style={{ color: "var(--text)" }}>2026-09-01</strong>
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Generated: <strong style={{ color: "var(--text)" }}>2026-09-22</strong>
          </span>
          <span style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 4,
            background: "rgba(34,197,94,0.15)", color: "var(--success)",
            border: "1px solid rgba(34,197,94,0.3)"
          }}>● Live</span>
        </div>
      </header>

      {/* Tab Bar */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        display: "flex",
        gap: 0,
        overflowX: "auto",
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              whiteSpace: "nowrap",
              transition: "color 0.15s, border-color 0.15s",
              background: "none",
            }}
          >
            {t.label}
            {t.id === "alerts" && (
              <span style={{
                marginLeft: 6, fontSize: 10, padding: "1px 5px",
                borderRadius: 10, background: "var(--danger)",
                color: "#fff", fontWeight: 700
              }}>17</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <main style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        {tab === "overview"    && <OverviewTab data={data} />}
        {tab === "forecasts"   && <ForecastsTab data={data} />}
        {tab === "alerts"      && <AlertsTab data={data} />}
        {tab === "pr"          && <PRTab data={data} />}
        {tab === "dataquality" && <DataQualityTab data={data} />}
      </main>
    </div>
  );
}
