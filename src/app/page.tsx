import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "@/components/builder";
import DefaultPortfolio from "@/components/DefaultPortfolio";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

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
