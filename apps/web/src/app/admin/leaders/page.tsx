import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Leaders | Admin",
};

export default function LeadersPage() {
  const schema = SCHEMAS["leaders"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}