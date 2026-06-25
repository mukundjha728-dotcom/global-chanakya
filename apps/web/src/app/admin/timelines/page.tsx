import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Timelines | Admin",
};

export default function TimelinesPage() {
  const schema = SCHEMAS["timelines"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericList schema={schema} />;
}