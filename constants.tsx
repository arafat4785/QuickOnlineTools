
import React from 'react';
import type { Tool, UnitCategory } from './types';
import { ToolCategory } from './types';

// --- Icon Components ---
const IconWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

export const AiIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="m12 8-2 4 2 4 2-4-2-4z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></IconWrapper>;
export const FileTextIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></IconWrapper>;
export const ImageIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></IconWrapper>;
export const PenToolIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><path d="m11 11 1 1"/></IconWrapper>;
export const MailIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></IconWrapper>;
export const PresentationIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="M7 21h10"/><path d="M12 16v5"/></IconWrapper>;
export const CompressIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M22 2 15 9l-3 3-3-3 7-7"/><path d="m15 9-6 6"/><path d="M9 15l-3 3-3-3 7-7"/><path d="m2 22 7-7"/></IconWrapper>;
export const ResizeIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M12.29 12.29 5 20"/><path d="M5 15v5h5"/><path d="M19 4h-5v5"/><path d="m19 9-7-7"/></IconWrapper>;
export const FileTypeIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13h3"/><path d="M11 13v6"/><path d="M15 13h-3"/></IconWrapper>;
export const FilesIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M16 18a2 2 0 0 1-2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"/></IconWrapper>;
export const RulerIcon = ({ className }: { className?: string }) => <IconWrapper className={className}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L3 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0L17.6 12"/><path d="m16 5 5 5"/><path d="m8.5 8.5 2 2"/><path d="m12.5 12.5 2 2"/><path d="m16.5 16.5 2 2"/><path d="m5 16 2 2"/></IconWrapper>;

export const TOOLS: Tool[] = [
  // AI Tools
  { id: 'image-to-text', name: 'Free Online Image to Text Converter (OCR) – Extract Text from Images', description: 'Extract text from images with high accuracy.', category: ToolCategory.AI, icon: FileTextIcon, featured: true },
  { id: 'text-to-image', name: 'Text to Image Generator', description: 'Create stunning images from text descriptions.', category: ToolCategory.AI, icon: ImageIcon },
  { id: 'blog-writer', name: 'AI Blog Post Writer', description: 'Generate engaging, SEO-friendly blog articles.', category: ToolCategory.AI, icon: PenToolIcon, featured: true },
  { id: 'email-writer', name: 'AI Email Writer', description: 'Compose professional emails for any situation.', category: ToolCategory.AI, icon: MailIcon },
  { id: 'flyer-maker', name: 'Flyer/Poster Maker', description: 'Design eye-catching flyers with AI assistance.', category: ToolCategory.AI, icon: PresentationIcon },

  // Image Tools
  { id: 'image-compressor', name: 'Image Compressor', description: 'Reduce image file size without losing quality.', category: ToolCategory.IMAGE, icon: CompressIcon },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images to custom dimensions easily.', category: ToolCategory.IMAGE, icon: ResizeIcon },
  { id: 'image-converter', name: 'Image Converter', description: 'Convert images to JPG, PNG, and other formats.', category: ToolCategory.IMAGE, icon: FileTypeIcon },

  // PDF Tools
  { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDF files into a single document.', category: ToolCategory.PDF, icon: FilesIcon, featured: true },
  { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert JPG, PNG, and other images to PDF.', category: ToolCategory.PDF, icon: ImageIcon },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert each page of a PDF into JPG images.', category: ToolCategory.PDF, icon: FileTypeIcon },
  
  // Converters
  { id: 'unit-converter', name: 'Unit & Area Converter', description: 'Convert length, weight, temperature, and area units.', category: ToolCategory.CONVERTER, icon: RulerIcon },
];


export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: "Length",
    units: [
      { name: "Meter", symbol: "m", factor: 1 },
      { name: "Kilometer", symbol: "km", factor: 1000 },
      { name: "Centimeter", symbol: "cm", factor: 0.01 },
      { name: "Millimeter", symbol: "mm", factor: 0.001 },
      { name: "Mile", symbol: "mi", factor: 1609.34 },
      { name: "Yard", symbol: "yd", factor: 0.9144 },
      { name: "Foot", symbol: "ft", factor: 0.3048 },
      { name: "Inch", symbol: "in", factor: 0.0254 },
    ],
  },
  {
    name: "Weight",
    units: [
      { name: "Kilogram", symbol: "kg", factor: 1 },
      { name: "Gram", symbol: "g", factor: 0.001 },
      { name: "Milligram", symbol: "mg", factor: 1e-6 },
      { name: "Pound", symbol: "lb", factor: 0.453592 },
      { name: "Ounce", symbol: "oz", factor: 0.0283495 },
    ],
  },
  {
    name: "Temperature",
    units: [
      { name: "Celsius", symbol: "°C", factor: 1 },
      { name: "Fahrenheit", symbol: "°F", factor: 1 },
      { name: "Kelvin", symbol: "K", factor: 1 },
    ],
  },
    {
    name: "Area",
    units: [
      { name: "Square Meter", symbol: "m²", factor: 1 },
      { name: "Square Kilometer", symbol: "km²", factor: 1e6 },
      { name: "Square Foot", symbol: "ft²", factor: 0.092903 },
      { name: "Square Mile", symbol: "mi²", factor: 2.59e6 },
      { name: "Acre", symbol: "acre", factor: 4046.86 },
      { name: "Hectare", symbol: "ha", factor: 10000 },
    ],
  },
];
