"use client";

import { useState, useEffect } from "react";
import CanvasEngine from "@/components/builder/CanvasEngine";
import HeroStatic from "@/components/builder/HeroStatic";

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
          
          if (!res.data.hero.elements.find((e: any) => e.type === 'hero')) {
            res.data.hero.elements.push({ id: 'hero-block', type: 'hero', x: 50, y: 15, w: 800, h: 400, props: {} });
          }
          
          if (res.data.projects && res.data.projects.length > 0) {
            res.data.projects.forEach((proj: any, i: number) => {
              res.data.hero.elements.push({
                id: 'proj-' + Math.random().toString(36).substr(2, 9),
                type: 'project',
                x: 25 + (i % 2) * 50,
                y: 60 + i * 10,
                w: 400,
                props: proj
              });
            });
            res.data.projects = [];
          }

          res.data.hero.elements = res.data.hero.elements.filter((e: any) => e.type !== 'projects');

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

  return (
    <main className="min-h-[200vh] w-full relative overflow-x-hidden">
      <CanvasEngine 
        elements={displayElements}
        isEditMode={false}
        heroNode={<HeroStatic {...data.hero} />}
      />
    </main>
  );
}
