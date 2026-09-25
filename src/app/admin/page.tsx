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
      title: "Yeni Projem",
      desc: "Harika bir fikir üzerine kurulu yeni proje.",
      demo: "https://",
      apk: "",
      color: "from-blue-500 to-cyan-500"
    }
  ]
};

export default function AdminPage() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [pages, setPages] = useState<{slug: string, title: string}[]>([]);
  const [newPage, setNewPage] = useState({ slug: "", title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Ana sayfa verisini cek
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(console.error);

    // Dinamik sayfa listesini cek
    fetch("/api/pages")
      .then(res => res.json())
      .then(res => {
        if (res.data) setPages(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      if (res.ok) {
        setMessage("✅ Ana sayfa başarıyla kaydedildi!");
      } else {
        setMessage("❌ Kaydetme başarısız.");
      }
    } catch (e) {
      setMessage("❌ Hata oluştu.");
    }
    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSavePage = async () => {
    if (!newPage.slug || !newPage.title) return alert("Link ve Başlık zorunludur!");
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage)
      });
      if (res.ok) {
        alert("Sayfa eklendi!");
        setPages([...pages.filter(p => p.slug !== newPage.slug), { slug: newPage.slug, title: newPage.title }]);
        setNewPage({ slug: "", title: "", content: "" });
      }
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/pages?slug=${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter(p => p.slug !== slug));
      }
    } catch (e) {}
  };

  const handleHeroChange = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...data.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setData(prev => ({ ...prev, projects: newProjects }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "Yeni Proje", desc: "Açıklama...", demo: "", apk: "", color: "from-gray-500 to-gray-700" }]
    }));
  };

  const removeProject = (index: number) => {
    const newProjects = [...data.projects];
    newProjects.splice(index, 1);
    setData(prev => ({ ...prev, projects: newProjects }));
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* SOL: Kontrol Paneli */}
      <div className="w-1/3 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 flex flex-col gap-6 shadow-xl z-10 relative">
        <div className="flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur pb-4 z-20 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">
            Alper CMS
          </h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet & Yayınla"}
          </button>
        </div>

        {message && <div className="p-3 bg-green-500/20 text-green-600 rounded-lg text-sm font-medium">{message}</div>}

        {/* Hero Form */}
        <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2">🎯 Karşılama Alanı</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Logo / Harf</label>
            <input value={data.hero.avatarText} onChange={e => handleHeroChange("avatarText", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Üst Başlık</label>
            <input value={data.hero.subtitle} onChange={e => handleHeroChange("subtitle", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ana Başlık (HTML Destekli)</label>
            <textarea value={data.hero.title} onChange={e => handleHeroChange("title", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition h-20 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Açıklama Yazısı</label>
            <textarea value={data.hero.description} onChange={e => handleHeroChange("description", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition h-24 resize-none" />
          </div>
        </div>

        {/* Projects Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">🚀 Projeler</h2>
            <button onClick={addProject} className="text-xs bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full font-bold hover:bg-pink-500 hover:text-white transition">
              + Yeni Ekle
            </button>
          </div>

          {data.projects.map((p, i) => (
            <div key={i} className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative group">
              <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition text-xs font-bold">Sil</button>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Proje Adı</label>
                <input value={p.title} onChange={e => updateProject(i, "title", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Açıklama</label>
                <textarea value={p.desc} onChange={e => updateProject(i, "desc", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition h-16 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Demo Link</label>
                  <input value={p.demo} onChange={e => updateProject(i, "demo", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">APK Link</label>
                  <input value={p.apk || ""} onChange={e => updateProject(i, "apk", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Renk (Tailwind Gradients)</label>
                <input value={p.color} onChange={e => updateProject(i, "color", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition font-mono text-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Pages Form */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-purple-500">📄 Dinamik Sayfalar</h2>
          
          {/* List of existing pages */}
          {pages.length > 0 && (
            <div className="space-y-2">
              {pages.map(p => (
                <div key={p.slug} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-sm">{p.title}</div>
                    <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">/p/{p.slug}</a>
                  </div>
                  <button onClick={() => handleDeletePage(p.slug)} className="text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 rounded">Sil</button>
                </div>
              ))}
            </div>
          )}

          {/* Create new page form */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/50 space-y-3">
            <h3 className="font-bold text-sm text-purple-700 dark:text-purple-400">Yeni Sayfa Oluştur</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sayfa Linki (İngilizce karakter, boşluksuz)</label>
              <input value={newPage.slug} onChange={e => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")})} placeholder="ornek: yeni-projem" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Başlık</label>
              <input value={newPage.title} onChange={e => setNewPage({...newPage, title: e.target.value})} placeholder="Benim Harika Projem" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">İçerik (HTML destekler)</label>
              <textarea value={newPage.content} onChange={e => setNewPage({...newPage, content: e.target.value})} placeholder="<p>Bu proje hakkında detaylar...</p>" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition h-32 resize-none" />
            </div>
            <button onClick={handleSavePage} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition shadow-lg shadow-purple-500/30">
              Sayfayı Oluştur / Güncelle
            </button>
          </div>
        </div>
      </div>

      {/* SAĞ: Canlı Önizleme */}
      <div className="w-2/3 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 relative">
        <div className="absolute top-4 right-6 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] text-white/70 font-mono tracking-widest uppercase pointer-events-none z-50">
          Canlı Önizleme Modu
        </div>
        
        {/* Önizleme Alanı - Ana sayfanın birebir kopyasını çiziyoruz */}
        <div className="pointer-events-none origin-top transition-all">
          <HeroSection 
            avatarText={data.hero.avatarText}
            subtitle={data.hero.subtitle}
            title={data.hero.title}
            description={data.hero.description}
          />
          <ProjectsSection projects={data.projects} />
        </div>
      </div>
    </div>
  );
}
