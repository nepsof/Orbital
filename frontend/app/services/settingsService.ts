import api from './api';

export interface Settings {
  monitoredFolders: string[];
  autoOrganize: boolean;
  detectDuplicates: boolean;
  suggestCompression: boolean;
  searchShortcut: string;
}

export const settingsService = {
  getSettings: () => api.get<Settings>('/api/settings'),
  
  updateSettings: (settings: Partial<Settings>) => 
    api.patch<Settings>('/api/settings', settings),
    
  addFolders: (folders: string[]) => 
    api.post<Settings>('/api/settings/folders', { folders }),
    
  removeFolder: (folder: string) => 
    api.delete<Settings>(`/api/settings/folders?folder=${encodeURIComponent(folder)}`),

  pickFolder: () => 
    api.post<{ paths: string[] }>('/api/settings/pick-folder', {}),
};

export default settingsService;
