import HeroSection from "@/components/builder/HeroSection";
import ProjectsSection from "@/components/builder/ProjectsSection";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export default async function Home() {
  let dbData = null;

  try {
    // Cloudflare Edge Runtime'da D1'e erisim
    const db = getRequestContext().env.DB;
    if (db) {
      const { results } = await db.prepare("SELECT * FROM content WHERE id = 'main'").all();
      if (results && results.length > 0) {
        dbData = JSON.parse(results[0].data as string);
      }
    }
  } catch (e) {
    console.error("DB Fetch Error:", e);
  }

  const defaultHero = {
    avatarText: "A.",
    subtitle: "Alper Oltulu",
    title: "Fikirleri Koda,<br/>Kodları Geleceğe.",
    description: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum."
  };

  const defaultProjects = [
    {
      title: "Mobil Uygulama APK",
      desc: "Android için geliştirdiğim yenilikçi mobil uygulamam.",
      demo: "#",
      apk: "#",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const heroData = dbData?.hero || defaultHero;
  const projectsData = dbData?.projects || defaultProjects;

  return (
    <main>
      <HeroSection 
        avatarText={heroData.avatarText}
        subtitle={heroData.subtitle}
        title={heroData.title}
        description={heroData.description}
      />
      <ProjectsSection projects={projectsData} />
    </main>
  );
}
