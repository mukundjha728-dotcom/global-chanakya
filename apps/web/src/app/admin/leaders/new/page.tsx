import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "New Leader | Admin",
};

export default function NewLeaderPage() {
  const schema = SCHEMAS["leaders"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} />;
}