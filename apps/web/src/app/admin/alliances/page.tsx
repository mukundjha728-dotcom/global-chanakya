import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Alliances | Admin",
};

export default function AlliancesPage() {
  const schema = SCHEMAS["alliances"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}