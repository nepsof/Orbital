import api from './api';

export interface FileItem {
  _id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  isDirectory?: boolean;
  parentPath?: string;
}

export interface FolderNavigation {
  currentPath: string;
  parentPath: string | null;
  folders: string[];
  files: FileItem[];
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
}

export const fileService = {
  getFiles: () => api.get<FileItem[]>('/api/files'),
  
  getFilesFromMonitoredFolders: () => api.get<FileItem[]>('/api/files/monitored'),
  
  getFilesFromFolder: (folderPath: string) => {
    const params = new URLSearchParams({ path: folderPath });
    return api.get<FileItem[]>(`/api/files/folder?${params.toString()}`);
  },
  
  navigateFolder: (folderPath: string) => {
    const params = new URLSearchParams({ path: folderPath });
    return api.get<FolderNavigation>(`/api/files/navigate?${params.toString()}`);
  },
  
  getFileById: (id: string) => api.get<FileItem>(`/api/files/${id}`),
  
  getStats: () => api.get<FileStats>('/api/files/stats'),
  
  organizeFiles: () => api.post<{ organized: number; moved: string[] }>('/api/files/organize', {}),
  
  organizeFolder: (folderPath: string) => api.post<{ organized: number; moved: string[] }>(`/api/files/organize-folder`, { path: folderPath }),
  
  renameFile: (fileId: string, newName: string) => api.post<{ success: boolean; oldPath: string; newPath: string; name: string; newId: string }>('/api/files/rename', { fileId, newName }),

  deleteFile: (id: string) => api.delete(`/api/files/${id}`),
  
  searchFiles: (query: string, folders?: string[]) => {
    const params = new URLSearchParams({ q: query });
    if (folders && folders.length > 0) {
      folders.forEach(folder => params.append('folders', folder));
    }
    return api.get<FileItem[]>(`/api/files/search?${params.toString()}`);
  },
  
  openFile: async (id: string) => {
    const response = await api.post(`/api/files/${id}/open`, {});
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  },
  
  openFileInPath: async (id: string) => {
    const response = await api.post(`/api/files/${id}/open-in-path`, {});
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  },
  
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`, {
      method: 'POST',
      body: formData,
    });
  },
};

export default fileService;
