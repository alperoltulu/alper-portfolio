"use client";
import { builder } from "@builder.io/sdk";
import { BuilderComponent, useIsPreviewing } from "@builder.io/react";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export function RenderBuilderContent({ content, model }: { content: any; model: string }) {
  const isPreviewing = useIsPreviewing();
  if (content || isPreviewing) {
    return <BuilderComponent content={content} model={model} />;
  }
  return null;
}
