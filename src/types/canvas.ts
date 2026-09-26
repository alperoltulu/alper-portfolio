export type CanvasElementType = 'text' | 'button' | 'shape' | 'image' | 'social' | 'icon' | 'line' | 'hero' | 'projects' | 'project' | 'logo';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w?: number; // width in px
  h?: number; // height in px
  props: any; // specific data for the type
}
