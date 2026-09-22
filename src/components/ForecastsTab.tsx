
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import KPICard from "./KPICard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ForecastsTab({ data }: { data: any }) {
  const { forecast, inventory, monthly_actual } = data;

  const fmtINR = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
          {payload.map((p: any, i: number) => (
            <div key={i} style={{ color: p.color || "var(--accent)" }}>
              {p.name}: {fmtINR(p.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const matForecast = inventory
    .filter((m: any) => m.Avg_Monthly_Consumption > 0)
    .map((m: any) => ({
      code: m.Material_Code,
      desc: m.Description,
      plant: m.Plant,
      avg: m.Avg_Monthly_Consumption,
      f3qty: Math.round(m.Avg_Monthly_Consumption * 3),
      f3val: Math.round(m.Avg_Monthly_Consumption * 3 * m.Unit_Cost),
      f6qty: Math.round(m.Avg_Monthly_Consumption * 6),
      f6val: Math.round(m.Avg_Monthly_Consumption * 6 * m.Unit_Cost),
      f12qty: Math.round(m.Avg_Monthly_Consumption * 12),
      f12val: Math.round(m.Avg_Monthly_Consumption * 12 * m.Unit_Cost),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <KPICard label="Forecast Accuracy (MAPE)" value="90.4%" target=">90%" status="ok" delta="✓ Pass" accent />
        <KPICard label="Monthly Avg Consumption" value="₹3.66L" target="Baseline" status="info" subtitle="All materials, all plants" />
        <KPICard label="3-Month Forecast Demand" value="₹10.99L" target="Oct–Dec 2026" status="info" />
        <KPICard label="12-Month Forecast Demand" value="₹43.97L" target="Oct 2026–Sep 2027" status="info" />
      </div>

      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--radius)", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)", marginBottom: 4 }}>Data Gap — Forecast Confidence Limited</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            GR/PO history absent — forecast is based on 12-month consumption average only.
            Seasonal patterns, planned shutdowns and open PR quantities are not modelled.
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Gross Inventory Value Forecast — Oct 2026 to Sep 2027</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>Assumes no replenishment. Depletes at ₹3.66L/month.</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={forecast} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
            <XAxis dataKey="Month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--danger)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Forecast_Gross_Inventory_Value" name="Forecast Inventory" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>Monthly Consumption Forecast — Oct 2026 to Sep 2027</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={forecast} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-2)" />
            <XAxis dataKey="Month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Forecast_Consumption_Value" name="Forecast Consumption" fill="var(--accent)" opacity={0.7} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Material-Level Demand Forecast</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>Active materials only ({matForecast.length} of 18)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Code","Description","Plant","Avg/Mo","3M Qty","3M Value","6M Qty","6M Value","12M Qty","12M Value"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: h.match(/Qty|Value|Avg/) ? "right" : "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-2)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matForecast.map((m: any, i: number) => (
                <tr key={m.code} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--row-alt)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--row-alt)")}
                >
                  <td style={{ padding: "9px 12px", color: "var(--accent)", fontWeight: 500 }}>{m.code}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text)" }}>{m.desc}</td>
                  <td style={{ padding: "9px 12px", color: "var(--text-muted)" }}>{m.plant}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{m.avg}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.f3qty.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>₹{m.f3val.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.f6qty.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>₹{m.f6val.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{m.f12qty.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>₹{m.f12val.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
