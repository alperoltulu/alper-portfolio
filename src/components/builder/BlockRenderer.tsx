import React from "react";
import Link from "next/link";
import { Download, ExternalLink, Github, Instagram, Linkedin, Twitter, Youtube, PlayCircle } from "lucide-react";

export type BlockType = 'text' | 'image' | 'button' | 'social' | 'cv' | 'video' | 'line';

export interface Block {
  id: string;
  type: BlockType;
  data: any;
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return (
              <div 
                key={block.id} 
                className="prose prose-lg dark:prose-invert max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: block.data.text || "" }} 
              />
            );
          
          case 'line':
            return (
              <div key={block.id} className="w-full flex justify-center py-4">
                <div 
                  style={{
                    width: block.data.w ? `${block.data.w}%` : '100%',
                    height: block.data.h ? `${block.data.h}px` : '2px',
                    backgroundColor: block.data.color || '#cbd5e1',
                    borderRadius: '9999px'
                  }}
                />
              </div>
            );
          
          case 'image':
            return (
              <div key={block.id} className="flex justify-center">
                <img 
                  src={block.data.url || "https://placehold.co/600x400/png?text=Gorsel+Yok"} 
                  alt={block.data.alt || "Görsel"} 
                  className={`max-w-full h-auto shadow-xl ${block.data.rounded ? "rounded-full aspect-square object-cover" : "rounded-2xl"}`}
                  style={{ maxHeight: block.data.rounded ? '250px' : '600px' }}
                />
              </div>
            );
          
          case 'button':
            return (
              <div key={block.id} className="flex justify-center sm:justify-start">
                <a 
                  href={block.data.url || "#"} 
                  target={block.data.newTab ? "_blank" : "_self"}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {block.data.label || "Tıklayın"}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );

          case 'social':
            const dynamicLinks = block.data.links || [];
            return (
              <div key={block.id} className="flex flex-wrap items-center gap-4 py-4">
                
                {dynamicLinks.map((link: any, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="p-1 rounded-full transition-transform hover:scale-110 shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                    {link.logoUrl ? (
                      <img src={link.logoUrl} alt="social" className="w-10 h-10 object-cover" />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {link.url ? link.url.substring(0,2).toUpperCase() : "?"}
                      </div>
                    )}
                  </a>
                ))}

                {/* Legacy Links */}
                {block.data.twitter && (
                  <a href={block.data.twitter} target="_blank" className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"><Twitter className="w-5 h-5" /></a>
                )}
                {block.data.linkedin && (
                  <a href={block.data.linkedin} target="_blank" className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"><Linkedin className="w-5 h-5" /></a>
                )}
                {block.data.github && (
                  <a href={block.data.github} target="_blank" className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><Github className="w-5 h-5" /></a>
                )}
                {block.data.instagram && (
                  <a href={block.data.instagram} target="_blank" className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full transition-colors"><Instagram className="w-5 h-5" /></a>
                )}
                {block.data.youtube && (
                  <a href={block.data.youtube} target="_blank" className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"><Youtube className="w-5 h-5" /></a>
                )}
              </div>
            );

          case 'cv':
            return (
              <div key={block.id} className="flex justify-center sm:justify-start">
                <a 
                  href={block.data.url || "#"} 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all shadow-xl hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  {block.data.label || "Özgeçmişimi İndir"}
                </a>
              </div>
            );

          case 'video':
            return (
              <div key={block.id} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center group">
                {block.data.url ? (
                  <iframe 
                    src={block.data.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                    className="absolute top-0 left-0 w-full h-full border-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center gap-2">
                    <PlayCircle className="w-12 h-12 opacity-50" />
                    <span>Video URL girilmedi</span>
                  </div>
                )}
              </div>
            );

          default:
            return <div key={block.id} className="p-4 bg-red-100 text-red-500 rounded">Bilinmeyen blok tipi!</div>;
        }
      })}
    </div>
  );
}
