import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = { title: "Edit Alliance | Admin" };

export default async function EditAlliancePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const schema = SCHEMAS["alliances"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} entityId={id} initialData={{}} />;
}