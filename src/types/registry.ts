export interface FilterState {
  search: string;
  serverTypes: string[];
  hostingTypes: string[];
  trusted: boolean;
  languages: string[];
  licenses: string[];
  tags: string[];
}

export interface FilterOptions {
  serverTypes: string[];
  languages: string[];
  licenses: string[];
  tags: string[];
}

export type SortOption = 'popularity' | 'recent' | 'quality' | 'tools' | 'name';

export interface ServerMetrics {
  tools: number;
  language: string;
  stars: number;
  score: number;
}