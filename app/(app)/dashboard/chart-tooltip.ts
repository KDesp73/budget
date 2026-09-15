import type { CSSProperties } from "react";

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  boxShadow: "var(--shadow-md)",
  padding: "8px 10px",
  color: "var(--card-foreground)",
  fontSize: "12px",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "var(--muted-foreground)",
  fontWeight: 500,
  marginBottom: "4px",
};

export const tooltipItemStyle: CSSProperties = {
  color: "var(--card-foreground)",
};