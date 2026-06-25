import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Countrys | Admin",
};

export default function CountrysPage() {
  const schema = SCHEMAS["countries"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}