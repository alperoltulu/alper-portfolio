import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "@/components/builder";
import { notFound } from "next/navigation";

// Cloudflare SSG iin tm dinamik rotalar derleme aamasnda tanmlar
export async function generateStaticParams() {
  return [{ page: ['builder-preview'] }]; 
}

export default async function Page({ params }: { params: { page: string[] } }) {
  builder.init("c37efdc701164072a49340387b858505");
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
