import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Blog | Admin",
};

export default function NewBlogPage() {
  const schema = SCHEMAS["blogs"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}