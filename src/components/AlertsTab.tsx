
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AlertsTab({ data }: { data: any }) {
  const { overstock, understock, inventory, nm_sm_predictions, kpis } = data;
  const [section, setSection] = useState<"overstock"|"nmsm"|"trending">("overstock");

  const nmMats = inventory.filter((m: any) => m.NM_Flag);
  const smMats = inventory.filter((m: any) => m.SM_Flag);

  const fmtINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const excessValueColor = (v: number) => {
    if (v >= 100000) return "var(--danger)";
    if (v >= 50000) return "var(--warning)";
    return "var(--text-muted)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Alert Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {[
          { label: "Overstocked", value: kpis.overstocked_count, color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
          { label: "Understocked", value: kpis.understocked_count, color: "var(--success)", bg: "rgba(34,197,94,0.1)" },
          { label: "NM-Flagged", value: kpis.nmi_count, color: "var(--danger)", bg: "rgba(239,68,68,0.1)" },
          { label: "SM-Flagged", value: kpis.smi_count, color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
          { label: "NM/SM Trending", value: nm_sm_predictions.length, color: "var(--info)", bg: "rgba(59,130,246,0.1)" },
        ].map(a => (
          <div key={a.label} style={{
            background: a.bg, border: `1px solid ${a.color}30`,
            borderRadius: "var(--radius)", padding: "14px 16px", textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: a.color }}>{a.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* Section Switcher */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "overstock", label: `Overstock (${overstock.length})` },
          { id: "nmsm", label: `NM/SM Materials (${kpis.nmi_count + kpis.smi_count})` },
          { id: "trending", label: `Trending NM/SM (${nm_sm_predictions.length})` },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id as any)} aria-pressed={section === s.id} style={{
            padding: "7px 14px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 500,
            background: section === s.id ? "var(--accent)" : "var(--surface-2)",
            color: section === s.id ? "#0f172a" : "var(--text-muted)",
            transition: "all 0.15s"
          }}>{s.label}</button>
        ))}
      </div>

      {/* Overstock Table */}
      {section === "overstock" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Overstocked Materials — 10 Items</span>
            <span style={{ fontSize: 12, color: "var(--warning)", fontWeight: 600 }}>
              Total Excess: ₹5,36,957
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Code","Description","Category","Plant","Current Stock","Threshold","Excess Qty","Excess Value","Action"].map(h => (
                    <th key={h} style={{
                      padding: "10px 12px", textAlign: h.match(/Stock|Threshold|Qty|Value/) ? "right" : "left",
                      color: "var(--text-muted)", fontWeight: 600, fontSize: 11,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                      position: "sticky", top: 0, background: "var(--surface-2)"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overstock.map((m: any, i: number) => (
                  <tr key={m.Material_Code}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: m.Excess_Value_INR >= 100000
                        ? "rgba(239,68,68,0.04)"
                        : m.Excess_Value_INR >= 50000
                        ? "rgba(245,158,11,0.04)"
                        : i % 2 === 0 ? "transparent" : "var(--row-alt)"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = m.Excess_Value_INR >= 100000 ? "rgba(239,68,68,0.04)" : m.Excess_Value_INR >= 50000 ? "rgba(245,158,11,0.04)" : i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                  >
                    <td style={{ padding: "9px 12px", color: "var(--accent)", fontWeight: 500 }}>{m.Material_Code}</td>
                    <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{m.Category}</span>
                    </td>
                    <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.Plant}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock.toLocaleString()}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.Overstock_Threshold}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: excessValueColor(m.Excess_Value_INR), fontVariantNumeric: "tabular-nums" }}>
                      {m.Excess_Qty.toFixed(1)}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: excessValueColor(m.Excess_Value_INR), fontVariantNumeric: "tabular-nums" }}>
                      {fmtINR(m.Excess_Value_INR)}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontWeight: 600 }}>
                        Review & Reduce
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Understock */}
      {section === "overstock" && understock.length === 0 && (
        <div style={{
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "var(--radius)", padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--success)", fontSize: 13 }}>No Understocked Materials</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              All 18 materials have current stock ≥ reorder point at snapshot date 2026-09-01.
            </div>
          </div>
        </div>
      )}

      {/* NM/SM Section */}
      {section === "nmsm" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* NM */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(239,68,68,0.06)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)" }}>
                🔴 Non-Moving (NM) — 7 Materials
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>
                Zero consumption in 12-month window (Oct 2025–Sep 2026)
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Code","Description","Category","Plant","Current Stock","Unit Cost","Gross Value","Recommendation"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h.match(/Stock|Cost|Value/) ? "right" : "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nmMats.map((m: any, i: number) => (
                  <tr key={m.Material_Code} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--row-alt)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                  >
                    <td style={{ padding: "9px 12px", color: "var(--danger)", fontWeight: 500 }}>{m.Material_Code}</td>
                    <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{m.Category}</span></td>
                    <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.Plant}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>₹{m.Unit_Cost.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>₹{m.Gross_Value.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontWeight: 600 }}>
                        {m.Criticality === "Critical" ? "Retain — Critical Spare" : "Dispose / Redeploy"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SM */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.06)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>
                🟡 Slow-Moving (SM) — 11 Materials
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>
                Below-threshold consumption velocity
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Code","Description","Category","Plant","Avg/Mo","Current Stock","Gross Value","Recommendation"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h.match(/Avg|Stock|Value/) ? "right" : "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {smMats.map((m: any, i: number) => (
                  <tr key={m.Material_Code} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--row-alt)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                  >
                    <td style={{ padding: "9px 12px", color: "var(--warning)", fontWeight: 500 }}>{m.Material_Code}</td>
                    <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{m.Category}</span></td>
                    <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.Plant}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.Avg_Monthly_Consumption}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: "var(--warning)", fontVariantNumeric: "tabular-nums" }}>₹{m.Gross_Value.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontWeight: 600 }}>
                        {m.Criticality === "Critical" ? "Retain — Monitor" : "Reduce Reorder Qty"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trending NM/SM */}
      {section === "trending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {nm_sm_predictions.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              No materials trending toward NM/SM beyond threshold.
            </div>
          ) : nm_sm_predictions.map((m: any) => (
            <div key={m.Material_Code} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderLeft: `3px solid ${m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)"}`,
              borderRadius: "var(--radius)", padding: "16px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>{m.Material_Code}</span>
                    <span style={{ color: "var(--text)" }}>{m.Description}</span>
                    <span style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 600,
                      background: m.Trend_Pct < -30 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)"
                    }}>{m.Risk}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Consumption trend: Prior 3m avg <strong style={{ color: "var(--text)" }}>{m.Prior_3m_Avg}</strong> → Recent 3m avg <strong style={{ color: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)" }}>{m.Recent_3m_Avg}</strong>
                    <span style={{ marginLeft: 8, fontWeight: 600, color: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)" }}>
                      {m.Trend_Pct}% decline
                    </span>
                  </div>
                  {/* Trend bar */}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", width: 60 }}>Prior 3m</span>
                    <div style={{ height: 6, width: 200, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "100%", background: "var(--text-dim)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.Prior_3m_Avg}/mo</span>
                  </div>
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", width: 60 }}>Recent 3m</span>
                    <div style={{ height: 6, width: 200, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.max(5, (m.Recent_3m_Avg / m.Prior_3m_Avg) * 100)}%`,
                        background: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)",
                        borderRadius: 3
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)" }}>{m.Recent_3m_Avg}/mo</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Gross Value at Risk</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.Trend_Pct < -30 ? "var(--danger)" : "var(--warning)" }}>
                    ₹{m.Gross_Value.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
