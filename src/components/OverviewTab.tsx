
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import KPICard from "./KPICard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OverviewTab({ data }: { data: any }) {
  const { kpis, inventory, monthly_actual, category_breakdown, plant_breakdown } = data;

  const fmtINR = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v}`;
  };

  const chartColors = ["#06b6d4","#0891b2","#0e7490","#155e75","#164e63"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
          {payload.map((p: any, i: number) => (
            <div key={i} style={{ color: p.color || "var(--accent)" }}>
              {fmtINR(p.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <KPICard label="Gross Inventory Value" value="₹19.33L"
          target="Reduce ≥10% → ₹17.4L" status="warn" delta="↓ Target" accent />
        <KPICard label="Inventory Turnover" value="0.91×"
          target="≥1.5×" status="danger" delta="Below" accent />
        <KPICard label="NMI Count" value="7"
          target="≤2 (≤10%)" status="danger" delta="⚠ High" accent subtitle="Zero movement 12m" />
        <KPICard label="SMI Count" value="11"
          target="≤4 (≤20%)" status="warn" delta="⚠ High" accent subtitle="Slow-moving" />
        <KPICard label="Critical Spares" value="100%"
          target=">95%" status="ok" delta="✓ Pass" accent subtitle="5/5 above safety stock" />
        <KPICard label="Forecast Accuracy" value="90.4%"
          target=">90%" status="ok" delta="✓ Pass" accent />
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Category Breakdown */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
            Gross Value by Category
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={category_breakdown} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
              <XAxis dataKey="Category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Gross_Value" radius={[4,4,0,0]}>
                {category_breakdown.map((_: any, i: number) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plant Breakdown */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
            Gross Value by Plant
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={plant_breakdown} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
              <XAxis dataKey="Plant" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Gross_Value" radius={[4,4,0,0]}>
                {plant_breakdown.map((_: any, i: number) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Consumption Chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          Monthly Consumption Value — Oct 2025 to Sep 2026
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly_actual} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
            <XAxis dataKey="Month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Actual_Consumption_Value" fill="var(--accent)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Inventory Composition — 18 Materials</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Snapshot: 2026-09-01</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Code","Description","Category","Plant","Stock","Safety Stk","Unit Cost","Gross Value","DOH","NM","SM","Criticality"].map(h => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: h.match(/Stock|Cost|Value|DOH/) ? "right" : "left",
                    color: "var(--text-muted)", fontWeight: 600, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                    position: "sticky", top: 0, background: "var(--surface-2)"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((m: any, i: number) => (
                <tr key={m.Material_Code}
                  style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)")}
                >
                  <td style={{ padding: "9px 12px", color: "var(--accent)", fontWeight: 500, whiteSpace: "nowrap" }}>{m.Material_Code}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.Description}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 3, background: "var(--surface-2)", color: "var(--text-muted)" }}>
                      {m.Category}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.Plant}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{m.Current_Stock.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.Safety_Stock}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>₹{m.Unit_Cost.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 500, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>₹{m.Gross_Value.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: m.DOH >= 9999 ? "var(--danger)" : m.DOH > 180 ? "var(--warning)" : "var(--text-muted)" }}>
                    {m.DOH >= 9999 ? "∞" : m.DOH}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {m.NM_Flag && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontWeight: 600 }}>NM</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {m.SM_Flag && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontWeight: 600 }}>SM</span>
                    )}
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
      </div>
    </div>
  );
}
