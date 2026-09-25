"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/builder/HeroSection";
import ProjectsSection from "@/components/builder/ProjectsSection";

const DEFAULT_DATA = {
  hero: {
    avatarText: "A.",
    subtitle: "Alper Oltulu",
    title: "Fikirleri Koda,<br/>Kodları Geleceğe.",
    description: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum."
  },
  projects: [
    {
      title: "Mobil Uygulama APK",
      desc: "Android için geliştirdiğim yenilikçi mobil uygulamam.",
      demo: "#",
      apk: "#",
      color: "from-blue-500 to-cyan-500"
    }
  ]
};

export default function Home() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Yükleniyor...</div>;
  }

  return (
    <main>
      <HeroSection 
        avatarText={data.hero.avatarText}
        subtitle={data.hero.subtitle}
        title={data.hero.title}
        description={data.hero.description}
      />
      <ProjectsSection projects={data.projects} />
    </main>
  );
}
