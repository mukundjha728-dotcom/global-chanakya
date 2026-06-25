import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Edit Blog | Admin",
};

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const schema = SCHEMAS["blogs"];

  if (!schema) return <div>Schema not found</div>;

  // Data is loaded client-side inside GenericEditor (requires auth cookie, not available server-side)
  return <GenericEditor schema={schema} entityId={id} initialData={{}} />;
}