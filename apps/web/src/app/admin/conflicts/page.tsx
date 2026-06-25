import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Conflicts | Admin",
};

export default function ConflictsPage() {
  const schema = SCHEMAS["conflicts"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}