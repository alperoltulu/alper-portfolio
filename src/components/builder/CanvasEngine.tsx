"use client";

import React, { useState, useRef } from 'react';
import { CanvasElement } from '@/types/canvas';
import { Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react';

interface CanvasEngineProps {
  elements: CanvasElement[];
  isEditMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function CanvasEngine({
  elements = [],
  isEditMode = false,
  selectedId = null,
  onSelect,
  onUpdateElement
}: CanvasEngineProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, startElemX: number, startElemY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string, elX: number, elY: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    if (onSelect) onSelect(id);
    
    setDragState({ id, startX: e.clientX, startY: e.clientY, startElemX: elX, startElemY: elY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !dragState || !canvasRef.current || !onUpdateElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    const dxPct = (dx / rect.width) * 100;
    const dyPct = (dy / rect.height) * 100;

    let newX = dragState.startElemX + dxPct;
    let newY = dragState.startElemY + dyPct;

    // Bounds checking (optional, but good for keeping things on screen)
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    onUpdateElement(dragState.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragState(null);
    }
  };

  const handleCanvasClick = () => {
    if (isEditMode && onSelect) onSelect(null);
  };

  const renderElementContent = (el: CanvasElement) => {
    switch (el.type) {
      case 'button':
        return (
          <a 
            href={isEditMode ? undefined : (el.props.url || "#")}
            onClick={e => isEditMode && e.preventDefault()}
            className="inline-flex items-center justify-center px-6 py-3 font-bold rounded-full transition-all shadow-lg whitespace-nowrap"
            style={{ 
              background: el.props.color || 'linear-gradient(to right, #2563eb, #db2777)',
              color: el.props.textColor || '#ffffff',
              width: el.w ? `${el.w}px` : 'auto',
              height: el.h ? `${el.h}px` : 'auto'
            }}
          >
            {el.props.label || "Buton"}
          </a>
        );
      
      case 'shape':
        return (
          <div 
            className="shadow-lg"
            style={{
              width: `${el.w || 100}px`,
              height: `${el.h || 100}px`,
              backgroundColor: el.props.color || '#db2777',
              borderRadius: el.props.shapeType === 'circle' ? '50%' : (el.props.borderRadius || '16px')
            }}
          />
        );

      case 'text':
        return (
          <div 
            style={{
              color: el.props.color || 'inherit',
              fontSize: `${el.props.fontSize || 16}px`,
              fontWeight: el.props.fontWeight || 'normal',
              width: el.w ? `${el.w}px` : 'max-content',
              textAlign: el.props.align || 'left'
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
        return (
          <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
            {el.props.twitter && <div className="p-2 bg-slate-900 text-white rounded-full"><Twitter className="w-4 h-4"/></div>}
            {el.props.linkedin && <div className="p-2 bg-blue-600 text-white rounded-full"><Linkedin className="w-4 h-4"/></div>}
            {el.props.github && <div className="p-2 bg-slate-800 text-white rounded-full"><Github className="w-4 h-4"/></div>}
            {el.props.instagram && <div className="p-2 bg-pink-600 text-white rounded-full"><Instagram className="w-4 h-4"/></div>}
            {el.props.youtube && <div className="p-2 bg-red-600 text-white rounded-full"><Youtube className="w-4 h-4"/></div>}
            {!el.props.twitter && !el.props.linkedin && !el.props.github && !el.props.instagram && !el.props.youtube && (
              <span className="text-xs text-slate-500 px-2">Sosyal Link Ekleyin</span>
            )}
          </div>
        );

      default:
        return <div>Bilinmeyen Araç</div>;
    }
  };

  return (
    <div 
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${isEditMode ? 'z-40' : 'z-10 pointer-events-none'}`}
      onClick={handleCanvasClick}
    >
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
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={(e) => {
            if (isEditMode) e.stopPropagation();
          }}
        >
          {/* Seçim Çerçevesi (Sadece Edit Modunda) */}
          {isEditMode && selectedId === el.id && (
            <div className="absolute -inset-3 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none z-0" />
          )}
          
          <div className="relative z-10">
            {renderElementContent(el)}
          </div>
        </div>
      ))}
    </div>
  );
}
