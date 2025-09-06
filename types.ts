
import type React from 'react';

export enum ToolCategory {
  AI = 'AI Tools',
  IMAGE = 'Image Tools',
  PDF = 'PDF Tools',
  CONVERTER = 'Converters'
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
}

export type Unit = {
  name: string;
  symbol: string;
  factor: number;
};

export type UnitCategory = {
  name: string;
  units: Unit[];
};
