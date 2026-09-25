"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/builder/HeroSection";
import ProjectsSection from "@/components/builder/ProjectsSection";
import BlockRenderer, { Block, BlockType } from "@/components/builder/BlockRenderer";
import { ChevronDown, ChevronRight, Type, Image as ImageIcon, Link as LinkIcon, Share2, FileText, Video as VideoIcon, Trash2, ArrowUp, ArrowDown, Edit2 } from "lucide-react";

const DEFAULT_DATA = {
  hero: {
    avatarText: "A.",
    subtitle: "Alper Oltulu",
    title: "Fikirleri Koda,<br/>Kodları Geleceğe.",
    description: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum."
  },
  projects: []
};

export default function AdminPage() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [pages, setPages] = useState<{slug: string, title: string, content: string}[]>([]);
  
  // Dynamic Pages Editing State
  const [editingPage, setEditingPage] = useState<{ slug: string, title: string, blocks: Block[] }>({ slug: "", title: "", blocks: [] });
  const [previewMode, setPreviewMode] = useState<'main' | 'dynamic'>('main');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [isHeroOpen, setIsHeroOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isDynamicOpen, setIsDynamicOpen] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(console.error);

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
      if (res.ok) setMessage("✅ Ana sayfa başarıyla kaydedildi!");
      else setMessage("❌ Kaydetme başarısız.");
    } catch (e) {
      setMessage("❌ Hata oluştu.");
    }
    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSavePage = async () => {
    if (!editingPage.slug || !editingPage.title) return alert("Link ve Başlık zorunludur!");
    try {
      const payload = {
        slug: editingPage.slug,
        title: editingPage.title,
        content: JSON.stringify(editingPage.blocks)
      };

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Sayfa başarıyla kaydedildi!");
        setPages([...pages.filter(p => p.slug !== payload.slug), payload]);
        setEditingPage({ slug: "", title: "", blocks: [] });
        setPreviewMode('main');
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
        if (editingPage.slug === slug) {
          setEditingPage({ slug: "", title: "", blocks: [] });
          setPreviewMode('main');
        }
      }
    } catch (e) {}
  };

  const loadPageForEdit = (page: {slug: string, title: string, content: string}) => {
    let blocks: Block[] = [];
    try {
      if (page.content) {
        const parsed = JSON.parse(page.content);
        if (Array.isArray(parsed)) blocks = parsed;
        else blocks = [{ id: "legacy", type: "text", data: { text: page.content } }];
      }
    } catch (e) {
      blocks = [{ id: "legacy", type: "text", data: { text: page.content } }];
    }
    setEditingPage({ slug: page.slug, title: page.title, blocks });
    setPreviewMode('dynamic');
    setIsDynamicOpen(true);
  };

  // Block Builder Functions
  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: Math.random().toString(36).substr(2, 9), type, data: {} };
    if (type === 'button') newBlock.data = { label: "Buton", url: "#" };
    setEditingPage(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setPreviewMode('dynamic');
  };

  const updateBlock = (id: string, field: string, value: any) => {
    setEditingPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b)
    }));
  };

  const removeBlock = (id: string) => {
    setEditingPage(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === editingPage.blocks.length - 1)) return;
    const newBlocks = [...editingPage.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setEditingPage(prev => ({ ...prev, blocks: newBlocks }));
  };

  // Generic Update Helpers
  const handleHeroChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
    setPreviewMode('main');
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...data.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setData(prev => ({ ...prev, projects: newProjects }));
    setPreviewMode('main');
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "Yeni Proje", desc: "Açıklama...", demo: "", apk: "", color: "from-gray-500 to-gray-700" }]
    }));
    setPreviewMode('main');
  };

  const removeProject = (index: number) => {
    const newProjects = [...data.projects];
    newProjects.splice(index, 1);
    setData(prev => ({ ...prev, projects: newProjects }));
    setPreviewMode('main');
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* SOL: Kontrol Paneli */}
      <div className="w-[40%] min-w-[400px] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 flex flex-col gap-6 shadow-xl z-10 relative">
        <div className="flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur pb-4 z-20 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 cursor-pointer" onClick={() => setPreviewMode('main')}>
            Alper CMS
          </h1>
          <button 
            onClick={previewMode === 'main' ? handleSave : handleSavePage}
            disabled={isSaving}
            className={`px-6 py-2 text-white rounded-full font-medium transition shadow-lg disabled:opacity-50 ${previewMode === 'main' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30'}`}
          >
            {isSaving ? "Kaydediliyor..." : (previewMode === 'main' ? "Ana Sayfayı Kaydet" : "Dinamik Sayfayı Kaydet")}
          </button>
        </div>

        {message && <div className="p-3 bg-green-500/20 text-green-600 rounded-lg text-sm font-medium">{message}</div>}

        {/* Hero Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button 
            onClick={() => { setIsHeroOpen(!isHeroOpen); setPreviewMode('main'); }}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">🎯 Karşılama Alanı</h2>
            {isHeroOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>
          
          {isHeroOpen && (
            <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-2">
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
          )}
        </div>

        {/* Projects Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <button 
            onClick={() => { setIsProjectsOpen(!isProjectsOpen); setPreviewMode('main'); }}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">🚀 Projeler</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 font-bold">{data.projects.length} Proje</span>
              {isProjectsOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </div>
          </button>

          {isProjectsOpen && (
            <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <div className="flex justify-end">
                <button onClick={addProject} className="text-xs bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full font-bold hover:bg-blue-500 hover:text-white transition">
                  + Yeni Ekle
                </button>
              </div>

              {data.projects.map((p, i) => (
                <div key={i} className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative group shadow-sm">
                  <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition text-xs font-bold">Sil</button>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Proje Adı</label>
                    <input value={p.title} onChange={e => updateProject(i, "title", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Açıklama</label>
                    <textarea value={p.desc} onChange={e => updateProject(i, "desc", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition h-16 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Demo Link</label>
                      <input value={p.demo} onChange={e => updateProject(i, "demo", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">APK Link</label>
                      <input value={p.apk || ""} onChange={e => updateProject(i, "apk", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Renk (Tailwind Gradients)</label>
                    <input value={p.color} onChange={e => updateProject(i, "color", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition font-mono text-xs" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Pages Builder */}
        <div className="bg-purple-50 dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden mt-6 shadow-sm">
          <button 
            onClick={() => { setIsDynamicOpen(!isDynamicOpen); setPreviewMode(isDynamicOpen ? 'main' : 'dynamic'); }}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">📄 Dinamik Sayfa Yapıcı</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-purple-200 dark:bg-purple-900 px-2 py-1 rounded-full text-purple-700 dark:text-purple-300 font-bold">{pages.length} Sayfa</span>
              {isDynamicOpen ? <ChevronDown className="w-5 h-5 text-purple-500" /> : <ChevronRight className="w-5 h-5 text-purple-500" />}
            </div>
          </button>
          
          {isDynamicOpen && (
            <div className="p-4 pt-0 space-y-6 border-t border-purple-100 dark:border-purple-900/50 mt-2">
              
              {/* List of existing pages */}
              {pages.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-purple-600 mb-2">Mevcut Sayfalar</label>
                  {pages.map(p => (
                    <div key={p.slug} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-purple-100 dark:border-purple-900/50">
                      <div>
                        <div className="font-bold text-sm">{p.title}</div>
                        <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">/p/{p.slug}</a>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadPageForEdit(p)} className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 px-3 py-1 rounded font-medium transition flex items-center gap-1"><Edit2 className="w-3 h-3"/> Düzenle</button>
                        <button onClick={() => handleDeletePage(p.slug)} className="text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 rounded font-medium transition">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Block Builder Area */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-purple-200 dark:border-purple-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-bold text-purple-700 dark:text-purple-400">
                    {editingPage.slug ? "Sayfayı Düzenle" : "Yeni Sayfa Tasarla"}
                  </h3>
                  {editingPage.slug && (
                    <button onClick={() => { setEditingPage({slug:"", title:"", blocks:[]}); setPreviewMode('main'); }} className="text-xs text-slate-500 hover:text-slate-800">İptal</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sayfa Linki (Slug)</label>
                    <input value={editingPage.slug} onChange={e => { setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")}); setPreviewMode('dynamic'); }} placeholder="ornek: harika-proje" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Sayfa Başlığı</label>
                    <input value={editingPage.title} onChange={e => { setEditingPage({...editingPage, title: e.target.value}); setPreviewMode('dynamic'); }} placeholder="Benim Harika Projem" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition" />
                  </div>
                </div>

                {/* Araçlar (Toolbar) */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Araçlar (Blok Ekle)</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => addBlock('text')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><Type className="w-4 h-4"/> Metin</button>
                    <button onClick={() => addBlock('image')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><ImageIcon className="w-4 h-4"/> Resim</button>
                    <button onClick={() => addBlock('button')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><LinkIcon className="w-4 h-4"/> Buton</button>
                    <button onClick={() => addBlock('social')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><Share2 className="w-4 h-4"/> Sosyal</button>
                    <button onClick={() => addBlock('cv')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><FileText className="w-4 h-4"/> CV İndir</button>
                    <button onClick={() => addBlock('video')} className="flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium transition"><VideoIcon className="w-4 h-4"/> Video</button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {editingPage.blocks.map((block, index) => (
                    <div key={block.id} className="relative bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group">
                      
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => moveBlock(index, 'up')} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-blue-500 shadow-sm"><ArrowUp className="w-4 h-4"/></button>
                        <button onClick={() => moveBlock(index, 'down')} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-blue-500 shadow-sm"><ArrowDown className="w-4 h-4"/></button>
                        <button onClick={() => removeBlock(block.id)} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-red-500 shadow-sm ml-2"><Trash2 className="w-4 h-4"/></button>
                      </div>

                      <div className="mb-2 text-xs font-bold text-slate-400 uppercase">{block.type} Bloğu</div>

                      {block.type === 'text' && (
                        <textarea value={block.data.text || ""} onChange={e => updateBlock(block.id, "text", e.target.value)} placeholder="HTML formatında metin..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 h-24 resize-none" />
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3 mt-2">
                          <div><label className="text-xs text-slate-500">Görsel URL</label><input value={block.data.url || ""} onChange={e => updateBlock(block.id, "url", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                          <div className="flex gap-4">
                            <div className="flex-1"><label className="text-xs text-slate-500">Açıklama (Alt)</label><input value={block.data.alt || ""} onChange={e => updateBlock(block.id, "alt", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                            <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer"><input type="checkbox" checked={block.data.rounded || false} onChange={e => updateBlock(block.id, "rounded", e.target.checked)} className="rounded" /> Yuvarlak Yap</label>
                          </div>
                        </div>
                      )}

                      {block.type === 'button' && (
                        <div className="flex gap-4 mt-2">
                          <div className="flex-1"><label className="text-xs text-slate-500">Buton Yazısı</label><input value={block.data.label || ""} onChange={e => updateBlock(block.id, "label", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                          <div className="flex-1"><label className="text-xs text-slate-500">Yönlenecek Link</label><input value={block.data.url || ""} onChange={e => updateBlock(block.id, "url", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                        </div>
                      )}

                      {block.type === 'social' && (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div><label className="text-xs text-slate-500">Twitter (X) Linki</label><input value={block.data.twitter || ""} onChange={e => updateBlock(block.id, "twitter", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></div>
                          <div><label className="text-xs text-slate-500">LinkedIn Linki</label><input value={block.data.linkedin || ""} onChange={e => updateBlock(block.id, "linkedin", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></div>
                          <div><label className="text-xs text-slate-500">Github Linki</label><input value={block.data.github || ""} onChange={e => updateBlock(block.id, "github", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></div>
                          <div><label className="text-xs text-slate-500">Instagram Linki</label><input value={block.data.instagram || ""} onChange={e => updateBlock(block.id, "instagram", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></div>
                          <div><label className="text-xs text-slate-500">YouTube Linki</label><input value={block.data.youtube || ""} onChange={e => updateBlock(block.id, "youtube", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></div>
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="mt-2"><label className="text-xs text-slate-500">YouTube / Vimeo URL</label><input value={block.data.url || ""} onChange={e => updateBlock(block.id, "url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                      )}

                      {block.type === 'cv' && (
                        <div className="flex gap-4 mt-2">
                          <div className="flex-1"><label className="text-xs text-slate-500">Dosya/PDF URL</label><input value={block.data.url || ""} onChange={e => updateBlock(block.id, "url", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                          <div className="flex-1"><label className="text-xs text-slate-500">Buton Yazısı</label><input value={block.data.label || "Özgeçmişimi İndir"} onChange={e => updateBlock(block.id, "label", e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm" /></div>
                        </div>
                      )}

                    </div>
                  ))}
                  {editingPage.blocks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Sayfa şu an boş. Yukarıdaki araçlardan birine tıklayarak tasarım yapmaya başla!
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAĞ: Canlı Önizleme */}
      <div className="w-[60%] flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 relative border-l border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="absolute top-4 right-6 px-4 py-1.5 bg-black/50 backdrop-blur rounded-full text-xs text-white font-mono uppercase z-50 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {previewMode === 'main' ? 'Ana Sayfa Önizleme' : 'Dinamik Sayfa Önizleme'}
        </div>
        
        {previewMode === 'main' ? (
          <div className="pointer-events-none origin-top transition-all">
            <HeroSection 
              avatarText={data.hero.avatarText}
              subtitle={data.hero.subtitle}
              title={data.hero.title}
              description={data.hero.description}
            />
            <ProjectsSection projects={data.projects} />
          </div>
        ) : (
          <div className="py-20 px-8 transition-all min-h-full">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-black mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                {editingPage.title || "Sayfa Başlığı"}
              </h1>
              <BlockRenderer blocks={editingPage.blocks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
