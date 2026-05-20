import { redirect } from "next/navigation";
export default async function SpecTemplateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/spec-templates/${id}/edit`);
}
