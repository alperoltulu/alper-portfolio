import { builder } from "@builder.io/sdk";
export const runtime = 'edge';

import { RenderBuilderContent } from "@/components/builder";
import { notFound } from "next/navigation";

builder.init("c37efdc701164072a49340387b858505");

export default async function Page(props: { params: Promise<{ page: string[] }> }) {
  const params = await props.params;
  const urlPath = "/" + (params?.page?.join("/") || "");
  
  const content = await builder
    .get("page", {
      userAttributes: {
        urlPath,
      },
    })
    .toPromise();

  const isEditing = (builder as any).isEditing;
  const isPreviewing = (builder as any).isPreviewing;

  if (!content && !isEditing && !isPreviewing) {
    notFound();
  }

  return <RenderBuilderContent content={content} model="page" />;
}
