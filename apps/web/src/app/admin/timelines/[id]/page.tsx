import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = { title: "Edit Timeline Event | Admin" };

export default async function EditTimelinePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const schema = SCHEMAS["timelines"];
  if (!schema) return <div>Schema not found</div>;
  return <GenericEditor schema={schema} entityId={id} initialData={{}} />;
}