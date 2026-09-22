import React from "react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderLeft: "3px solid var(--danger)",
            borderRadius: "var(--radius)",
            padding: "32px 40px",
            maxWidth: 480,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
              Dashboard failed to load
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
              The inventory data could not be read. Check that{" "}
              <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 3, fontSize: 12 }}>
                src/data/inventory_data.json
              </code>{" "}
              is present and valid JSON.
            </div>
            {this.state.message && (
              <div style={{
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                fontSize: 11,
                color: "var(--danger)",
                fontFamily: "monospace",
                textAlign: "left",
                wordBreak: "break-all",
              }}>
                {this.state.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                padding: "8px 20px",
                background: "var(--accent)",
                color: "#0f172a",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                minHeight: 40,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Reload dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
