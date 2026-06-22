import api from './api';

export interface SearchResult {
  id: string;
  name: string;
  fullName?: string;
  path: string;
  type: string;
  category: string;
  score: number;
  icon?: string;
  iconUrl?: string;
  size?: number;
  isDirectory?: boolean;
}

export interface SearchMeta {
  query: string;
  total: number;
  webFallback: boolean;
  fuzzyUsed: boolean;
}

export interface SearchAnalytics {
  totalSearches: number;
  totalResultsFound: number;
  lastSearchAt: string | null;
  lastSearchQuery: string | null;
  historyCount: number;
}

export const searchService = {
  search: (query: string, limit?: number) =>
    api.post<{ data: SearchResult[]; meta: SearchMeta }>('/api/search', { query, limit }),

  webFallback: (query: string) =>
    api.post<{ message: string }>('/api/search/web-fallback', { query }),

  openFile: (filePath: string) =>
    api.post<{ message: string }>('/api/search/open', { path: filePath }),

  showInFolder: (filePath: string) =>
    api.post<{ message: string }>('/api/search/show-in-folder', { path: filePath }),

  getHistory: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<SearchResult[]>(`/api/search/history${params}`);
  },

  clearHistory: () =>
    api.delete<{ message: string }>('/api/search/history'),

  getAnalytics: () =>
    api.get<SearchAnalytics>('/api/search/analytics'),

  startIndexing: (paths?: string[]) =>
    api.post<{ message: string }>('/api/search/index', { paths }),

  getIndexStatus: () =>
    api.get<{ isIndexing: boolean; progress: { current: number; total: number; phase: string } }>('/api/search/index/status'),
};

export default searchService;
