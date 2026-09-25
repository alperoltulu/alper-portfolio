"use client";
import { builder } from "@builder.io/sdk";
import { BuilderComponent, useIsPreviewing } from "@builder.io/react";
import "../builder-registry";

builder.init("c37efdc701164072a49340387b858505");

export function RenderBuilderContent({ content, model }: { content: any; model: string }) {
  const isPreviewing = useIsPreviewing();
  if (content || isPreviewing) {
    return <BuilderComponent content={content} model={model} />;
  }
  return null;
}
