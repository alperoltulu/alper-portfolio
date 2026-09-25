"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/builder/HeroSection";
import ProjectsSection from "@/components/builder/ProjectsSection";
import BlockRenderer, { Block, BlockType } from "@/components/builder/BlockRenderer";
import { CanvasElement, CanvasElementType } from "@/types/canvas";
import { ChevronDown, ChevronRight, Type, Image as ImageIcon, Link as LinkIcon, Share2, FileText, Video as VideoIcon, Trash2, ArrowUp, ArrowDown, Edit2, Circle, Minus, UploadCloud, Copy } from "lucide-react";

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

  // File Manager State
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{key: string, size: number}[]>([]);

  // Canvas Selection
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);

  const fetchMedia = () => {
    fetch("/api/files")
      .then(res => res.json())
      .then(res => {
        if (res.files) setMediaFiles(res.files);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(res => {
        if (res.data) {
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

    fetchMedia();
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
  const handleHeroChange = (field: string, value: any) => setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...data.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setData(prev => ({ ...prev, projects: newProjects }));
  };
  const addProject = () => setData(prev => ({ ...prev, projects: [...prev.projects, { title: "Yeni Proje", desc: "Açıklama...", demo: "", apk: "", color: "from-gray-500 to-gray-700" }] }));
  const removeProject = (index: number) => {
    const newProjects = [...data.projects];
    newProjects.splice(index, 1);
    setData(prev => ({ ...prev, projects: newProjects }));
  };

  // DYNAMIC PAGE BUILDER LOGIC
  const addDynamicBlock = (type: BlockType) => {
    const newBlock: Block = { id: Math.random().toString(36).substr(2, 9), type, data: {} };
    if (type === 'button') newBlock.data = { label: "Buton", url: "#" };
    if (type === 'social') newBlock.data = { links: [] };
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
    if (type === 'line') newElement.props = { color: '#cbd5e1' };
    if (type === 'social') newElement.props = { links: [] };
    
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, elements: [...(prev.hero.elements || []), newElement] }
    }));
    setSelectedCanvasId(id);
    setPreviewMode('main');
  };
  const updateCanvasElement = (id: string, updates: Partial<CanvasElement>) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.map(el => el.id === id ? { ...el, ...updates } : el) } }));
  };
  const updateCanvasElementProps = (id: string, propField: string, value: any) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.map(el => el.id === id ? { ...el, props: { ...el.props, [propField]: value } } : el) } }));
  };
  const removeCanvasElement = (id: string) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.filter(el => el.id !== id) } }));
    setSelectedCanvasId(null);
  };

  // File Upload Logic (Cloudflare R2)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const r = await res.json();
      if (r.url) {
        fetchMedia(); // Refresh list
      } else {
        alert("Yükleme hatası: " + (r.error || "Bilinmeyen hata"));
      }
    } catch(err) {
      alert("Sunucuya bağlanılamadı.");
    }
    setUploading(false);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Kopyalandı: " + url);
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;
  const selectedCanvasEl = data.hero.elements?.find(el => el.id === selectedCanvasId);

  return (
    <div className="flex w-full h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* SOL SÜTUN: CMS Veri Yönetimi */}
      <div className="w-[25%] min-w-[320px] max-w-[400px] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 shadow-xl z-20 flex flex-col gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 cursor-pointer pb-2 border-b border-slate-100 dark:border-slate-800" onClick={() => setPreviewMode('main')}>
          Alper CMS
        </h1>

        {/* Hero Form */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => { setIsHeroOpen(!isHeroOpen); setPreviewMode('main'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            <span>🎯 Karşılama Alanı</span>
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

        {/* Dynamic Pages */}
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
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-purple-200 dark:border-purple-900/50 space-y-2">
                <input value={editingPage.slug} onChange={e => { setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")}); setPreviewMode('dynamic'); }} placeholder="Link (ornek-sayfa)" className="w-full p-2 text-xs rounded border border-purple-200" />
                <input value={editingPage.title} onChange={e => { setEditingPage({...editingPage, title: e.target.value}); setPreviewMode('dynamic'); }} placeholder="Sayfa Başlığı" className="w-full p-2 text-xs rounded border border-purple-200" />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Page Blocks Properties (Only show if editing dynamic) */}
        {previewMode === 'dynamic' && editingPage.slug && (
          <div className="space-y-4 pb-10">
            <h3 className="font-bold text-purple-600 border-b border-purple-200 pb-2">Sayfa Blokları Ayarları</h3>
            {editingPage.blocks.map((block, index) => (
              <div key={block.id} className="relative bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => moveDynamicBlock(index, 'up')} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-blue-500 shadow-sm"><ArrowUp className="w-3 h-3"/></button>
                  <button onClick={() => moveDynamicBlock(index, 'down')} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-blue-500 shadow-sm"><ArrowDown className="w-3 h-3"/></button>
                  <button onClick={() => removeDynamicBlock(block.id)} className="p-1 bg-white dark:bg-slate-800 rounded hover:text-red-500 shadow-sm ml-2"><Trash2 className="w-3 h-3"/></button>
                </div>
                <div className="mb-2 text-xs font-bold text-slate-400 uppercase">{block.type} Bloğu</div>

                {block.type === 'text' && (
                  <textarea value={block.data.text || ""} onChange={e => updateDynamicBlock(block.id, "text", e.target.value)} className="w-full bg-white dark:bg-slate-950 border rounded px-2 py-1 text-xs h-24" />
                )}
                {block.type === 'image' && (
                  <div><input value={block.data.url || ""} onChange={e => updateDynamicBlock(block.id, "url", e.target.value)} placeholder="URL" className="w-full bg-white border rounded px-2 py-1 text-xs" /></div>
                )}
                {block.type === 'line' && (
                  <div><input type="color" value={block.data.color || "#cbd5e1"} onChange={e => updateDynamicBlock(block.id, "color", e.target.value)} className="w-full bg-white border rounded p-0 h-6" /></div>
                )}
                {block.type === 'social' && (
                  <div className="space-y-2">
                    <button onClick={() => updateDynamicBlock(block.id, "links", [...(block.data.links||[]), {url:"", logoUrl:""}])} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded w-full">+ İkon Ekle</button>
                    {(block.data.links||[]).map((l:any, i:number) => (
                      <div key={i} className="flex flex-col gap-1 bg-white p-2 border rounded relative">
                        <button onClick={() => { const cl=[...block.data.links]; cl.splice(i,1); updateDynamicBlock(block.id,"links",cl); }} className="absolute top-1 right-1 text-red-500"><Trash2 className="w-3 h-3"/></button>
                        <input value={l.url} onChange={e => { const cl=[...block.data.links]; cl[i].url=e.target.value; updateDynamicBlock(block.id,"links",cl); }} placeholder="Bağlantı URL" className="text-xs border rounded p-1 w-[90%]" />
                        <input value={l.logoUrl} onChange={e => { const cl=[...block.data.links]; cl[i].logoUrl=e.target.value; updateDynamicBlock(block.id,"links",cl); }} placeholder="Logo URL (Örn: /cdn/logo.png)" className="text-xs border rounded p-1 w-[90%]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ORTA SÜTUN: Canlı Tuval */}
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

      {/* SAĞ SÜTUN: Araçlar ve Dosya Yöneticisi */}
      <div className="w-[25%] min-w-[320px] h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-30 flex flex-col overflow-y-auto">
        <button 
          onClick={previewMode === 'main' ? handleSave : handleSavePage}
          disabled={isSaving}
          className="w-full mb-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg"
        >
          {isSaving ? "Kaydediliyor..." : (previewMode === 'main' ? "Ana Sayfayı YAYINLA" : "Alt Sayfayı YAYINLA")}
        </button>

        {/* Dosya Yöneticisi (R2) Galerisi */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4 text-blue-500" /> Medya Deposu (R2)</span>
            <label className={`px-3 py-1 bg-blue-100 text-blue-600 rounded cursor-pointer hover:bg-blue-200 transition text-[10px] font-bold ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? 'Yükleniyor' : '+ Yükle'}
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </h3>
          
          <div className="grid grid-cols-3 gap-2 mt-4 max-h-48 overflow-y-auto pr-1">
            {mediaFiles.map(file => {
              const ext = file.key.split('.').pop()?.toUpperCase() || '?';
              const isImage = ['JPG','JPEG','PNG','GIF','WEBP','SVG'].includes(ext);
              const url = `/cdn/${file.key}`;
              return (
                <div key={file.key} onClick={() => copyToClipboard(window.location.origin + url)} className="relative group rounded overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square flex items-center justify-center bg-white dark:bg-slate-950 cursor-pointer shadow-sm">
                  {isImage ? (
                    <img src={url} alt={file.key} className="w-full h-full object-cover" />
                  ) : (
                    <div className="font-bold text-slate-400 text-xs">{ext}</div>
                  )}
                  <div className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Copy className="w-5 h-5 text-white" />
                  </div>
                  {/* Etiket - Dosya Adi */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5 opacity-0 group-hover:opacity-100">
                    {file.key}
                  </div>
                </div>
              )
            })}
            {mediaFiles.length === 0 && (
              <div className="col-span-3 text-xs text-center text-slate-400 py-4">
                Henüz yüklenmiş dosya yok.
              </div>
            )}
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
          {previewMode === 'main' ? 'Serbest Araçlar (Paint)' : 'Sayfa Araçları (Blok)'}
        </h3>
        
        {/* Toolbar */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button onClick={() => previewMode === 'main' ? addCanvasElement('text') : addDynamicBlock('text')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-purple-500 hover:text-purple-500 transition"><Type className="w-4 h-4"/><span className="text-[10px] font-bold">Metin</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('button') : addDynamicBlock('button')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"><LinkIcon className="w-4 h-4"/><span className="text-[10px] font-bold">Buton</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('image') : addDynamicBlock('image')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-500 hover:text-green-500 transition"><ImageIcon className="w-4 h-4"/><span className="text-[10px] font-bold">Resim</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('social') : addDynamicBlock('social')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-orange-500 hover:text-orange-500 transition"><Share2 className="w-4 h-4"/><span className="text-[10px] font-bold">Sosyal</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('line') : addDynamicBlock('line')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-500 hover:text-slate-500 transition"><Minus className="w-4 h-4"/><span className="text-[10px] font-bold">Çizgi</span></button>
          {previewMode === 'main' && (
            <button onClick={() => addCanvasElement('shape')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-pink-500 hover:text-pink-500 transition"><Circle className="w-4 h-4"/><span className="text-[10px] font-bold">Şekil</span></button>
          )}
        </div>

        {/* Canvas Element Properties */}
        {previewMode === 'main' && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Seçili Obje Özellikleri</h3>
            {selectedCanvasEl ? (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <span className="font-bold text-sm uppercase">{selectedCanvasEl.type}</span>
                  <button onClick={() => removeCanvasElement(selectedCanvasEl.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
                
                {/* Size Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-slate-500">Genişlik (px)</label><input type="number" value={selectedCanvasEl.w || ""} onChange={e => updateCanvasElement(selectedCanvasEl.id, { w: Number(e.target.value) })} className="w-full p-1.5 text-xs rounded border" placeholder="Oto"/></div>
                  <div><label className="text-[10px] text-slate-500">Yükseklik (px)</label><input type="number" value={selectedCanvasEl.h || ""} onChange={e => updateCanvasElement(selectedCanvasEl.id, { h: Number(e.target.value) })} className="w-full p-1.5 text-xs rounded border" placeholder="Oto"/></div>
                </div>

                {selectedCanvasEl.type === 'text' && (
                  <>
                    <div><label className="text-xs text-slate-500">Yazı</label><textarea value={selectedCanvasEl.props.text || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "text", e.target.value)} className="w-full p-1.5 text-xs rounded border h-20" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[10px] text-slate-500">Punto</label><input type="number" value={selectedCanvasEl.props.fontSize || 16} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "fontSize", e.target.value)} className="w-full p-1 text-xs border rounded" /></div>
                      <div><label className="text-[10px] text-slate-500">Renk</label><input type="color" value={selectedCanvasEl.props.color || "#000000"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full h-6 border rounded p-0" /></div>
                    </div>
                  </>
                )}

                {selectedCanvasEl.type === 'button' && (
                  <>
                    <div><label className="text-xs text-slate-500">Yazı</label><input value={selectedCanvasEl.props.label || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "label", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-xs text-slate-500">Link</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-[10px] text-slate-500">Arkaplan Rengi (Hex veya Gradient)</label><input value={selectedCanvasEl.props.color || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                  </>
                )}

                {selectedCanvasEl.type === 'shape' && (
                  <>
                    <div>
                      <select value={selectedCanvasEl.props.shapeType || 'circle'} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "shapeType", e.target.value)} className="w-full p-1.5 text-xs rounded border">
                        <option value="circle">Yuvarlak</option>
                        <option value="square">Kare / Dikdörtgen</option>
                      </select>
                    </div>
                    <div><label className="text-[10px] text-slate-500">Renk</label><input type="color" value={selectedCanvasEl.props.color || "#db2777"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full h-8 border rounded p-0" /></div>
                  </>
                )}
                
                {selectedCanvasEl.type === 'line' && (
                  <div><label className="text-[10px] text-slate-500">Çizgi Rengi</label><input type="color" value={selectedCanvasEl.props.color || "#cbd5e1"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full h-8 border rounded p-0" /></div>
                )}

                {selectedCanvasEl.type === 'image' && (
                  <>
                    <div><label className="text-xs text-slate-500">Resim Linki (veya R2 URL)</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedCanvasEl.props.rounded || false} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "rounded", e.target.checked)} /> Yuvarlak Yap</label>
                  </>
                )}

                {selectedCanvasEl.type === 'social' && (
                  <div className="space-y-2">
                    <button onClick={() => updateCanvasElementProps(selectedCanvasEl.id, "links", [...(selectedCanvasEl.props.links||[]), {url:"", logoUrl:""}])} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded w-full">+ İkon Ekle</button>
                    {(selectedCanvasEl.props.links||[]).map((l:any, i:number) => (
                      <div key={i} className="flex flex-col gap-1 bg-white p-2 border rounded relative">
                        <button onClick={() => { const cl=[...selectedCanvasEl.props.links]; cl.splice(i,1); updateCanvasElementProps(selectedCanvasEl.id,"links",cl); }} className="absolute top-1 right-1 text-red-500"><Trash2 className="w-3 h-3"/></button>
                        <input value={l.url} onChange={e => { const cl=[...selectedCanvasEl.props.links]; cl[i].url=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"links",cl); }} placeholder="Bağlantı URL" className="text-[10px] border rounded p-1 w-[90%]" />
                        <input value={l.logoUrl} onChange={e => { const cl=[...selectedCanvasEl.props.links]; cl[i].logoUrl=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"links",cl); }} placeholder="Özel Logo URL (İsteğe bağlı)" className="text-[10px] border rounded p-1 w-[90%]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center mt-10">Tuvalden bir şekle tıklayın veya araç ekleyin.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
