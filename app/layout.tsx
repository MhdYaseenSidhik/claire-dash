import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory & Forecasting Cell — claire-dash",
  description: "AI-driven inventory control dashboard — SAP extract analysis, forecasts, alerts and PR recommendations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
