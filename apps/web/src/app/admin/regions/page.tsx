import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Regions | Admin",
};

export default function RegionsPage() {
  const schema = SCHEMAS["regions"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}