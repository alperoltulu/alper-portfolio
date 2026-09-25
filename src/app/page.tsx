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
          
          // Migrate old hero static data to individual canvas elements
          if (res.data.hero.title || res.data.hero.subtitle || res.data.hero.avatarText) {
            const newElements = [];
            
            if (res.data.hero.avatarText) {
              newElements.push({ id: 'hero-logo', type: 'text', x: 50, y: 3, w: 120, h: 120, props: { text: res.data.hero.avatarText, isLogo: true } });
            }
            if (res.data.hero.subtitle) {
              newElements.push({ id: 'hero-sub', type: 'text', x: 50, y: 7, w: 600, props: { text: res.data.hero.subtitle, textType: 'subtitle', color: '#94a3b8', fontSize: '18' } });
            }
            if (res.data.hero.title) {
              newElements.push({ id: 'hero-title', type: 'text', x: 50, y: 12, w: 800, props: { text: res.data.hero.title, textType: 'title', isGradient: true } });
            }
            if (res.data.hero.description) {
              newElements.push({ id: 'hero-desc', type: 'text', x: 50, y: 22, w: 700, props: { text: res.data.hero.description, textType: 'description', color: '#64748b', fontSize: '16' } });
            }
            
            // Push migrated elements and clear old static fields
            res.data.hero.elements.push(...newElements);
            delete res.data.hero.title;
            delete res.data.hero.subtitle;
            delete res.data.hero.description;
            delete res.data.hero.avatarText;
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

          res.data.hero.elements = res.data.hero.elements.filter((e: any) => e.type !== 'projects' && e.type !== 'hero');

          if (!res.data.navbar) res.data.navbar = { enabled: true, links: [] };

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

  return (
    <main className="h-[4000px] w-full relative overflow-x-hidden">
      {/* Navbar */}
      {data.navbar?.enabled && data.navbar?.links?.length > 0 && (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-center gap-8">
            {data.navbar.links.map((link: any) => (
              <a 
                key={link.id} 
                href={link.url}
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      <CanvasEngine 
        elements={displayElements}
        isEditMode={false}
        heroNode={<HeroStatic {...data.hero} />}
      />
    </main>
  );
}
