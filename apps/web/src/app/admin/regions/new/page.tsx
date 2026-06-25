import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Region | Admin",
};

export default function NewRegionPage() {
  const schema = SCHEMAS["regions"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}