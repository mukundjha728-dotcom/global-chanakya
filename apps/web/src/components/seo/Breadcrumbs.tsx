import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd, SchemaGenerators } from "./JsonLd";

import { SITE_URL } from "@/constants";

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schemaItems = [
    { name: "Home", url: SITE_URL },
    ...items.map((item) => ({
      name: item.name,
      url: `${SITE_URL}${item.href}`,
    })),
  ];

  return (
    <>
      <JsonLd schema={SchemaGenerators.breadcrumb(schemaItems)} />
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 0",
          fontSize: "13px",
          fontWeight: 500,
          color: "#9ca3af",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#9ca3af",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f3f4f6")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          <Home style={{ width: "14px", height: "14px" }} />
          <span className="sr-only">Home</span>
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.href}>
              <ChevronRight style={{ width: "14px", height: "14px", color: "#4b5563" }} />
              {isLast ? (
                <span style={{ color: "#f3f4f6" }} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#f3f4f6")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
