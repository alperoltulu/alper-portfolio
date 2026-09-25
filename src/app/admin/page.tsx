"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/builder/HeroSection";
import ProjectsSection from "@/components/builder/ProjectsSection";
import BlockRenderer, { Block, BlockType } from "@/components/builder/BlockRenderer";
import { CanvasElement, CanvasElementType } from "@/types/canvas";
import { ChevronDown, ChevronRight, Type, Image as ImageIcon, Link as LinkIcon, Share2, FileText, Video as VideoIcon, Trash2, ArrowUp, ArrowDown, Edit2, Circle, Square } from "lucide-react";

const DEFAULT_DATA = {
  hero: {
    avatarText: "A.",
    subtitle: "Alper Oltulu",
    title: "Fikirleri Koda,<br/>Kodları Geleceğe.",
    description: "Modern web teknolojileri ve yenilikçi tasarımlarla sınırları zorluyorum.",
    elements: [] as CanvasElement[]
  },
  projects: []
};

export default function AdminPage() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [pages, setPages] = useState<{slug: string, title: string, content: string}[]>([]);
  
  const [editingPage, setEditingPage] = useState<{ slug: string, title: string, blocks: Block[] }>({ slug: "", title: "", blocks: [] });
  const [previewMode, setPreviewMode] = useState<'main' | 'dynamic'>('main');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [isHeroOpen, setIsHeroOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isDynamicOpen, setIsDynamicOpen] = useState(false);

  // Canvas Selection
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          // Ensure elements array exists for older DB records
          if (!res.data.hero.elements) res.data.hero.elements = [];
          setData(res.data);
        }
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
      if (res.ok) setMessage("✅ Başarıyla kaydedildi!");
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
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/pages?slug=${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter(p => p.slug !== slug));
      }
    } catch (e) {}
  };

  const loadPageForEdit = (page: {slug: string, title: string, content: string}) => {
    let blocks: Block[] = [];
    try {
      const parsed = JSON.parse(page.content);
      blocks = Array.isArray(parsed) ? parsed : [{ id: "legacy", type: "text", data: { text: page.content } }];
    } catch (e) {
      blocks = [{ id: "legacy", type: "text", data: { text: page.content } }];
    }
    setEditingPage({ slug: page.slug, title: page.title, blocks });
    setPreviewMode('dynamic');
    setIsDynamicOpen(true);
  };

  // Generic Update Helpers
  const handleHeroChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
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

  // DYNAMIC PAGE BUILDER LOGIC
  const addDynamicBlock = (type: BlockType) => {
    const newBlock: Block = { id: Math.random().toString(36).substr(2, 9), type, data: {} };
    if (type === 'button') newBlock.data = { label: "Buton", url: "#" };
    setEditingPage(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };
  const updateDynamicBlock = (id: string, field: string, value: any) => {
    setEditingPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b)
    }));
  };
  const removeDynamicBlock = (id: string) => setEditingPage(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  const moveDynamicBlock = (index: number, dir: 'up' | 'down') => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === editingPage.blocks.length - 1)) return;
    const newBlocks = [...editingPage.blocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setEditingPage(prev => ({ ...prev, blocks: newBlocks }));
  };

  // MAIN PAGE CANVAS BUILDER LOGIC
  const addCanvasElement = (type: CanvasElementType) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newElement: CanvasElement = { id, type, x: 50, y: 50, props: {} };
    if (type === 'button') newElement.props = { label: "Yeni Buton" };
    if (type === 'shape') newElement.props = { shapeType: 'circle', color: '#db2777' };
    
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, elements: [...(prev.hero.elements || []), newElement] }
    }));
    setSelectedCanvasId(id);
    setPreviewMode('main');
  };
  const updateCanvasElement = (id: string, updates: Partial<CanvasElement>) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        elements: prev.hero.elements.map(el => el.id === id ? { ...el, ...updates } : el)
      }
    }));
  };
  const updateCanvasElementProps = (id: string, propField: string, value: any) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        elements: prev.hero.elements.map(el => el.id === id ? { ...el, props: { ...el.props, [propField]: value } } : el)
      }
    }));
  };
  const removeCanvasElement = (id: string) => {
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, elements: prev.hero.elements.filter(el => el.id !== id) }
    }));
    setSelectedCanvasId(null);
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

  const selectedCanvasEl = data.hero.elements?.find(el => el.id === selectedCanvasId);

  return (
    <div className="flex w-full h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* SOL SÜTUN: CMS Veri Yönetimi */}
      <div className="w-[25%] min-w-[320px] max-w-[400px] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 shadow-xl z-20 flex flex-col gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 cursor-pointer pb-2 border-b border-slate-100 dark:border-slate-800">
          Alper CMS
        </h1>

        {/* Hero Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => { setIsHeroOpen(!isHeroOpen); setPreviewMode('main'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            <span>🎯 Karşılama Alanı (Metinler)</span>
            {isHeroOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
          {isHeroOpen && (
            <div className="p-3 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <div><label className="text-xs text-slate-500">Logo</label><input value={data.hero.avatarText} onChange={e => handleHeroChange("avatarText", e.target.value)} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800" /></div>
              <div><label className="text-xs text-slate-500">Üst Başlık</label><input value={data.hero.subtitle} onChange={e => handleHeroChange("subtitle", e.target.value)} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800" /></div>
              <div><label className="text-xs text-slate-500">Ana Başlık</label><textarea value={data.hero.title} onChange={e => handleHeroChange("title", e.target.value)} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-16 resize-none" /></div>
              <div><label className="text-xs text-slate-500">Açıklama</label><textarea value={data.hero.description} onChange={e => handleHeroChange("description", e.target.value)} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-20 resize-none" /></div>
            </div>
          )}
        </div>

        {/* Projects Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => { setIsProjectsOpen(!isProjectsOpen); setPreviewMode('main'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            <span>🚀 Projeler</span>
            {isProjectsOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
          {isProjectsOpen && (
            <div className="p-3 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={addProject} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold w-full">+ Yeni Proje</button>
              {data.projects.map((p, i) => (
                <div key={i} className="bg-white dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 relative space-y-2">
                  <button onClick={() => removeProject(i)} className="absolute top-2 right-2 text-xs text-red-500 font-bold">Sil</button>
                  <div><input value={p.title} onChange={e => updateProject(i, "title", e.target.value)} className="w-full p-1 text-xs border rounded" placeholder="Proje Adı" /></div>
                  <div><input value={p.desc} onChange={e => updateProject(i, "desc", e.target.value)} className="w-full p-1 text-xs border rounded" placeholder="Açıklama" /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Pages Setup */}
        <div className="bg-purple-50 dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/50 overflow-hidden">
          <button onClick={() => { setIsDynamicOpen(!isDynamicOpen); setPreviewMode(isDynamicOpen ? 'main' : 'dynamic'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30">
            <span>📄 Alt Sayfalar</span>
            {isDynamicOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
          {isDynamicOpen && (
            <div className="p-3 space-y-3 border-t border-purple-200 dark:border-purple-900/50">
              {pages.map(p => (
                <div key={p.slug} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-950 rounded border border-purple-100">
                  <span className="font-bold truncate">{p.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => loadPageForEdit(p)} className="px-2 py-1 bg-purple-100 text-purple-600 rounded">Düzenle</button>
                    <button onClick={() => handleDeletePage(p.slug)} className="px-2 py-1 bg-red-100 text-red-600 rounded">Sil</button>
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-purple-200 dark:border-purple-900/50 space-y-2">
                <span className="text-xs font-bold text-purple-600">Yeni Sayfa Oluştur</span>
                <input value={editingPage.slug} onChange={e => { setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")}); setPreviewMode('dynamic'); }} placeholder="Link (ornek-sayfa)" className="w-full p-2 text-xs rounded border border-purple-200" />
                <input value={editingPage.title} onChange={e => { setEditingPage({...editingPage, title: e.target.value}); setPreviewMode('dynamic'); }} placeholder="Sayfa Başlığı" className="w-full p-2 text-xs rounded border border-purple-200" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORTA SÜTUN: Canlı Tuval (Live Canvas) */}
      <div className="flex-1 h-full relative overflow-y-auto bg-slate-50 dark:bg-slate-950 pattern-grid">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-xs text-white font-mono uppercase z-50 shadow-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {previewMode === 'main' ? 'Ana Sayfa (Sürükle-Bırak Tuvali)' : 'Alt Sayfa (Dinamik) Tasarımı'}
        </div>

        <div className="w-full min-h-full">
          {previewMode === 'main' ? (
            <>
              <HeroSection 
                avatarText={data.hero.avatarText}
                subtitle={data.hero.subtitle}
                title={data.hero.title}
                description={data.hero.description}
                elements={data.hero.elements}
                isEditMode={true}
                selectedId={selectedCanvasId}
                onSelect={setSelectedCanvasId}
                onUpdateElement={updateCanvasElement}
              />
              <ProjectsSection projects={data.projects} />
            </>
          ) : (
            <div className="py-20 px-8 max-w-4xl mx-auto min-h-screen">
              <h1 className="text-4xl font-black mb-10 text-purple-600">{editingPage.title || "Yeni Sayfa"}</h1>
              <BlockRenderer blocks={editingPage.blocks} />
            </div>
          )}
        </div>
      </div>

      {/* SAĞ SÜTUN: Paint (Araçlar) Menüsü */}
      <div className="w-[20%] min-w-[280px] h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-30 flex flex-col">
        <button 
          onClick={previewMode === 'main' ? handleSave : handleSavePage}
          disabled={isSaving}
          className="w-full mb-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg"
        >
          {isSaving ? "Kaydediliyor..." : (previewMode === 'main' ? "Ana Sayfayı YAYINLA" : "Alt Sayfayı YAYINLA")}
        </button>

        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
          {previewMode === 'main' ? 'Serbest Araçlar (Paint)' : 'Sayfa Araçları (Blok)'}
        </h3>
        
        {/* Araç Kutusu (Toolbar) */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button onClick={() => previewMode === 'main' ? addCanvasElement('button') : addDynamicBlock('button')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"><LinkIcon className="w-5 h-5"/><span className="text-xs">Buton</span></button>
          {previewMode === 'main' ? (
            <button onClick={() => addCanvasElement('shape')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-pink-500 hover:text-pink-500 transition"><Circle className="w-5 h-5"/><span className="text-xs">Şekil</span></button>
          ) : (
            <button onClick={() => addDynamicBlock('text')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-purple-500 hover:text-purple-500 transition"><Type className="w-5 h-5"/><span className="text-xs">Metin</span></button>
          )}
          <button onClick={() => previewMode === 'main' ? addCanvasElement('image') : addDynamicBlock('image')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"><ImageIcon className="w-5 h-5"/><span className="text-xs">Resim</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('social') : addDynamicBlock('social')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"><Share2 className="w-5 h-5"/><span className="text-xs">Sosyal</span></button>
        </div>

        {/* Özellikler Paneli (Properties) */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Özellikler</h3>
          
          {previewMode === 'main' ? (
            // Canvas Element Properties
            selectedCanvasEl ? (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <span className="font-bold text-sm uppercase">{selectedCanvasEl.type}</span>
                  <button onClick={() => removeCanvasElement(selectedCanvasEl.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
                
                {/* Genislik / Yukseklik */}
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-slate-500">Genişlik (px)</label><input type="number" value={selectedCanvasEl.w || ""} onChange={e => updateCanvasElement(selectedCanvasEl.id, { w: Number(e.target.value) })} className="w-full p-1.5 text-xs rounded border" placeholder="Oto"/></div>
                  <div><label className="text-[10px] text-slate-500">Yükseklik (px)</label><input type="number" value={selectedCanvasEl.h || ""} onChange={e => updateCanvasElement(selectedCanvasEl.id, { h: Number(e.target.value) })} className="w-full p-1.5 text-xs rounded border" placeholder="Oto"/></div>
                </div>

                {/* Specific Props */}
                {selectedCanvasEl.type === 'button' && (
                  <>
                    <div><label className="text-xs text-slate-500">Yazı</label><input value={selectedCanvasEl.props.label || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "label", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-xs text-slate-500">Link</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-xs text-slate-500">Renk Gradiyent</label><input value={selectedCanvasEl.props.color || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full p-1.5 text-xs rounded border" placeholder="linear-gradient(...)" /></div>
                  </>
                )}

                {selectedCanvasEl.type === 'shape' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500">Şekil Türü</label>
                      <select value={selectedCanvasEl.props.shapeType || 'circle'} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "shapeType", e.target.value)} className="w-full p-1.5 text-xs rounded border">
                        <option value="circle">Yuvarlak</option>
                        <option value="square">Kare / Dikdörtgen</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-slate-500">Arkaplan Rengi</label><input value={selectedCanvasEl.props.color || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                  </>
                )}

                {selectedCanvasEl.type === 'image' && (
                  <>
                    <div><label className="text-xs text-slate-500">Resim Linki</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedCanvasEl.props.rounded || false} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "rounded", e.target.checked)} /> Yuvarlak (Avatar)</label>
                  </>
                )}

                {selectedCanvasEl.type === 'social' && (
                  <div className="space-y-2">
                    <div><label className="text-[10px] text-slate-500">Twitter (X)</label><input value={selectedCanvasEl.props.twitter || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "twitter", e.target.value)} className="w-full p-1 text-xs border rounded" /></div>
                    <div><label className="text-[10px] text-slate-500">LinkedIn</label><input value={selectedCanvasEl.props.linkedin || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "linkedin", e.target.value)} className="w-full p-1 text-xs border rounded" /></div>
                    <div><label className="text-[10px] text-slate-500">Instagram</label><input value={selectedCanvasEl.props.instagram || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "instagram", e.target.value)} className="w-full p-1 text-xs border rounded" /></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center mt-10">Ortadaki tuvalden bir araca tıkla veya yukarıdan yeni ekle.</div>
            )
          ) : (
            // Dynamic Page Properties
            <div className="text-xs text-slate-400 text-center mt-10">
              Alt sayfa düzenliyorsunuz. Ortadaki ekranda eklediğiniz blokları form üzerinden yönetebilirsiniz.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
