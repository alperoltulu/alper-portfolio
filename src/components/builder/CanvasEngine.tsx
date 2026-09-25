"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CanvasElement } from '@/types/canvas';
import ProjectCard from './ProjectCard';
// Removed missing icons

interface CanvasEngineProps {
  elements: CanvasElement[];
  isEditMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
  globalData?: any; // To render hero
  heroNode?: React.ReactNode;
}

export default function CanvasEngine({
  elements = [],
  isEditMode = false,
  selectedId = null,
  onSelect,
  onUpdateElement,
  globalData,
  heroNode
}: CanvasEngineProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, startElemX: number, startElemY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string, startX: number, startY: number, startW: number, startH: number } | null>(null);
  const [guideLines, setGuideLines] = useState<{ x?: number, y?: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string, elX: number, elY: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    if (onSelect) onSelect(id);
    
    setDragState({ id, startX: e.clientX, startY: e.clientY, startElemX: elX, startElemY: elY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeDown = (e: React.PointerEvent, el: CanvasElement) => {
    if (!isEditMode) return;
    e.stopPropagation();
    if (onSelect) onSelect(el.id);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Bounding client rect to measure current rendered dimensions if w/h are missing
    const node = document.getElementById(`canvas-el-inner-${el.id}`);
    const computedW = el.w || (node ? node.offsetWidth : 100);
    const computedH = el.h || (node ? node.offsetHeight : 100);

    setResizeState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: computedW,
      startH: computedH
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !canvasRef.current || !onUpdateElement) return;
    
    if (dragState) {
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      const dxPct = (dx / rect.width) * 100;
      const dyPct = (dy / rect.height) * 100;

      let newX = dragState.startElemX + dxPct;
      let newY = dragState.startElemY + dyPct;

      // Snapping Logic
      let snappedX = newX;
      let snappedY = newY;
      const SNAP_THRESHOLD = 1.5; // percentage
      
      let guideX: number | undefined = undefined;
      let guideY: number | undefined = undefined;

      // Center snap
      if (Math.abs(newX - 50) < SNAP_THRESHOLD) { snappedX = 50; guideX = 50; }
      
      // Snap to other elements
      elements.forEach(el => {
        if (el.id === dragState.id) return;
        if (Math.abs(newX - el.x) < SNAP_THRESHOLD) { snappedX = el.x; guideX = el.x; }
        if (Math.abs(newY - el.y) < SNAP_THRESHOLD) { snappedY = el.y; guideY = el.y; }
      });

      snappedX = Math.max(0, Math.min(100, snappedX));
      snappedY = Math.max(0, Math.min(100, snappedY));

      setGuideLines({ x: guideX, y: guideY });
      onUpdateElement(dragState.id, { x: snappedX, y: snappedY });
    } else if (resizeState) {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;

      const newW = Math.max(20, resizeState.startW + dx);
      const newH = Math.max(20, resizeState.startH + dy);

      onUpdateElement(resizeState.id, { w: newW, h: newH });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragState(null);
      setGuideLines(null);
    }
    if (resizeState) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setResizeState(null);
    }
  };

  const handleCanvasClick = () => {
    if (isEditMode && onSelect) onSelect(null);
  };

  const handleElementDrop = (e: React.DragEvent, el: CanvasElement) => {
    if (!isEditMode || !onUpdateElement) return;
    e.preventDefault();
    e.stopPropagation();
    const url = e.dataTransfer.getData('text/plain');
    if (url && (el.type === 'shape' || el.type === 'button' || el.type === 'project' || el.type === 'logo')) {
      onUpdateElement(el.id, { props: { ...el.props, image: url } });
    }
  };

  const handleElementDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
  };

  const handleLinkClick = (e: React.MouseEvent, url?: string) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    if (url) {
      e.preventDefault();
      if (url.startsWith('#')) {
        const targetId = url.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  };

  const renderElementContent = (el: CanvasElement) => {
    switch (el.type) {
      case 'button':
        return (
          <a 
            href={isEditMode ? undefined : (el.props.url || "#")}
            onClick={(e) => handleLinkClick(e, el.props.url)}
            className="inline-flex items-center justify-center px-6 py-3 font-bold rounded-full transition-all shadow-lg whitespace-nowrap overflow-hidden gap-3 pointer-events-auto cursor-pointer"
            style={{ 
              background: el.props.color || 'linear-gradient(to right, #2563eb, #db2777)',
              color: el.props.textColor || '#ffffff',
              width: el.w ? `${el.w}px` : 'auto',
              height: el.h ? `${el.h}px` : 'auto',
              padding: el.props.image && !el.props.label ? '0.5rem' : undefined
            }}
          >
            {el.props.image && (
              <img src={el.props.image} alt="icon" className="w-8 h-8 object-contain" />
            )}
            {el.props.label && <span>{el.props.label}</span>}
          </a>
        );
      
      case 'shape':
        const hasImage = !!el.props.image;
        return (
          <div 
            className="shadow-lg relative overflow-hidden flex items-center justify-center bg-cover bg-center"
            style={{
              width: `${el.w || 100}px`,
              height: `${el.h || 100}px`,
              backgroundColor: hasImage ? 'transparent' : (el.props.color || '#db2777'),
              borderRadius: el.props.shapeType === 'circle' ? '50%' : (el.props.borderRadius || '16px'),
              border: hasImage ? `4px solid ${el.props.color || '#db2777'}` : 'none',
              backgroundImage: hasImage ? `url(${el.props.image})` : 'none'
            }}
          >
          </div>
        );

      case 'line':
        return (
          <div
            style={{
              width: el.w ? `${el.w}px` : '200px',
              height: el.h ? `${el.h}px` : '2px',
              backgroundColor: el.props.color || '#cbd5e1',
              borderRadius: '9999px'
            }}
          />
        );

      case 'logo':
        const isImageLogo = !!el.props.image;
        const logoUrl = !isEditMode ? (el.props.url || undefined) : undefined;
        return (
          <a 
            href={logoUrl}
            onClick={(e) => handleLinkClick(e, el.props.url)}
            className="bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-900/20 transition-all border-4 border-white dark:border-slate-800 overflow-hidden relative cursor-pointer group block pointer-events-auto"
            style={{
              width: el.w ? `${el.w}px` : '80px',
              height: el.h ? `${el.h}px` : '80px',
              textDecoration: 'none'
            }}
          >
            {isImageLogo ? (
              <img src={el.props.image} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <span className="group-hover:scale-110 transition-transform" style={{ fontSize: el.w ? `${el.w / 2.5}px` : '30px' }}>{el.props.text || "A."}</span>
            )}
            <div className="absolute inset-0 rounded-[2rem] ring-inset ring-2 ring-white/20 pointer-events-none"></div>
          </a>
        );

      case 'text':
        let extraClasses = "";
        let defaultColor = el.props.color || 'inherit';
        let defaultSize = el.props.fontSize || 16;
        
        if (el.props.textType === 'subtitle') {
          extraClasses = "font-bold tracking-wider uppercase";
          defaultColor = el.props.color || '#94a3b8';
          defaultSize = el.props.fontSize || 14;
        } else if (el.props.textType === 'title') {
          extraClasses = "font-black tracking-tight leading-tight";
          defaultColor = el.props.color || 'inherit';
          defaultSize = el.props.fontSize || 64;
          if (el.props.isGradient) {
            extraClasses += " bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500";
          }
        } else if (el.props.textType === 'description') {
          extraClasses = "font-medium leading-relaxed";
          defaultColor = el.props.color || '#64748b';
          defaultSize = el.props.fontSize || 18;
        }

        return (
          <div 
            className={`${extraClasses} break-words whitespace-pre-wrap`}
            style={{
              color: (el.props.textType === 'title' && el.props.isGradient) ? undefined : defaultColor,
              fontSize: `${defaultSize}px`,
              fontWeight: el.props.fontWeight || (el.props.textType === 'normal' ? 'normal' : undefined),
              width: el.w ? `${el.w}px` : 'max-content',
              textAlign: el.props.align || 'center'
            }}
          >
            {el.props.text || "Yeni Metin"}
          </div>
        );

      case 'image':
        return (
          <img 
            src={el.props.url || "https://placehold.co/200x200/png"} 
            alt="canvas img"
            draggable={false}
            className="shadow-xl object-cover pointer-events-none"
            style={{
              width: `${el.w || 200}px`,
              height: el.h ? `${el.h}px` : 'auto',
              borderRadius: el.props.rounded ? '50%' : '16px'
            }}
          />
        );

      case 'social':
        const dynamicLinks = el.props.links || [];
        return (
          <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20" style={{
            width: el.w ? `${el.w}px` : 'auto',
            height: el.h ? `${el.h}px` : 'auto'
          }}>
            {dynamicLinks.map((link: any, i: number) => (
              <a key={i} href={isEditMode ? undefined : link.url} target="_blank" rel="noreferrer" onClick={e => isEditMode && e.preventDefault()}>
                {link.logoUrl ? (
                  <img src={link.logoUrl} alt="social" className="w-8 h-8 rounded-full object-cover bg-white" />
                ) : (
                  <div className="w-8 h-8 bg-slate-800 text-white flex items-center justify-center rounded-full text-xs font-bold">
                    {link.url ? link.url.substring(0,2).toUpperCase() : "?"}
                  </div>
                )}
              </a>
            ))}
            
            {/* Legacy Icons Removed */}
            
            {dynamicLinks.length === 0 && !el.props.twitter && !el.props.linkedin && !el.props.github && !el.props.instagram && !el.props.youtube && (
              <span className="text-xs text-slate-500 px-2">Sosyal Link Ekleyin</span>
            )}
          </div>
        );
        
      case 'hero':
        return <div style={{ width: el.w ? `${el.w}px` : '100%', height: el.h ? `${el.h}px` : 'auto' }} className="pointer-events-none [&>*]:pointer-events-auto">{heroNode}</div>;

      case 'project':
        return (
          <div style={{ width: el.w ? `${el.w}px` : '400px', height: el.h ? `${el.h}px` : 'auto' }} className="pointer-events-none [&>*]:pointer-events-auto w-full h-full">
            <ProjectCard project={el.props} />
          </div>
        );

      default:
        return <div>Bilinmeyen Araç</div>;
    }
  };

  const getAnimationProps = (el: CanvasElement) => {
    if (isEditMode || !el.props.animationType || el.props.animationType === 'none') return {};
    
    const delay = el.props.animationDelay || 0;
    let initial: any = { opacity: 0 };
    let whileInView: any = { opacity: 1 };
    
    switch(el.props.animationType) {
      case 'fade-in': break;
      case 'slide-up': initial.y = 50; whileInView.y = 0; break;
      case 'slide-left': initial.x = 50; whileInView.x = 0; break;
      case 'slide-right': initial.x = -50; whileInView.x = 0; break;
      case 'zoom-in': initial.scale = 0.5; whileInView.scale = 1; break;
    }
    
    return {
      initial,
      whileInView,
      viewport: { once: true, margin: "-50px" },
      transition: { duration: 0.6, delay, ease: "easeOut" }
    };
  };

  return (
    <div 
      className={`absolute inset-0 w-full h-full flex justify-center ${isEditMode ? 'z-40 overflow-auto' : 'z-10 pointer-events-none overflow-hidden'}`}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div 
        ref={canvasRef}
        className="relative w-[1200px] h-full shrink-0"
        style={!isEditMode ? { 
          transform: 'scale(var(--canvas-scale, 1))', 
          transformOrigin: 'top center' 
        } : {}}
      >
        <style>{`
          @media (max-width: 1200px) {
            :root {
              --canvas-scale: calc(100vw / 1200);
            }
          }
        `}</style>
      {/* Guide Lines */}
      {guideLines?.x !== undefined && (
        <div className="absolute top-0 bottom-0 border-l border-red-500 z-50 pointer-events-none" style={{ left: `${guideLines.x}%` }} />
      )}
      {guideLines?.y !== undefined && (
        <div className="absolute left-0 right-0 border-t border-red-500 z-50 pointer-events-none" style={{ top: `${guideLines.y}%` }} />
      )}

      {elements.map(el => (
        <div
          key={el.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isEditMode ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-auto'}`}
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            zIndex: selectedId === el.id ? 50 : 10
          }}
          onPointerDown={(e) => handlePointerDown(e, el.id, el.x, el.y)}
          onDragOver={handleElementDragOver}
          onDrop={(e) => handleElementDrop(e, el)}
          onClick={(e) => {
            if (isEditMode) e.stopPropagation();
          }}
        >
          {/* Seçim Çerçevesi ve Boyutlandırma Tutamacı */}
          {isEditMode && selectedId === el.id && (
            <>
              <div className="absolute -inset-3 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none z-0" />
              <div 
                className="absolute -right-4 -bottom-4 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize z-20 hover:scale-110 transition-transform"
                onPointerDown={(e) => handleResizeDown(e, el)}
                title="Boyutlandırmak için sürükleyin"
              />
            </>
          )}
          
          <motion.div 
            id={el.props.anchorId || el.id} 
            className="relative z-10 pointer-events-none flex items-center justify-center"
            {...getAnimationProps(el)}
          >
            {renderElementContent(el)}
          </motion.div>
        </div>
      ))}
      </div>
    </div>
  );
}
