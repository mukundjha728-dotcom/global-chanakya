import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Country | Admin",
};

export default function NewCountryPage() {
  const schema = SCHEMAS["countries"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}