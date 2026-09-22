
import KPICard from "./KPICard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PRTab({ data }: { data: any }) {
  const { pr_suggestions, inventory } = data;

  const totalPRValue = pr_suggestions.reduce((s: number, r: any) => s + r.PR_Value_INR, 0);

  // Also include materials approaching reorder point (within 1.5× lead time)
  const approaching = inventory.filter((m: any) =>
    m.Avg_Monthly_Consumption > 0 &&
    m.Current_Stock <= m.Reorder_Point * 2 &&
    !pr_suggestions.find((p: any) => p.Material_Code === m.Material_Code)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <KPICard label="Open PR Suggestions" value={String(pr_suggestions.length)}
          status={pr_suggestions.length > 0 ? "warn" : "ok"}
          subtitle="Critical spares only" accent />
        <KPICard label="Total PR Value" value={`₹${(totalPRValue/100000).toFixed(2)}L`}
          status="info" subtitle="All suggested PRs" />
        <KPICard label="Materials Approaching ROP" value={String(approaching.length)}
          status="info" subtitle="Within 2× reorder point" />
      </div>

      {/* Missing Data Warning */}
      <div style={{
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "var(--radius)", padding: "12px 16px",
        display: "flex", gap: 10, alignItems: "flex-start"
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)", marginBottom: 4 }}>
            Open PR List Absent — Double-Order Risk Not Assessed
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            PO history and open PR list are missing from the extract. Verify no existing PRs/POs are open
            before raising these requisitions. MRP eligibility is based on consumption trend only.
          </div>
        </div>
      </div>

      {/* PR Suggestions Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Purchase Requisition Recommendations</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sorted by Criticality → PR Date</span>
        </div>
        {pr_suggestions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 6 }}>
              No PR suggestions at current stock levels
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 360, margin: "0 auto" }}>
              All materials are above their reorder points. Check the <strong>Alerts</strong> tab
              if you expect understocked items, or review reorder points in <strong>Data Quality</strong>.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Code","Description","Category","Criticality","Current Stock","ROP","Months Left","Lead Time","PR Date","Qty","PR Value","MRP"].map(h => (
                    <th key={h} style={{
                      padding: "10px 12px",
                      textAlign: h.match(/Stock|ROP|Months|Lead|Qty|Value/) ? "right" : "left",
                      color: "var(--text-muted)", fontWeight: 600, fontSize: 11,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                      position: "sticky", top: 0, background: "var(--surface-2)"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pr_suggestions.map((r: any, i: number) => (
                  <tr key={r.Material_Code}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      borderLeft: r.Criticality === "Critical" ? "3px solid var(--accent)" : "3px solid transparent",
                      background: r.Criticality === "Critical" ? "rgba(6,182,212,0.04)" : i % 2 === 0 ? "transparent" : "var(--row-alt)"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = r.Criticality === "Critical" ? "rgba(6,182,212,0.04)" : i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                  >
                    <td style={{ padding: "9px 12px", color: "var(--accent)", fontWeight: 500 }}>{r.Material_Code}</td>
                    <td style={{ padding: "9px 12px", color: "var(--text)" }}>{r.Description}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{r.Category}</span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 600,
                        background: r.Criticality === "Critical" ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.2)",
                        color: r.Criticality === "Critical" ? "var(--danger)" : "var(--text-dim)"
                      }}>{r.Criticality}</span>
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.Current_Stock}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{r.Reorder_Point}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: r.Months_Stock_Remaining <= 3 ? "var(--danger)" : "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {r.Months_Stock_Remaining}
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{r.Lead_Time_Days}d</td>
                    <td style={{ padding: "9px 12px", color: "var(--warning)", fontWeight: 500, whiteSpace: "nowrap" }}>{r.Suggested_PR_Date}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.Suggested_Qty}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
                      ₹{r.PR_Value_INR.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 600,
                        background: r.MRP_Eligible === "Yes" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                        color: r.MRP_Eligible === "Yes" ? "var(--success)" : "var(--warning)"
                      }}>{r.MRP_Eligible}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approaching ROP */}
      {approaching.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Materials Approaching Reorder Point</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>Monitor — no immediate PR required</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Code","Description","Category","Current Stock","ROP","Avg/Mo","Months Remaining"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: h.match(/Stock|ROP|Avg|Months/) ? "right" : "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approaching.map((m: any, i: number) => (
                <tr key={m.Material_Code} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--row-alt)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                >
                  <td style={{ padding: "9px 12px", color: "var(--accent)", fontWeight: 500 }}>{m.Material_Code}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                  <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{m.Category}</span></td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.Reorder_Point}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.Avg_Monthly_Consumption}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--info)", fontVariantNumeric: "tabular-nums" }}>
                    {(m.Current_Stock / m.Avg_Monthly_Consumption).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
