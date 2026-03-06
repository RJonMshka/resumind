import type { TemplateId, StructuredResume } from "@/types";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

const TEMPLATE_COMPONENTS: Record<
  TemplateId,
  React.ComponentType<{ resume: StructuredResume }>
> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
};

export async function renderPdf(
  templateId: TemplateId,
  resume: StructuredResume
): Promise<Blob> {
  const Component = TEMPLATE_COMPONENTS[templateId];
  const doc = createElement(Component, { resume });
  // Each template returns a <Document> — cast needed because pdf() types
  // expect DocumentProps but our wrapper components return Document elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob();
  return blob;
}
