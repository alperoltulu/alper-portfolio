"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/builder/HeroSection";
import CanvasEngine from "@/components/builder/CanvasEngine";
import HeroStatic from "@/components/builder/HeroStatic";
import BlockRenderer, { Block, BlockType } from "@/components/builder/BlockRenderer";
import { CanvasElement, CanvasElementType } from "@/types/canvas";
import { ChevronDown, ChevronRight, Type, Image as ImageIcon, Link as LinkIcon, Share2, FileText, Video as VideoIcon, Trash2, ArrowUp, ArrowDown, Edit2, Circle, Minus, UploadCloud, Copy, X, Info, FileCode } from "lucide-react";

const DEFAULT_DATA = {
  navbar: {
    enabled: true,
    links: [] as { id: string, label: string, url: string }[]
  },
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

  const [isHeroOpen, setIsHeroOpen] = useState(true);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isDynamicOpen, setIsDynamicOpen] = useState(false);

  // File Manager State
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{key: string, size: number}[]>([]);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  // Draft System State
  const [drafts, setDrafts] = useState<string[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string>('main');
  const [draftNameInput, setDraftNameInput] = useState("");

  // Custom UI Dialogs
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);

  // Canvas Selection & Clipboard
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<CanvasElement[] | null>(null);

  const showToast = (message: string, type: 'success'|'error'|'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMedia = () => {
    fetch("/api/files")
      .then(res => res.json())
      .then(res => {
        if (res.files) setMediaFiles(res.files);
      })
      .catch(console.error);
  };

  const loadContent = (id: string = 'main') => {
    setIsLoading(true);
    fetch(`/api/content?id=${id}`)
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
          
          // Migrate old projects array to individual project elements
          if (res.data.projects && res.data.projects.length > 0) {
            res.data.projects.forEach((proj: any, i: number) => {
              res.data.hero.elements.push({
                id: 'proj-' + Math.random().toString(36).substr(2, 9),
                type: 'project',
                x: 25 + (i % 2) * 50, // Stagger them
                y: 60 + i * 10,
                w: 400,
                props: proj
              });
            });
            res.data.projects = []; // Clear old projects array
          }

          // Remove the old 'projects' (plural) block if it exists
          res.data.hero.elements = res.data.hero.elements.filter((e: any) => e.type !== 'projects');
          // Also remove any old 'hero' (single block) if it still lingers
          res.data.hero.elements = res.data.hero.elements.filter((e: any) => e.type !== 'hero');

          if (!res.data.navbar) res.data.navbar = { enabled: true, links: [] };

          setData(res.data);
          setCurrentDraftId(id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const fetchDrafts = () => {
    fetch("/api/drafts")
      .then(res => res.json())
      .then(res => {
        if (res.drafts) setDrafts(res.drafts);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadContent('main');
    fetchDrafts();

    fetch("/api/pages")
      .then(res => res.json())
      .then(res => {
        if (res.data) setPages(res.data);
      })
      .catch(console.error);

    fetchMedia();
  }, []);

  // Kısayol Tuşları (Kopyala, Yapıştır, Sil)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C') {
          if (previewMode === 'main' && selectedCanvasIds.length > 0) {
            const els = data.hero.elements.filter(el => selectedCanvasIds.includes(el.id));
            if (els.length > 0) {
              setClipboard(JSON.parse(JSON.stringify(els)));
              showToast(`${els.length} obje kopyalandı (Ctrl+C)`, "info");
            }
          }
        }
        if (e.key === 'v' || e.key === 'V') {
          if (previewMode === 'main' && clipboard && clipboard.length > 0) {
            const pastedElements = clipboard.map(clip => ({
              ...clip,
              id: Math.random().toString(36).substr(2, 9),
              x: Math.min(95, clip.x + 3),
              y: Math.min(95, clip.y + 3)
            }));
            setData(prev => ({
              ...prev,
              hero: { ...prev.hero, elements: [...(prev.hero.elements || []), ...pastedElements] }
            }));
            setSelectedCanvasIds(pastedElements.map(p => p.id));
            showToast(`${pastedElements.length} obje yapıştırıldı (Ctrl+V)`, "success");
          }
        }
      } else {
        if (e.key === 'Delete') {
          if (previewMode === 'main' && selectedCanvasIds.length > 0) {
            setData(prev => ({ 
              ...prev, 
              hero: { ...prev.hero, elements: prev.hero.elements.filter(el => !selectedCanvasIds.includes(el.id)) } 
            }));
            setSelectedCanvasIds([]);
            showToast(`${selectedCanvasIds.length} obje silindi (Del)`, "info");
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMode, selectedCanvasIds, clipboard, data.hero.elements]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 'main', data })
      });
      if (res.ok) {
        showToast("Ana sayfa canlıya alındı!", "success");
        setCurrentDraftId('main');
        fetchDrafts();
      }
      else showToast("Kaydetme başarısız.", "error");
    } catch (e) {
      showToast("Bir hata oluştu.", "error");
    }
    setIsSaving(false);
  };

  const handleSaveDraft = async (draftId: string) => {
    if (!draftId.trim()) {
      showToast("Taslak adı boş olamaz", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draftId, data })
      });
      if (res.ok) {
        showToast(`'${draftId}' taslağı kaydedildi!`, "success");
        setCurrentDraftId(draftId);
        fetchDrafts();
        setDraftNameInput("");
      }
      else showToast("Taslak kaydetme başarısız.", "error");
    } catch (e) {
      showToast("Bir hata oluştu.", "error");
    }
    setIsSaving(false);
  };

  const handleSavePage = async () => {
    if (!editingPage.slug || !editingPage.title) {
      showToast("Link ve Başlık zorunludur!", "error");
      return;
    }
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
        showToast("Sayfa başarıyla yayınlandı!", "success");
        setPages([...pages.filter(p => p.slug !== payload.slug), payload]);
        setEditingPage({ slug: "", title: "", blocks: [] });
        setPreviewMode('main');
      }
    } catch (e) {
      showToast("Hata oluştu.", "error");
    }
  };

  const handleDeletePage = async (slug: string) => {
    setConfirmDialog({
      message: `"${slug}" sayfasını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/pages?slug=${slug}`, { method: "DELETE" });
          if (res.ok) {
            setPages(pages.filter(p => p.slug !== slug));
            showToast("Sayfa silindi.", "success");
          }
        } catch (e) {
          showToast("Silinemedi.", "error");
        }
      }
    });
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


  // DYNAMIC PAGE BUILDER LOGIC
  const addDynamicBlock = (type: BlockType) => {
    const newBlock: Block = { id: Math.random().toString(36).substr(2, 9), type, data: {} };
    if (type === 'button') newBlock.data = { label: "Buton", url: "#" };
    if (type === 'social') newBlock.data = { links: [] };
    if (type === 'icon') newBlock.data = { icons: [{ id: Math.random().toString(36).substr(2, 9), iconName: 'Github', color: '#ffffff', bgColor: '#1e293b', url: '', rounded: true }] };
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

  // PROJECT LOGIC
  const addProject = (template: string = "1") => setData(prev => ({ 
    ...prev, 
    hero: { 
      ...prev.hero, 
      elements: [
        { id: 'proj-'+Math.random().toString(36).substr(2, 9), type: 'project' as CanvasElementType, x: 50, y: 5, w: 400, props: { title: "Yeni Proje", description: "", image: "", url: "", template } }, 
        ...(prev.hero.elements || [])
      ] 
    } 
  }));
  const updateProject = (id: string, key: string, value: any) => setData(prev => ({ 
    ...prev, 
    hero: { 
      ...prev.hero, 
      elements: prev.hero.elements.map((el: any) => el.id === id ? { ...el, props: { ...el.props, [key]: value } } : el) 
    } 
  }));
  const removeProject = (id: string) => setData(prev => ({ 
    ...prev, 
    hero: { ...prev.hero, elements: prev.hero.elements.filter((el: any) => el.id !== id) } 
  }));

  // MAIN PAGE CANVAS BUILDER LOGIC
  const addCanvasElement = (type: CanvasElementType) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newElement: CanvasElement = { id, type, x: 50, y: 5, props: {} };
    if (type === 'text') newElement.props = { text: "Yeni Metin", textType: 'normal', color: '#000000', fontSize: '16' };
    if (type === 'logo') newElement.props = { text: "A.", isLogo: true };
    if (type === 'button') newElement.props = { label: "Yeni Buton" };
    if (type === 'shape') newElement.props = { shapeType: 'circle', color: '#db2777' };
    if (type === 'line') newElement.props = { color: '#cbd5e1' };
    if (type === 'social') newElement.props = { links: [] };
    if (type === 'icon') newElement.props = { icons: [{ id: Math.random().toString(36).substr(2, 9), iconName: 'Github', color: '#ffffff', bgColor: '#1e293b', url: '', rounded: true }] };
    
    setData(prev => ({
      ...prev,
      hero: { ...prev.hero, elements: [...(prev.hero.elements || []), newElement] }
    }));
    setSelectedCanvasIds([id]);
    setPreviewMode('main');
  };
  const updateCanvasElement = (id: string, updates: Partial<CanvasElement>) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.map(el => el.id === id ? { ...el, ...updates } : el) } }));
  };
  const updateCanvasElementProps = (id: string, propField: string, value: any) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.map(el => el.id === id ? { ...el, props: { ...el.props, [propField]: value } } : el) } }));
  };
  const updateMultiCanvasElementProps = (ids: string[], propField: string, value: any) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.map(el => ids.includes(el.id) ? { ...el, props: { ...el.props, [propField]: value } } : el) } }));
  };
  const removeCanvasElement = (id: string) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, elements: prev.hero.elements.filter(el => el.id !== id) } }));
    setSelectedCanvasIds(prev => prev.filter(pId => pId !== id));
  };

  // HTML Smart Import Logic
  const handleHtmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const elementsInOrder = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a');
      const newElements: CanvasElement[] = [];
      let currentY = 10;

      elementsInOrder.forEach((node) => {
        if (newElements.length > 50) return; // Limit to 50 items so canvas doesn't crash

        const tag = node.tagName.toLowerCase();
        
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
          const text = (node.textContent || '').trim();
          if (text) {
            newElements.push({
              id: 'html-' + Math.random().toString(36).substring(2),
              type: 'text',
              x: 50,
              y: currentY,
              w: tag === 'h1' ? 800 : 600,
              props: { text, textType: tag === 'h1' ? 'title' : 'subtitle', fontSize: tag === 'h1' ? 48 : 24 }
            });
            currentY += 8;
          }
        } else if (tag === 'p') {
          const text = (node.textContent || '').trim();
          if (text.length > 5) {
            newElements.push({
              id: 'html-' + Math.random().toString(36).substring(2),
              type: 'text',
              x: 50,
              y: currentY,
              w: 700,
              props: { text, textType: 'description', fontSize: 16 }
            });
            currentY += 8;
          }
        } else if (tag === 'img') {
          const src = node.getAttribute('src');
          if (src && !src.startsWith('data:image')) {
            newElements.push({
              id: 'html-' + Math.random().toString(36).substring(2),
              type: 'image',
              x: 50,
              y: currentY,
              w: 300,
              h: 200,
              props: { url: src, rounded: true }
            });
            currentY += 25;
          }
        } else if (tag === 'a') {
          const href = node.getAttribute('href');
          const text = (node.textContent || '').trim();
          // Skip links with images inside to avoid duplicates
          if (node.querySelector('img')) return; 

          if (href && text && text.length < 50 && !href.startsWith('#')) {
            newElements.push({
              id: 'html-' + Math.random().toString(36).substring(2),
              type: 'button',
              x: 50,
              y: currentY,
              w: 200,
              h: 50,
              props: { label: text, url: href }
            });
            currentY += 10;
          }
        }
      });

      if (newElements.length > 0) {
        setData((prev: any) => ({
          ...prev,
          hero: { ...prev.hero, elements: [...(prev.hero.elements || []), ...newElements] }
        }));
        setSelectedCanvasIds(newElements.map(e => e.id));
        showToast(`${newElements.length} öğe başarıyla içe aktarıldı! (Dikey sırayla dizildi)`, 'success');
      } else {
        showToast(`HTML içinde aktarılacak metin veya resim bulunamadı.`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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
        showToast("Dosya başarıyla yüklendi!", "success");
      } else {
        showToast("Yükleme hatası: " + (r.error || "Bilinmeyen hata"), "error");
      }
    } catch(err) {
      showToast("Sunucuya bağlanılamadı.", "error");
    }
    setUploading(false);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL Başarıyla Kopyalandı!", "success");
  };

  const handleDeleteFile = (key: string) => {
    setConfirmDialog({
      message: `"${key}" dosyasını kalıcı olarak silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/files?key=${encodeURIComponent(key)}`, { method: "DELETE" });
          if (res.ok) {
            setMediaFiles(prev => prev.filter(f => f.key !== key));
            showToast("Dosya kalıcı olarak silindi.", "success");
          } else {
            showToast("Silinirken bir hata oluştu.", "error");
          }
        } catch(e) {
          showToast("Sunucuya ulaşılamadı.", "error");
        }
      }
    });
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;


  return (
    <div className="flex w-full h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans relative">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl font-bold text-white z-[300] transition-all animate-bounce ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
          {toast.message}
        </div>
      )}

      {/* GLOBAL CONFIRM DIALOG */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Emin misiniz?</h3>
              <p className="text-sm text-slate-500 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">İptal</button>
                <button onClick={confirmDialog.onConfirm} className="px-4 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-500/30">Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDYA YÖNETİCİSİ POPUP (MODAL) */}
      {isFileManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <UploadCloud className="text-blue-500 w-6 h-6" /> Medya Deposu (R2)
              </h2>
              <div className="flex items-center gap-4">
                <label className={`px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm font-bold shadow-md ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? 'Yükleniyor...' : '+ Yeni Yükle'}
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={() => setIsFileManagerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-red-100 hover:text-red-600 transition font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaFiles.map(file => {
                  const ext = file.key.split('.').pop()?.toUpperCase() || '?';
                  const isImage = ['JPG','JPEG','PNG','GIF','WEBP','SVG'].includes(ext);
                  const url = `/cdn/${file.key}`;
                  return (
                    <div key={file.key} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col">
                      
                      {/* Tıklanabilir Üst Alan (Kopyalama için) */}
                      <div 
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', window.location.origin + url);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        className="relative aspect-square flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-2 cursor-grab active:cursor-grabbing" 
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(window.location.origin + url); }}
                      >
                        {isImage ? (
                          <img src={url} alt={file.key} className="w-full h-full object-cover rounded-lg shadow-inner pointer-events-none" />
                        ) : (
                          <div className="font-black text-slate-300 dark:text-slate-700 text-4xl pointer-events-none">{ext}</div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition gap-2">
                          <Copy className="w-8 h-8 text-white pointer-events-none" />
                          <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full pointer-events-none">URL Kopyala</span>
                        </div>
                      </div>

                      {/* Alt Bilgi ve Silme Butonu */}
                      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate w-[75%]" title={file.key}>{file.key}</div>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteFile(file.key); }} 
                          className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition border border-transparent hover:border-red-600" 
                          title="Dosyayı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
              {mediaFiles.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-bold text-xl flex flex-col items-center gap-4">
                  <UploadCloud className="w-16 h-16 opacity-20" />
                  Henüz yüklenmiş medya yok.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SOL SÜTUN: CMS Veri Yönetimi */}
      <div className="w-[15%] min-w-[280px] max-w-[300px] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 shadow-xl z-20 flex flex-col gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 cursor-pointer pb-2 border-b border-slate-100 dark:border-slate-800" onClick={() => setPreviewMode('main')}>
          Alper CMS
        </h1>



        {/* Üst Menü */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => { setIsNavbarOpen(!isNavbarOpen); setPreviewMode('main'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            <span>🧭 Üst Menü</span>
            {isNavbarOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
          {isNavbarOpen && (
            <div className="p-3 space-y-3 border-t border-slate-200 dark:border-slate-800 flex flex-col">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer mb-2">
                <input type="checkbox" checked={data.navbar?.enabled ?? true} onChange={(e) => setData(prev => ({ ...prev, navbar: { ...(prev.navbar || { links: [] }), enabled: e.target.checked } }))} />
                Menüyü Göster
              </label>
              
              <div className="space-y-2">
                {(data.navbar?.links || []).map((link, idx) => (
                  <div key={link.id} className="bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-1 relative">
                    <button onClick={() => {
                      const newLinks = [...(data.navbar?.links || [])];
                      newLinks.splice(idx, 1);
                      setData(prev => ({ ...prev, navbar: { ...prev.navbar, links: newLinks } }));
                    }} className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                    
                    <div><label className="text-[10px] text-slate-500">Menü Adı</label>
                    <input value={link.label} onChange={e => {
                      const newLinks = [...(data.navbar?.links || [])];
                      newLinks[idx].label = e.target.value;
                      setData(prev => ({ ...prev, navbar: { ...prev.navbar, links: newLinks } }));
                    }} className="w-full p-1 text-xs border rounded bg-white dark:bg-slate-950"/></div>
                    
                    <div><label className="text-[10px] text-slate-500">Link (Örn: #projeler, /iletisim)</label>
                    <input value={link.url} onChange={e => {
                      const newLinks = [...(data.navbar?.links || [])];
                      newLinks[idx].url = e.target.value;
                      setData(prev => ({ ...prev, navbar: { ...prev.navbar, links: newLinks } }));
                    }} className="w-full p-1 text-xs border rounded bg-white dark:bg-slate-950"/></div>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const newLinks = [...(data.navbar?.links || []), { id: Math.random().toString(36).substring(2), label: "Yeni Menü", url: "#" }];
                setData(prev => ({ ...prev, navbar: { ...(prev.navbar || { enabled: true }), links: newLinks } }));
              }} className="w-full text-center bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 p-2 rounded text-xs font-bold hover:bg-blue-100 transition">+ Menü Elemanı Ekle</button>
            </div>
          )}
        </div>

        {/* Proje Şablonları */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => { setIsProjectsOpen(!isProjectsOpen); setPreviewMode('main'); }} className="w-full p-3 flex justify-between items-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            <span>🚀 Proje Şablonları</span>
            {isProjectsOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
          {isProjectsOpen && (
            <div className="p-3 space-y-2 border-t border-slate-200 dark:border-slate-800 flex flex-col">
              <button onClick={() => addProject("1")} className="w-full text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs font-bold hover:border-blue-500 transition">+ Klasik Modern Kart</button>
              <button onClick={() => addProject("2")} className="w-full text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs font-bold hover:border-purple-500 transition">+ Resimli Büyük Kapak</button>
              <button onClick={() => addProject("3")} className="w-full text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs font-bold hover:border-green-500 transition">+ Minimalist Metin</button>
              <button onClick={() => addProject("4")} className="w-full text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs font-bold hover:border-orange-500 transition">+ Yatay Yerleşim</button>
              <button onClick={() => addProject("5")} className="w-full text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded text-xs font-bold hover:border-pink-500 transition">+ Glassmorphism Efekt</button>
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
                {block.type === 'icon' && (
                  <div className="space-y-2">
                    <button onClick={() => updateDynamicBlock(block.id, "icons", [...(block.data.icons||[]), {id: Math.random().toString(36).substring(2), iconName: 'Star', color: '#000000', bgColor: '#ffffff', url: '', rounded: true}])} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded w-full">+ Yeni İkon Ekle</button>
                    {(block.data.icons||[]).map((icon:any, i:number) => (
                      <div key={icon.id} className="flex flex-col gap-1 bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded relative">
                        <button onClick={() => { const ci=[...block.data.icons]; ci.splice(i,1); updateDynamicBlock(block.id,"icons",ci); }} className="absolute top-1 right-1 text-red-500"><Trash2 className="w-3 h-3"/></button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-[10px] text-slate-500">İkon Adı</label>
                            <input value={icon.iconName} onChange={e => { const ci=[...block.data.icons]; ci[i].iconName=e.target.value; updateDynamicBlock(block.id,"icons",ci); }} className="w-full p-1 text-xs border rounded bg-slate-50 dark:bg-slate-900" placeholder="Github, Linkedin..."/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">Bağlantı URL</label>
                            <input value={icon.url} onChange={e => { const ci=[...block.data.icons]; ci[i].url=e.target.value; updateDynamicBlock(block.id,"icons",ci); }} className="w-full p-1 text-xs border rounded bg-slate-50 dark:bg-slate-900" placeholder="https://..."/>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500">İkon Rengi</label>
                            <input type="color" value={icon.color || '#ffffff'} onChange={e => { const ci=[...block.data.icons]; ci[i].color=e.target.value; updateDynamicBlock(block.id,"icons",ci); }} className="w-full h-6 p-0 border rounded"/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">Kutu Rengi (Arkaplan)</label>
                            <input type="color" value={icon.bgColor || '#1e293b'} onChange={e => { const ci=[...block.data.icons]; ci[i].bgColor=e.target.value; updateDynamicBlock(block.id,"icons",ci); }} className="w-full h-6 p-0 border rounded"/>
                          </div>
                        </div>
                        <label className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <input type="checkbox" checked={icon.rounded} onChange={e => { const ci=[...block.data.icons]; ci[i].rounded=e.target.checked; updateDynamicBlock(block.id,"icons",ci); }} />
                          Kutuyu Yuvarlak Yap
                        </label>
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
      <div className="flex-1 h-full relative overflow-y-auto bg-slate-50 dark:bg-slate-950 pattern-grid z-10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-xs text-white font-mono uppercase z-50 shadow-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {previewMode === 'main' ? 'Ana Sayfa (Sürükle-Bırak Tuvali)' : 'Alt Sayfa (Dinamik) Tasarımı'}
        </div>

        <div className="w-full h-[4000px] relative">
          {previewMode === 'main' ? (
            (() => {
              const displayElements = data.hero?.elements ? [...data.hero.elements] : [];
              
              return (
                <>
                  {/* Navbar Preview */}
                  {data.navbar?.enabled && data.navbar?.links?.length > 0 && (
                    <nav className="absolute top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm pointer-events-none">
                      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-center gap-8">
                        {data.navbar.links.map((link: any) => (
                          <span 
                            key={link.id} 
                            className="text-sm font-bold text-slate-600 dark:text-slate-300"
                          >
                            {link.label}
                          </span>
                        ))}
                      </div>
                    </nav>
                  )}
                  
                  <CanvasEngine 
                  elements={displayElements}
                  isEditMode={true}
                  selectedIds={selectedCanvasIds}
                  onSelect={(ids) => setSelectedCanvasIds(Array.isArray(ids) ? ids : [ids])}
                  onUpdateElement={updateCanvasElement}
                  onUpdateMultiElements={(updates) => {
                    setData(prev => {
                      let newElements = [...(prev.hero.elements || [])];
                      updates.forEach(u => {
                        const idx = newElements.findIndex(el => el.id === u.id);
                        if (idx > -1) {
                          newElements[idx] = { ...newElements[idx], ...u.updates };
                        }
                      });
                      return { ...prev, hero: { ...prev.hero, elements: newElements } };
                    });
                  }}
                />
                </>
              );
            })()
          ) : (
            <div className="py-20 px-8 max-w-4xl mx-auto min-h-screen">
              <h1 className="text-4xl font-black mb-10 text-purple-600">{editingPage.title || "Yeni Sayfa"}</h1>
              <BlockRenderer blocks={editingPage.blocks} />
            </div>
          )}
        </div>
      </div>

      {/* SAĞ SÜTUN: Araçlar ve Dosya Yöneticisi */}
      <div className="w-[15%] min-w-[280px] max-w-[300px] h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-30 flex flex-col overflow-y-auto">
        <button 
          onClick={previewMode === 'main' ? handleSave : handleSavePage}
          disabled={isSaving}
          className="w-full mb-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg"
        >
          {isSaving ? "Kaydediliyor..." : (previewMode === 'main' ? "Ana Sayfayı YAYINLA" : "Alt Sayfayı YAYINLA")}
        </button>

        {/* Taslak Yöneticisi */}
        {previewMode === 'main' && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase flex items-center justify-between">
              Taslaklar
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400" title="Şu an üzerinde çalıştığınız versiyon">
                Aktif: {currentDraftId === 'main' ? 'CANLI' : currentDraftId}
              </span>
            </h3>
            
            <select 
              value={currentDraftId} 
              onChange={e => loadContent(e.target.value)}
              className="w-full mb-3 p-2 text-xs border rounded bg-white dark:bg-slate-950 outline-none"
            >
              <option value="main">YAYINDAKİ SÜRÜM (main)</option>
              {drafts.map(d => (
                <option key={d} value={d}>Taslak: {d}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Yeni taslak ismi..." 
                value={draftNameInput}
                onChange={e => setDraftNameInput(e.target.value)}
                className="flex-1 p-2 text-xs border rounded bg-white dark:bg-slate-950 outline-none"
              />
              <button 
                onClick={() => handleSaveDraft(draftNameInput)}
                disabled={isSaving || !draftNameInput.trim()}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
            <p className="text-[9px] text-slate-500 mt-2">Farklı bir HTML import etmeden önce mevcut halini bir taslak olarak kaydedebilirsin.</p>
          </div>
        )}

        {/* Akıllı HTML İçe Aktar */}
        {previewMode === 'main' && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <h3 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-2 uppercase flex items-center gap-2">
              <FileCode className="w-4 h-4"/> Akıllı HTML İçe Aktar
            </h3>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-3 leading-tight">Bir HTML dosyası seçin. Sistem içindeki başlık, metin, resim ve linkleri tuvale döksün.</p>
            <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
              <UploadCloud className="w-4 h-4" /> HTML Seç & Aktar
              <input type="file" accept=".html" className="hidden" onChange={handleHtmlImport} />
            </label>
          </div>
        )}

        {/* Dosya Yöneticisi (R2) Galerisi - KÜÇÜK VERSİYON */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition" onClick={() => setIsFileManagerOpen(true)}>
              <UploadCloud className="w-4 h-4 text-blue-500" /> Medya Deposu
            </span>
            <label className={`px-2 py-1 bg-blue-100 text-blue-600 rounded cursor-pointer hover:bg-blue-200 transition text-[10px] font-bold ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? '...' : '+ Yükle'}
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </h3>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            {mediaFiles.slice(0, 6).map(file => {
              const ext = file.key.split('.').pop()?.toUpperCase() || '?';
              const isImage = ['JPG','JPEG','PNG','GIF','WEBP','SVG'].includes(ext);
              const url = `/cdn/${file.key}`;
              return (
                <div 
                  key={file.key} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', window.location.origin + url);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(window.location.origin + url); }} 
                  className="relative group rounded overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square flex items-center justify-center bg-white dark:bg-slate-950 cursor-pointer shadow-sm hover:border-blue-500 cursor-grab active:cursor-grabbing"
                >
                  {isImage ? (
                    <img src={url} alt={file.key} className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <div className="font-bold text-slate-400 text-[10px] pointer-events-none">{ext}</div>
                  )}
                  <div className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                    <Copy className="w-4 h-4 text-white" />
                  </div>
                </div>
              )
            })}
          </div>
          
          {mediaFiles.length > 6 && (
            <button onClick={() => setIsFileManagerOpen(true)} className="w-full mt-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition shadow-sm">
              Tümünü Gör ({mediaFiles.length})
            </button>
          )}
          {mediaFiles.length === 0 && (
            <div className="text-[10px] text-center text-slate-400 py-2">
              Dosya yok.
            </div>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
          {previewMode === 'main' ? 'Serbest Araçlar (Paint)' : 'Sayfa Araçları (Blok)'}
        </h3>
        
        {/* Toolbar */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {previewMode === 'main' && (
            <button onClick={() => addCanvasElement('logo')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition"><Circle className="w-4 h-4"/><span className="text-[10px] font-bold">Logo</span></button>
          )}
          <button onClick={() => previewMode === 'main' ? addCanvasElement('text') : addDynamicBlock('text')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-purple-500 hover:text-purple-500 transition"><Type className="w-4 h-4"/><span className="text-[10px] font-bold">Metin</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('button') : addDynamicBlock('button')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"><LinkIcon className="w-4 h-4"/><span className="text-[10px] font-bold">Buton</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('image') : addDynamicBlock('image')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-500 hover:text-green-500 transition"><ImageIcon className="w-4 h-4"/><span className="text-[10px] font-bold">Resim</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('icon') : addDynamicBlock('icon')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-orange-500 hover:text-orange-500 transition"><Share2 className="w-4 h-4"/><span className="text-[10px] font-bold">İkonlar</span></button>
          <button onClick={() => previewMode === 'main' ? addCanvasElement('line') : addDynamicBlock('line')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-500 hover:text-slate-500 transition"><Minus className="w-4 h-4"/><span className="text-[10px] font-bold">Çizgi</span></button>
          {previewMode === 'main' && (
            <button onClick={() => addCanvasElement('shape')} className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-pink-500 hover:text-pink-500 transition"><Circle className="w-4 h-4"/><span className="text-[10px] font-bold">Şekil</span></button>
          )}
        </div>

        {/* Canvas Element Properties */}
        {previewMode === 'main' && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Seçili Obje Özellikleri</h3>
            
            {selectedCanvasIds.length > 1 ? (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 mb-4">
                  <strong>{selectedCanvasIds.length} obje seçili.</strong><br/>Aşağıdan tüm seçili objelere ortak animasyon atayabilirsiniz.
                </div>
                
                {/* --- ORTAK AYARLAR (ANIMASYON) --- */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Toplu Animasyon</h4>
                  
                  <div>
                    <label className="text-xs text-slate-500">Giriş Animasyonu</label>
                    <select 
                      onChange={e => updateMultiCanvasElementProps(selectedCanvasIds, "animationType", e.target.value)} 
                      className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950"
                    >
                      <option value="">(Değiştirme)</option>
                      <option value="none">Animasyon Yok</option>
                      <option value="fade-in">Karararak Belirme (Fade In)</option>
                      <option value="slide-up">Aşağıdan Yukarı (Slide Up)</option>
                      <option value="slide-left">Sağdan Sola (Slide Left)</option>
                      <option value="slide-right">Soldan Sağa (Slide Right)</option>
                      <option value="zoom-in">Büyüyerek Gelme (Zoom In)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-500">Animasyon Gecikmesi (Saniye)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      onChange={e => updateMultiCanvasElementProps(selectedCanvasIds, "animationDelay", Number(e.target.value))} 
                      className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" 
                      placeholder="(Değiştirme)"
                    />
                  </div>
                </div>
              </div>
            ) : selectedCanvasIds.length === 1 && data.hero.elements?.find(el => el.id === selectedCanvasIds[0]) ? (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {(() => {
                  const selectedCanvasEl = data.hero.elements.find(el => el.id === selectedCanvasIds[0])!;
                  return (
                    <>
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
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-slate-500">Metin Türü</label>
                        <select value={selectedCanvasEl.props.textType || 'normal'} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "textType", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950">
                          <option value="normal">Normal Metin</option>
                          <option value="subtitle">Üst Başlık (Küçük)</option>
                          <option value="title">Ana Başlık (Devasa)</option>
                          <option value="description">Açıklama (Gri)</option>
                        </select>
                      </div>
                      <div><label className="text-xs text-slate-500">Hizalama</label>
                        <select value={selectedCanvasEl.props.align || 'center'} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "align", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950">
                          <option value="left">Sola Dayalı</option>
                          <option value="center">Ortalı</option>
                          <option value="right">Sağa Dayalı</option>
                        </select>
                      </div>
                    </div>
                    <div><label className="text-xs text-slate-500">Yazı</label><textarea value={selectedCanvasEl.props.text || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "text", e.target.value)} className="w-full p-1.5 text-xs rounded border h-20 bg-white dark:bg-slate-950" /></div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[10px] text-slate-500">Özel Punto</label><input type="number" value={selectedCanvasEl.props.fontSize || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "fontSize", e.target.value)} placeholder="Oto" className="w-full p-1 text-xs border rounded bg-white dark:bg-slate-950" /></div>
                      <div><label className="text-[10px] text-slate-500">Sabit Renk</label><input type="color" value={selectedCanvasEl.props.color || "#000000"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full h-7 border rounded p-0 bg-white dark:bg-slate-950 cursor-pointer" /></div>
                    </div>
                    
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedCanvasEl.props.isGradient || false} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "isGradient", e.target.checked)} /> Degrade (Gradient) Efekti Uygula</label>
                  </>
                )}

                {selectedCanvasEl.type === 'logo' && (
                  <>
                    <div><label className="text-xs text-slate-500">Logo Metni (Örn: A.)</label><input value={selectedCanvasEl.props.text || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "text", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
                    <div><label className="text-[10px] text-slate-500">Veya İç Resim (Sürükle bırak)</label><input value={selectedCanvasEl.props.image || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "image", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
                    <div><label className="text-xs text-slate-500">Gidilecek Link (URL)</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} placeholder="Örn: / veya https://..." className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
                  </>
                )}

                {selectedCanvasEl.type === 'button' && (
                  <>
                    <div><label className="text-xs text-slate-500">Yazı</label><input value={selectedCanvasEl.props.label || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "label", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-xs text-slate-500">Link</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-[10px] text-slate-500">Arkaplan Rengi</label><input value={selectedCanvasEl.props.color || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
                    <div><label className="text-[10px] text-slate-500">İç İkon/Resim URL (Temizlemek için silin)</label><input value={selectedCanvasEl.props.image || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "image", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
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
                    <div><label className="text-[10px] text-slate-500">Arkaplan / Kenarlık Rengi</label><input type="color" value={selectedCanvasEl.props.color || "#db2777"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "color", e.target.value)} className="w-full h-8 border rounded p-0" /></div>
                    <div><label className="text-[10px] text-slate-500">İç Resim URL (Temizlemek için silin)</label><input value={selectedCanvasEl.props.image || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "image", e.target.value)} className="w-full p-1.5 text-xs rounded border" /></div>
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

                {selectedCanvasEl.type === 'project' && (
                  <>
                    <div><label className="text-xs text-slate-500">Proje Adı</label><input value={selectedCanvasEl.props.title || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "title", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
                    
                    <div><label className="text-xs text-slate-500">Şablon Seçimi</label>
                      <select value={selectedCanvasEl.props.template || "1"} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "template", e.target.value)} className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                        <option value="1">Şablon 1: Klasik Modern Kart (İkonlu)</option>
                        <option value="2">Şablon 2: Resimli Büyük Kapak (Banner)</option>
                        <option value="3">Şablon 3: Minimalist Metin (Sade)</option>
                        <option value="4">Şablon 4: Yatay Yerleşim (Resim Solda)</option>
                        <option value="5">Şablon 5: Glassmorphism (Bulanık Efekt)</option>
                      </select>
                    </div>

                    <div><label className="text-xs text-slate-500">Açıklama</label><textarea value={selectedCanvasEl.props.description || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "description", e.target.value)} className="w-full p-1.5 text-xs rounded border h-16 bg-white dark:bg-slate-950 resize-none" /></div>
                    
                    <div><label className="text-xs text-slate-500">Resim URL (Şablon 2, 4, 5 için)</label><input value={selectedCanvasEl.props.image || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "image", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
                    
                    <div><label className="text-xs text-slate-500">Gidilecek Link (URL)</label><input value={selectedCanvasEl.props.url || ""} onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "url", e.target.value)} className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" /></div>
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

                {selectedCanvasEl.type === 'icon' && (
                  <div className="space-y-2">
                    <button onClick={() => updateCanvasElementProps(selectedCanvasEl.id, "icons", [...(selectedCanvasEl.props.icons||[]), {id: Math.random().toString(36).substring(2), iconName: 'Star', color: '#000000', bgColor: '#ffffff', url: '', rounded: true}])} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded w-full">+ Yeni İkon Ekle</button>
                    {(selectedCanvasEl.props.icons||[]).map((icon:any, i:number) => (
                      <div key={icon.id} className="flex flex-col gap-1 bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded relative">
                        <button onClick={() => { const ci=[...selectedCanvasEl.props.icons]; ci.splice(i,1); updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} className="absolute top-1 right-1 text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3"/></button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-[10px] text-slate-500">İkon Adı</label>
                            <input value={icon.iconName} onChange={e => { const ci=[...selectedCanvasEl.props.icons]; ci[i].iconName=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} className="w-full p-1 text-xs border rounded bg-slate-50 dark:bg-slate-900" placeholder="Github, Linkedin..."/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">Bağlantı URL</label>
                            <input value={icon.url} onChange={e => { const ci=[...selectedCanvasEl.props.icons]; ci[i].url=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} className="w-full p-1 text-xs border rounded bg-slate-50 dark:bg-slate-900" placeholder="https://..."/>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500">İkon Rengi</label>
                            <input type="color" value={icon.color || '#ffffff'} onChange={e => { const ci=[...selectedCanvasEl.props.icons]; ci[i].color=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} className="w-full h-6 p-0 border rounded"/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">Kutu Rengi (Arkaplan)</label>
                            <input type="color" value={icon.bgColor || '#1e293b'} onChange={e => { const ci=[...selectedCanvasEl.props.icons]; ci[i].bgColor=e.target.value; updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} className="w-full h-6 p-0 border rounded"/>
                          </div>
                        </div>
                        <label className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <input type="checkbox" checked={icon.rounded} onChange={e => { const ci=[...selectedCanvasEl.props.icons]; ci[i].rounded=e.target.checked; updateCanvasElementProps(selectedCanvasEl.id,"icons",ci); }} />
                          Kutuyu Yuvarlak Yap
                        </label>
                      </div>
                    ))}
                    <div className="text-[10px] text-slate-400 mt-2">İkon Listesi: Github, Linkedin, Twitter, Youtube, Mail, Facebook, Instagram, Star, Heart, Check, vb...</div>
                  </div>
                )}

                {/* --- ORTAK AYARLAR (ANIMASYON VE ANCHOR) --- */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Gelişmiş Ayarlar</h4>
                  
                  <div>
                    <label className="text-xs text-slate-500 flex items-center gap-1" title="Örn: hakkimda. Başka bir butondan '#hakkimda' linki vererek sayfayı buraya kaydırabilirsiniz.">
                      Bağlantı Çapası (Anchor ID) <Info className="w-3 h-3"/>
                    </label>
                    <input 
                      value={selectedCanvasEl.props.anchorId || ""} 
                      onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "anchorId", e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))} 
                      placeholder="Örn: projeler, hakkimda" 
                      className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" 
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Giriş Animasyonu</label>
                    <select 
                      value={selectedCanvasEl.props.animationType || 'none'} 
                      onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "animationType", e.target.value)} 
                      className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950"
                    >
                      <option value="none">Animasyon Yok</option>
                      <option value="fade-in">Karararak Belirme (Fade In)</option>
                      <option value="slide-up">Aşağıdan Yukarı (Slide Up)</option>
                      <option value="slide-left">Sağdan Sola (Slide Left)</option>
                      <option value="slide-right">Soldan Sağa (Slide Right)</option>
                      <option value="zoom-in">Büyüyerek Gelme (Zoom In)</option>
                    </select>
                  </div>

                  {selectedCanvasEl.props.animationType && selectedCanvasEl.props.animationType !== 'none' && (
                    <div>
                      <label className="text-xs text-slate-500">Animasyon Gecikmesi (Saniye)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        value={selectedCanvasEl.props.animationDelay || 0} 
                        onChange={e => updateCanvasElementProps(selectedCanvasEl.id, "animationDelay", Number(e.target.value))} 
                        className="w-full p-1.5 text-xs rounded border bg-white dark:bg-slate-950" 
                      />
                    </div>
                  )}
                </div>

                    </>
                  );
                })()}
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
