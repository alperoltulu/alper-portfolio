import { builder } from "@builder.io/sdk";
export const runtime = 'edge';

import { RenderBuilderContent } from "@/components/builder";
import DefaultPortfolio from "@/components/DefaultPortfolio";

builder.init("c37efdc701164072a49340387b858505");

export default async function Home() {
  const content = await builder
    .get("page", {
      userAttributes: {
        urlPath: "/",
      },
    })
    .toPromise();

  const isEditing = (builder as any).isEditing;
  const isPreviewing = (builder as any).isPreviewing;

  if (!content && !isEditing && !isPreviewing) {
    return <DefaultPortfolio />;
  }

  return <RenderBuilderContent content={content} model="page" />;
}
