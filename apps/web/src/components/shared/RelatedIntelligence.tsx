import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, Map, User, ShieldAlert } from "lucide-react";

interface RelatedItem {
  type: "country" | "leader" | "conflict" | "report";
  title: string;
  slug: string;
  imageUrl?: string;
  subtitle?: string;
}

export function RelatedIntelligence({ items, title = "Related Intelligence" }: { items: RelatedItem[]; title?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginTop: "40px", marginBottom: "40px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f3f4f6", marginBottom: "20px" }}>{title}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {items.map((item, idx) => {
          let href = "/";
          let Icon = FileText;
          let color = "#3b82f6";
          
          if (item.type === "country") { href = `/country/${item.slug}`; Icon = Map; color = "#10b981"; }
          if (item.type === "leader") { href = `/leader/${item.slug}`; Icon = User; color = "#f59e0b"; }
          if (item.type === "conflict") { href = `/conflict/${item.slug}`; Icon = ShieldAlert; color = "#ef4444"; }
          if (item.type === "report") { href = `/blogs/${item.slug}`; Icon = FileText; color = "#6366f1"; }

          return (
            <Link
              key={idx}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = `rgba(${color.replace('#', '')}, 0.5)`;
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: `rgba(${color.replace('#', '')}, 0.1)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px", color }} />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color,
                  gap: "4px",
                }}
              >
                View Details
                <ArrowRight style={{ width: "12px", height: "12px" }} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
