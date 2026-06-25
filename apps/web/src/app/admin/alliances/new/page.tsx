import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Alliance | Admin",
};

export default function NewAlliancePage() {
  const schema = SCHEMAS["alliances"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}