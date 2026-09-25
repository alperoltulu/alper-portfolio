"use client";

import { useState, useEffect } from "react";
import CanvasEngine from "@/components/builder/CanvasEngine";
import HeroStatic from "@/components/builder/HeroStatic";
import ProjectsSection from "@/components/builder/ProjectsSection";

const DEFAULT_DATA = {
  hero: {
    avatarText: "A.",
    subtitle: "Alper Oltulu",
    title: "Fikirleri Koda,<br/>Kodları Geleceğe.",
    description: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum.",
    elements: []
  },
  projects: []
};

export default function Home() {
  const [data, setData] = useState<any>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          if (!res.data.hero) res.data.hero = { elements: [] };
          if (!res.data.hero.elements) res.data.hero.elements = [];
          if (!res.data.projects) res.data.projects = [];
          setData(res.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Yükleniyor...</div>;
  }

  const displayElements = data.hero?.elements ? [...data.hero.elements] : [];
  if (!displayElements.find((e: any) => e.type === 'hero')) {
    displayElements.push({ id: 'hero-block', type: 'hero', x: 50, y: 15, w: 800, props: {} });
  }
  if (!displayElements.find((e: any) => e.type === 'projects')) {
    displayElements.push({ id: 'projects-block', type: 'projects', x: 50, y: 70, w: 1200, props: {} });
  }

  return (
    <main className="min-h-[200vh] w-full relative overflow-x-hidden">
      <CanvasEngine 
        elements={displayElements}
        isEditMode={false}
        heroNode={<HeroStatic {...data.hero} />}
        projectsNode={<ProjectsSection projects={data.projects} />}
      />
    </main>
  );
}
