import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Timeline | Admin",
};

export default function NewTimelinePage() {
  const schema = SCHEMAS["timelines"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}