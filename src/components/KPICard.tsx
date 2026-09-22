import React from "react";

interface KPICardProps {
  label: string;
  value: string;
  target?: string;
  status?: "ok" | "warn" | "danger" | "info";
  delta?: string;
  accent?: boolean;
  subtitle?: string;
}

export default function KPICard({ label, value, target, status = "info", delta, accent, subtitle }: KPICardProps) {
  const statusColor = {
    ok:     "var(--success)",
    warn:   "var(--warning)",
    danger: "var(--danger)",
    info:   "var(--accent)",
  }[status];

  const statusBg = {
    ok:     "rgba(34,197,94,0.12)",
    warn:   "rgba(245,158,11,0.12)",
    danger: "rgba(239,68,68,0.12)",
    info:   "rgba(6,182,212,0.12)",
  }[status];

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderLeft: accent ? `3px solid ${statusColor}` : "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "16px 20px",
      boxShadow: "var(--shadow)",
      minWidth: 0,
      transition: "background 0.15s",
      cursor: "default",
    }}
    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
    onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
    >
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
          {value}
        </span>
        {delta && (
          <span style={{
            fontSize: 11, padding: "2px 6px", borderRadius: 4,
            background: statusBg, color: statusColor, fontWeight: 600
          }}>{delta}</span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{subtitle}</div>
      )}
      {target && (
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Target: <span style={{ color: "var(--text-muted)" }}>{target}</span>
        </div>
      )}
    </div>
  );
}
