import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Blogs | Admin",
};

export default function BlogsPage() {
  const schema = SCHEMAS["blogs"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}