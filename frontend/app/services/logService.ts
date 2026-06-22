import api from './api';

export interface LogEntry {
  _id: string;
  action: string;
  fileName: string;
  oldPath?: string;
  newPath?: string;
  category: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'failure';
  error?: string;
  details?: string;
  timestamp: string;
}

export interface LogsSummary {
  total: number;
  categories: {
    id: string;
    label: string;
    count: number;
  }[];
}

export const logService = {
  getLogs: (limit: number = 100, offset: number = 0, category?: string, severity?: string, search?: string) => {
    let endpoint = `/api/logs?limit=${limit}&offset=${offset}`;
    if (category && category !== 'All Logs') endpoint += `&category=${encodeURIComponent(category)}`;
    if (severity) endpoint += `&severity=${encodeURIComponent(severity)}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    return api.get<LogEntry[]>(endpoint);
  },

  getLogsSummary: () => api.get<LogsSummary>('/api/logs/summary'),

  getLogsByCategory: (category: string, limit: number = 100) =>
    api.get<LogEntry[]>(`/api/logs/category/${encodeURIComponent(category)}?limit=${limit}`),

  getLogById: (id: string) => api.get<LogEntry>(`/api/logs/${id}`),

  createLog: (entry: Partial<LogEntry>) => api.post<LogEntry>('/api/logs', entry),

  clearLogs: () => api.delete<{ message: string }>('/api/logs/clear'),
};

export default logService;
