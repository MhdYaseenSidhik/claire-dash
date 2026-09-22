"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataQualityTab({ data }: { data: any }) {
  const { data_quality, inventory } = data;

  const nmMats = inventory.filter((m: any) => m.NM_Flag);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Completeness Score */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderLeft: "3px solid var(--warning)",
          borderRadius: "var(--radius)", padding: "16px 20px"
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Data Completeness
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--warning)" }}>94.4%</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>4 fields missing from extract</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Date Range</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{data_quality.date_range}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>12 months of history</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Consumption Rows</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{data_quality.total_consumption_rows}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>18 materials × 12 months</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Duplicate Codes</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>None</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>No description duplicates found</div>
        </div>
      </div>

      {/* Missing Fields */}
      <div style={{
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: "var(--radius)", padding: "16px 20px"
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)", marginBottom: 12 }}>
          ⛔ Missing Fields — 4 Gaps in Extract
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { field: "GR History", impact: "Cannot validate actual lead times or receipt patterns" },
            { field: "PO History", impact: "Cannot assess double-ordering risk or supplier performance" },
            { field: "Open PR List", impact: "Cannot confirm if PRs already raised for suggested items" },
            { field: "Shutdown Schedule Dates", impact: "Planned consumption spikes not modelled in forecast" },
          ].map(f => (
            <div key={f.field} style={{
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px"
            }}>
              <div style={{ fontWeight: 600, color: "var(--danger)", fontSize: 12, marginBottom: 4 }}>
                {f.field}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.impact}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)" }}>Action:</strong> Request these fields from SAP team before next analysis cycle.
          Raise data gap ticket with IT/SAP team.
        </div>
      </div>

      {/* Zero Consumption Materials */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(239,68,68,0.04)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)" }}>
            Zero-Consumption Materials — {data_quality.no_movement_12m.length} Materials
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>
            No movement recorded in 12-month window
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Code","Description","Category","Plant","Current Stock","Unit Cost","Gross Value","NM Flag","Criticality"].map(h => (
                <th key={h} style={{ padding: "9px 12px", textAlign: h.match(/Stock|Cost|Value/) ? "right" : "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nmMats.map((m: any, i: number) => (
              <tr key={m.Material_Code} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)")}
              >
                <td style={{ padding: "9px 12px", color: "var(--danger)", fontWeight: 500 }}>{m.Material_Code}</td>
                <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>{m.Category}</span></td>
                <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.Plant}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>₹{m.Unit_Cost.toLocaleString("en-IN")}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>₹{m.Gross_Value.toLocaleString("en-IN")}</td>
                <td style={{ padding: "9px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontWeight: 600 }}>NM</span>
                </td>
                <td style={{ padding: "9px 12px" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 3, fontWeight: 600,
                    background: m.Criticality === "Critical" ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.2)",
                    color: m.Criticality === "Critical" ? "var(--danger)" : "var(--text-dim)"
                  }}>{m.Criticality}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Data Quality Notes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data_quality.notes.map((note: string, i: number) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }}>›</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NM/SM Flag Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--danger)", marginBottom: 10 }}>
            NM-Flagged Materials ({data_quality.nm_flagged.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data_quality.nm_flagged.map((code: string) => (
              <span key={code} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontWeight: 500 }}>
                {code}
              </span>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warning)", marginBottom: 10 }}>
            SM-Flagged Materials ({data_quality.sm_flagged.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data_quality.sm_flagged.map((code: string) => (
              <span key={code} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 3, background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontWeight: 500 }}>
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
