'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { filesStorage, STORAGE_KEYS } from '../../utils/files-storage';
import { MonitoredFolder } from '../../folder-monitoring/types';
import { fileService } from '../../services/fileService';

/**
 * File Metadata structure
 */
export interface FileItem {
  id: string;
  name: string;
  extension: string;
  path: string; // The parent path
  category: 'Videos' | 'Images' | 'Files' | 'Audio' | 'Documents' | 'Archives' | 'Design' | 'Archive' | 'Folder';
  size: number; // in bytes
  sizeDisplay: string;
  modifiedAt: string;
  createdAt: string;
  indexedAt?: string;
  accessedAt?: string;
  isFavorite: boolean;
  isDuplicate: boolean;
  isLarge: boolean;
  isFolder?: boolean;
  isPinned?: boolean;
  tags: string[];
  sourceFolder: string;
  status: 'Recent' | 'Organized' | 'Safe' | 'Large' | 'Backup' | 'Deleted';
  mimeType?: string;
}

export interface ActivityItem {
  id: string;
  type: 'move' | 'compress' | 'duplicate' | 'monitor' | 'favorite' | 'restore' | 'delete' | 'search';
  text: string;
  time: string;
  timestamp: number;
  color: 'primary' | 'success' | 'danger' | 'accent' | 'purple' | 'pink';
}

export interface RecoveryItem extends FileItem {
  deletedAt: string;
  originalPath: string;
}

export type SortField = 'name' | 'size' | 'modifiedAt' | 'category' | 'status';

export interface ClipboardData {
  operation: 'copy' | 'cut';
  fileIds: string[];
  sourcePath: string;
  timestamp: number;
}

export interface FilesContextType {
  // State
  files: FileItem[];
  favorites: string[]; // IDs
  activities: ActivityItem[];
  recoveryItems: RecoveryItem[];
  monitoredFolders: MonitoredFolder[];
  loading: boolean;
  
  // Selection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  
  // Sorting
  sortField: 'name' | 'size' | 'modifiedAt' | 'category' | 'status';
  sortDirection: 'asc' | 'desc';
  setSorting: (field: 'name' | 'size' | 'modifiedAt' | 'category' | 'status', direction: 'asc' | 'desc') => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  spotlightResults: { id: string, type: 'app' | 'file' | 'web', label: string, sub: string, category?: string }[];
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  currentFilter: string;
  setCurrentFilter: (filter: string) => void;
  
  // Trash (native OS trash)
  trashItems: FileItem[];
  fetchTrashItems: () => Promise<void>;
  emptyNativeTrash: () => Promise<void>;

  // Actions
  toggleFavorite: (fileId: string) => void;
  deleteFile: (fileId: string) => void; // Soft delete
  restoreFile: (fileId: string) => void;
  permanentDeleteFromTrash: (fileId: string) => void;
  emptyTrash: () => void;
  renameFile: (fileId: string, newName: string) => void;
  addActivity: (type: ActivityItem['type'], text: string, color: ActivityItem['color']) => void;
  bulkDelete: (ids: string[]) => void;
  bulkFavorite: (ids: string[], favorite: boolean) => void;
  organizePath: (path: string) => void;
  refreshMonitoredFolders: () => void;
  error: string | null;
  createFolder: (parentPath: string) => void;
  duplicateFile: (fileId: string) => void;
  copyFileTo: (fileId: string, targetPath: string) => void;
  moveFile: (fileId: string, targetPath: string) => void;
  refreshFiles: () => void;
  clipboard: ClipboardData | null;
  setClipboardData: (data: ClipboardData | null) => void;
  
  // Analytics
  stats: {
    totalFiles: number;
    duplicateCount: number;
    favoriteCount: number;
    storageUsage: string;
    recentCount: number;
    largeCount: number;
    organizedToday: number;
  };
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

export const FilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [trashItems, setTrashItems] = useState<FileItem[]>([]);
  const [monitoredFolders, setMonitoredFolders] = useState<MonitoredFolder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'size' | 'modifiedAt' | 'category' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  // Load/sync clipboard to sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('file-explorer-clipboard');
    if (stored) {
      try { setClipboard(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (clipboard) {
      sessionStorage.setItem('file-explorer-clipboard', JSON.stringify(clipboard));
    } else {
      sessionStorage.removeItem('file-explorer-clipboard');
    }
  }, [clipboard]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch real files from backend
  const fetchFiles = useCallback(async (realPath: string, virtualPath: string) => {
    // Avoid synchronous setState in effect
    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    try {
      const response = await fetch(`http://localhost:2831/api/files/list?path=${encodeURIComponent(realPath)}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to fetch files');
        return;
      }

      if (Array.isArray(data)) {
        // Map real paths to virtual paths for the frontend
        const mappedFiles = data.map(f => ({
          ...f,
          path: virtualPath,
          // Keep a reference to the real path if needed
          realPath: `${realPath}/${f.name}`
        }));

        setFiles(prev => {
          // Remove existing files in this virtual path to avoid duplicates
          const otherFiles = prev.filter(f => f.path !== virtualPath);
          return [...otherFiles, ...mappedFiles];
        });
      }
    } catch (error) {
      console.error('Failed to fetch real files:', error);
      setError('Network error: Could not connect to the file server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve a virtual path (e.g. "/Documents/Work") to a real filesystem path
  const resolveRealPath = useCallback((virtualPath: string): string | null => {
    if (!virtualPath || virtualPath === '/') return null;
    const breadcrumbs = virtualPath.split('/').filter(Boolean);
    const rootFolderName = breadcrumbs[0];
    const monitored = monitoredFolders.find(f => f.name === rootFolderName);
    if (!monitored) return null;
    let realPath = monitored.path;
    if (breadcrumbs.length > 1) {
      realPath = `${realPath}/${breadcrumbs.slice(1).join('/')}`;
    }
    return realPath;
  }, [monitoredFolders]);

  // Refresh the current directory's file listing from the backend
  const refreshFiles = useCallback(() => {
    if (!currentPath || currentPath === '/') return;
    const realPath = resolveRealPath(currentPath);
    if (!realPath) return;
    fetchFiles(realPath, currentPath);
  }, [currentPath, resolveRealPath, fetchFiles]);

   // Fetch files when path changes
   useEffect(() => {
     if (currentPath !== '/') {
       const breadcrumbs = currentPath.split('/').filter(Boolean);
       const rootFolderName = breadcrumbs[0];
       const monitoredFolder = monitoredFolders.find(f => f.name === rootFolderName);
       
       if (monitoredFolder) {
         let realPath = monitoredFolder.path;
         if (breadcrumbs.length > 1) {
           realPath = `${realPath}/${breadcrumbs.slice(1).join('/')}`;
         }
         // Wrap in setTimeout to avoid synchronous setState in effect
         setTimeout(() => {
           fetchFiles(realPath, currentPath);
         }, 0);
       } else {
         // If no monitored folder found, set error
         setTimeout(() => {
           setError(`No monitored folder found for: ${rootFolderName}. Please add this folder in Folder Monitoring.`);
           setLoading(false);
         }, 0);
       }
     }
   }, [currentPath, monitoredFolders, fetchFiles]);

  // Load from Storage on Mount
  useEffect(() => {
    const loadInitialData = () => {
      const savedActivities = filesStorage.get<ActivityItem[]>(STORAGE_KEYS.ACTIVITY_LOG, []);
      const savedRecovery = filesStorage.get<RecoveryItem[]>(STORAGE_KEYS.RECOVERY_ITEMS, []);
      const savedSettings = filesStorage.get<{ sortField?: 'name' | 'size' | 'modifiedAt' | 'category' | 'status', sortDirection?: 'asc' | 'desc' }>(STORAGE_KEYS.WORKSPACE_SETTINGS, {});
      
      if (savedSettings.sortField) setSortField(savedSettings.sortField);
      if (savedSettings.sortDirection) setSortDirection(savedSettings.sortDirection);

      // Load monitored folders from folder-monitoring storage
      const savedFolders = JSON.parse(localStorage.getItem('sfm_monitored_folders') || '[]');
      setMonitoredFolders(savedFolders);

      // Default to root if no path is set
      setCurrentFolder('My Files');
      setCurrentPath('/');

      // Only generate mock data for the root monitored folders themselves
      const rootFiles = savedFolders.map((mFolder: MonitoredFolder) => ({
        id: `folder-${mFolder.id}`,
        name: mFolder.name,
        extension: '',
        path: '/', // Root path
        category: 'Folder' as const,
        size: 0,
        sizeDisplay: '--',
        modifiedAt: mFolder.lastScan,
        createdAt: mFolder.lastScan,
        isFavorite: false,
        isDuplicate: false,
        isLarge: false,
        isFolder: true,
        tags: [],
        sourceFolder: mFolder.name,
        status: 'Safe' as const
      }));

      setFiles(rootFiles);
      setActivities(savedActivities);
      setRecoveryItems(savedRecovery);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Sync to Storage on Changes
  useEffect(() => {
    if (!loading) {
      filesStorage.set(STORAGE_KEYS.INDEXED_FILES, files);
    }
  }, [files, loading]);

  useEffect(() => {
    if (!loading) {
      filesStorage.set(STORAGE_KEYS.ACTIVITY_LOG, activities);
    }
  }, [activities, loading]);

  useEffect(() => {
    if (!loading) {
      filesStorage.set(STORAGE_KEYS.RECOVERY_ITEMS, recoveryItems);
    }
  }, [recoveryItems, loading]);

  useEffect(() => {
    if (!loading) {
      filesStorage.set(STORAGE_KEYS.WORKSPACE_SETTINGS, { sortField, sortDirection });
    }
  }, [sortField, sortDirection, loading]);

  // Actions
  const addActivity = useCallback((type: ActivityItem['type'], text: string, color: ActivityItem['color']) => {
    const newActivity: ActivityItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text,
      time: 'Just now',
      timestamp: Date.now(),
      color
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100));
  }, []);

  const setSorting = useCallback((field: 'name' | 'size' | 'modifiedAt' | 'category' | 'status', direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    const filesToDelete = files.filter(f => ids.includes(f.id));
    const realPaths = filesToDelete.map(f => (f as any).realPath).filter(Boolean) as string[];

    if (realPaths.length > 0) {
      try {
        const response = await fetch(`http://localhost:2831/api/files/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: realPaths })
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to delete files');
          return;
        }
      } catch (error) {
        console.error('Failed to bulk delete files:', error);
        setError('Network error: Could not connect to the file server');
        return;
      }
    }

    setFiles(prev => {
      const deletedFiles = prev.filter(f => ids.includes(f.id));
      const newRecoveryItems = deletedFiles.map(f => ({
        ...f,
        id: `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'Deleted' as const,
        deletedAt: new Date().toISOString(),
        originalPath: f.path
      }));
      setRecoveryItems(prevRec => [...newRecoveryItems, ...prevRec]);
      addActivity('delete', `Moved ${ids.length} items to Recovery Center`, 'danger');
      return prev.filter(f => !ids.includes(f.id));
    });
    setSelectedIds([]);
  }, [files, addActivity]);

  const bulkFavorite = useCallback((ids: string[], favorite: boolean) => {
    setFiles(prev => prev.map(f => ids.includes(f.id) ? { ...f, isFavorite: favorite } : f));
    addActivity('favorite', `${favorite ? 'Added' : 'Removed'} ${ids.length} items ${favorite ? 'to' : 'from'} favorites`, favorite ? 'purple' : 'accent');
  }, [addActivity]);

  const toggleFavorite = useCallback((fileId: string) => {
    setFiles(prev => {
      const updated = prev.map(f => {
        if (f.id === fileId) {
          const newState = !f.isFavorite;
          addActivity('favorite', `${newState ? 'Added' : 'Removed'} ${f.name} ${newState ? 'to' : 'from'} favorites`, newState ? 'purple' : 'accent');
          return { ...f, isFavorite: newState };
        }
        return f;
      });
      return updated;
    });
  }, [addActivity]);

  const deleteFile = useCallback(async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    const realPath = (fileToDelete as any).realPath;
    if (realPath) {
      try {
        const response = await fetch(`http://localhost:2831/api/files/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: [realPath] })
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to delete file');
          return;
        }
      } catch (error) {
        console.error('Failed to delete file:', error);
        setError('Network error: Could not connect to the file server');
        return;
      }
    }

    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        const recoveryItem: RecoveryItem = {
          ...file,
          id: `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'Deleted',
          deletedAt: new Date().toISOString(),
          originalPath: file.path
        };
        setRecoveryItems(prevRec => [recoveryItem, ...prevRec]);
        addActivity('delete', `Moved ${file.name} to Recovery Center`, 'danger');
        return prev.filter(f => f.id !== fileId);
      }
      return prev;
    });
  }, [files, addActivity]);

  const restoreFile = useCallback((fileId: string) => {
    const itemToRestore = recoveryItems.find(f => f.id === fileId);
    if (itemToRestore) {
      const { originalPath, ...fileData } = itemToRestore;
      const restoredFile: FileItem = {
        ...fileData,
        status: 'Recent'
      };
      setFiles(prev => [...prev, restoredFile]);
      setRecoveryItems(prevRec => prevRec.filter(f => f.id !== fileId));
      addActivity('restore', `Restored ${itemToRestore.name} to ${originalPath}`, 'success');
    }
  }, [recoveryItems, addActivity]);

  const fetchTrashItems = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:2831/api/files/trash-list`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTrashItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch trash items:', error);
    }
  }, []);

  const emptyNativeTrash = useCallback(async () => {
    try {
      await fetch(`http://localhost:2831/api/files/empty-trash`, { method: 'POST' });
      setTrashItems([]);
      setRecoveryItems([]);
      addActivity('delete', 'Emptied OS trash', 'danger');
    } catch (error) {
      console.error('Failed to empty OS trash:', error);
    }
  }, [addActivity]);

  const permanentDeleteFromTrash = useCallback(async (fileId: string) => {
    const item = recoveryItems.find(f => f.id === fileId);
    if (!item) return;
    const realPath = (item as any).realPath;
    if (realPath) {
      try {
        await fetch(`http://localhost:2831/api/files/permanent-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: [realPath] })
        });
      } catch (error) {
        console.error('Failed to permanently delete file:', error);
      }
    }
    setRecoveryItems(prev => prev.filter(f => f.id !== fileId));
    addActivity('delete', `Permanently deleted ${item.name}`, 'danger');
  }, [recoveryItems, addActivity]);

  const emptyTrash = useCallback(async () => {
    const currentItems = recoveryItems;
    if (currentItems.length === 0) return;
    const realPaths = currentItems.map(f => (f as any).realPath).filter(Boolean) as string[];
    if (realPaths.length > 0) {
      try {
        await fetch(`http://localhost:2831/api/files/permanent-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: realPaths })
        });
      } catch (error) {
        console.error('Failed to empty trash:', error);
      }
    }
    setRecoveryItems([]);
    addActivity('delete', `Emptied trash (${currentItems.length} items)`, 'danger');
  }, [recoveryItems, addActivity]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    let originalFile: FileItem | undefined;
    setFiles(prev => {
      originalFile = prev.find(f => f.id === fileId);
      return prev.map(f => f.id === fileId ? { ...f, name: newName } : f);
    });
    try {
      const result = await fileService.renameFile(fileId, newName);
      if (result.error) {
        console.error('OS rename failed:', result.error);
        if (originalFile) {
          setFiles(prev => prev.map(f => f.id === fileId ? originalFile! : f));
        }
        return;
      }
      if (result.data?.data) {
        const renameData = result.data.data;
        const newExt = newName.lastIndexOf('.') > 0 ? newName.slice(newName.lastIndexOf('.') + 1) : '';
        const extMap: Record<string, string> = {
          mp4: 'Videos', mov: 'Videos', avi: 'Videos', mkv: 'Videos',
          jpg: 'Images', jpeg: 'Images', png: 'Images', gif: 'Images', webp: 'Images',
          mp3: 'Audio', wav: 'Audio', flac: 'Audio',
          pdf: 'Documents', doc: 'Documents', docx: 'Documents', txt: 'Documents',
          zip: 'Archives', rar: 'Archives', '7z': 'Archives', tar: 'Archives', gz: 'Archives',
          psd: 'Design', ai: 'Design', sketch: 'Design', fig: 'Design',
        };
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                id: renameData.newId,
                name: newName,
                extension: newExt,
                category: f.isFolder ? 'Folder' : (extMap[newExt] || 'Files') as FileItem['category'],
              }
            : f
        ));
      }
    } catch (err) {
      console.error('OS rename failed, reverting:', err);
      if (originalFile) {
        setFiles(prev => prev.map(f => f.id === fileId ? originalFile! : f));
      }
    }
  }, []);

  const refreshMonitoredFolders = useCallback(() => {
    const savedFolders = JSON.parse(localStorage.getItem('sfm_monitored_folders') || '[]');
    setMonitoredFolders(savedFolders);
    
    // Update the root level files (monitored folders)
    setFiles(prev => {
      const otherFiles = prev.filter(f => f.path !== '/');
      const rootFiles = savedFolders.map((mFolder: MonitoredFolder) => ({
        id: `folder-${mFolder.id}`,
        name: mFolder.name,
        extension: '',
        path: '/',
        category: 'Folder' as const,
        size: 0,
        sizeDisplay: '--',
        modifiedAt: mFolder.lastScan,
        createdAt: mFolder.lastScan,
        isFavorite: false,
        isDuplicate: false,
        isLarge: false,
        isFolder: true,
        tags: [],
        sourceFolder: mFolder.name,
        status: 'Safe' as const
      }));
      return [...otherFiles, ...rootFiles];
    });

    return savedFolders;
  }, []);

  const createFolder = useCallback(async (parentPath: string) => {
    const realPath = resolveRealPath(parentPath);
    if (!realPath) {
      setFiles(prev => {
        const existing = prev.filter(f => f.isFolder && f.path === parentPath && (f.name === 'Folder' || /^Folder \d+$/.test(f.name)));
        let newName = 'Folder';
        let counter = 2;
        while (existing.some(f => f.name === newName)) {
          newName = `Folder ${counter}`;
          counter++;
        }
        const rootFolderName = parentPath === '/' ? '' : parentPath.split('/')[0];
        const newFolder: FileItem = {
          id: `folder-new-${Date.now()}`,
          name: newName,
          extension: '',
          path: parentPath,
          category: 'Folder',
          size: 0,
          sizeDisplay: '--',
          modifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isFavorite: false,
          isDuplicate: false,
          isLarge: false,
          isFolder: true,
          tags: [],
          sourceFolder: rootFolderName,
          status: 'Recent'
        };
        addActivity('monitor', `Created new folder: ${newName}`, 'primary');
        return [...prev, newFolder];
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:2831/api/files/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath: realPath })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create folder');
        return;
      }
      addActivity('monitor', `Created new folder: ${data.name}`, 'primary');
      fetchFiles(realPath, parentPath);
    } catch (error) {
      console.error('Failed to create folder:', error);
      setError('Network error: Could not connect to the file server');
    }
  }, [resolveRealPath, addActivity, fetchFiles]);

  const duplicateFile = useCallback(async (fileId: string) => {
    const source = files.find(f => f.id === fileId);
    if (!source) return;

    const sourceRealPath = (source as any).realPath;
    if (!sourceRealPath) {
      setFiles(prev => {
        const src = prev.find(f => f.id === fileId);
        if (!src) return prev;
        let baseName = src.name;
        let ext = '';
        if (!src.isFolder) {
          const dot = src.name.lastIndexOf('.');
          if (dot > 0) { baseName = src.name.slice(0, dot); ext = src.name.slice(dot); }
        }
        let newName = src.isFolder ? `${baseName} copy` : `${baseName} copy${ext}`;
        let counter = 2;
        while (prev.some(f => f.path === src.path && f.name === newName)) {
          newName = src.isFolder ? `${baseName} copy ${counter}` : `${baseName} copy ${counter}${ext}`;
          counter++;
        }
        const duplicate: FileItem = {
          ...src, id: `dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: newName, isFavorite: false, isDuplicate: true,
          createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), status: 'Recent'
        };
        addActivity('duplicate', `Duplicated ${src.name} as ${newName}`, 'primary');
        return [...prev, duplicate];
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:2831/api/files/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath: sourceRealPath })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to duplicate file');
        return;
      }
      addActivity('duplicate', `Duplicated ${source.name} as ${data.name}`, 'primary');
      refreshFiles();
    } catch (error) {
      console.error('Failed to duplicate file:', error);
      setError('Network error: Could not connect to the file server');
    }
  }, [files, addActivity, refreshFiles]);

  const copyFileTo = useCallback(async (fileId: string, targetPath: string) => {
    const source = files.find(f => f.id === fileId);
    if (!source) return;

    const sourceRealPath = (source as any).realPath;
    const targetRealPath = resolveRealPath(targetPath);

    if (!sourceRealPath || !targetRealPath) {
      setFiles(prev => {
        const src = prev.find(f => f.id === fileId);
        if (!src) return prev;
        let baseName = src.name;
        let ext = '';
        if (!src.isFolder) {
          const dot = src.name.lastIndexOf('.');
          if (dot > 0) { baseName = src.name.slice(0, dot); ext = src.name.slice(dot); }
        }
        let newName = src.isFolder ? baseName : `${baseName}${ext}`;
        let counter = 2;
        while (prev.some(f => f.path === targetPath && f.name === newName)) {
          newName = src.isFolder ? `${baseName} ${counter}` : `${baseName} copy ${counter}${ext}`;
          counter++;
        }
        const copy: FileItem = {
          ...src, id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          path: targetPath, name: newName, isFavorite: false, isDuplicate: true,
          createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), status: 'Recent'
        };
        addActivity('duplicate', `Copied ${src.name} to ${targetPath}`, 'primary');
        return [...prev, copy];
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:2831/api/files/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePaths: [sourceRealPath], targetPath: targetRealPath })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to copy file');
        return;
      }
      addActivity('duplicate', `Copied ${source.name} to ${targetPath}`, 'primary');
      refreshFiles();
    } catch (error) {
      console.error('Failed to copy file:', error);
      setError('Network error: Could not connect to the file server');
    }
  }, [files, resolveRealPath, addActivity, refreshFiles]);

  const moveFile = useCallback(async (fileId: string, targetPath: string) => {
    const source = files.find(f => f.id === fileId);
    if (!source) return;

    const sourceRealPath = (source as any).realPath;
    const targetRealPath = resolveRealPath(targetPath);

    if (!sourceRealPath || !targetRealPath) {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          addActivity('move', `Moved ${f.name} to ${targetPath}`, 'success');
          return { ...f, path: targetPath };
        }
        return f;
      }));
      return;
    }

    try {
      const response = await fetch(`http://localhost:2831/api/files/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePaths: [sourceRealPath], targetPath: targetRealPath })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to move file');
        return;
      }
      addActivity('move', `Moved ${source.name} to ${targetPath}`, 'success');
      refreshFiles();
    } catch (error) {
      console.error('Failed to move file:', error);
      setError('Network error: Could not connect to the file server');
    }
  }, [files, resolveRealPath, addActivity, refreshFiles]);

  const organizePath = useCallback(async (virtualPath: string) => {
    try {
      // Find the monitored folder for this virtual path
      if (virtualPath === '/') {
        setError('Please navigate to a specific folder to organize');
        return;
      }

      const breadcrumbs = virtualPath.split('/').filter(Boolean);
      const rootFolderName = breadcrumbs[0];
      const monitoredFolder = monitoredFolders.find(f => f.name === rootFolderName);
      
      if (!monitoredFolder) {
        setError(`No monitored folder found for: ${rootFolderName}`);
        return;
      }

      // Build real path
      let realPath = monitoredFolder.path;
      if (breadcrumbs.length > 1) {
        realPath = `${realPath}/${breadcrumbs.slice(1).join('/')}`;
      }

      // Call organize API
      const response = await fetch(`http://localhost:2831/api/files/organize?path=${encodeURIComponent(realPath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to organize files');
        return;
      }

      // Add activity log
      const message = `Organized ${data.organizedCount} files in ${virtualPath}`;
      addActivity('move', message, 'success');

      // Refresh files in this path
      setTimeout(() => {
        fetchFiles(realPath, virtualPath);
      }, 500);

    } catch (error) {
      console.error('Failed to organize path:', error);
      setError('Network error: Could not connect to the file server');
    }
  }, [monitoredFolders, fetchFiles, addActivity]);

  // Stats Calculation
  const stats = useMemo(() => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const organizedToday = files.filter(f => f.status === 'Organized').length; // Mock logic
    
    return {
      totalFiles: files.length,
      duplicateCount: files.filter(f => f.isDuplicate).length,
      favoriteCount: files.filter(f => f.isFavorite).length,
      storageUsage: totalSize > 1073741824 
        ? `${(totalSize / 1073741824).toFixed(1)} GB` 
        : `${(totalSize / 1048576).toFixed(1)} MB`,
      recentCount: files.filter(f => f.status === 'Recent').length,
      largeCount: files.filter(f => f.isLarge).length,
      organizedToday: organizedToday
    };
  }, [files]);

  const favorites = useMemo(() => files.filter(f => f.isFavorite).map(f => f.id), [files]);

  // Spotlight Filtered Results
  const spotlightResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    
    // 1. Search Files
    const fileResults = files
      .filter(f => f.name.toLowerCase().includes(query))
      .map(f => ({
        id: f.id,
        type: 'file' as const,
        label: f.name,
        sub: `${f.path}`,
        category: f.category
      }))
      .slice(0, 5);

    // 2. Mock Apps
    const apps = [
      { id: 'app1', type: 'app' as const, label: 'VS Code', sub: 'Application' },
      { id: 'app2', type: 'app' as const, label: 'Chrome', sub: 'Application' },
      { id: 'app3', type: 'app' as const, label: 'Figma', sub: 'Application' },
      { id: 'app4', type: 'app' as const, label: 'Terminal', sub: 'Application' },
      { id: 'app5', type: 'app' as const, label: 'Photoshop', sub: 'Application' },
    ].filter(a => a.label.toLowerCase().includes(query));

    return [...apps, ...fileResults];
  }, [files, searchQuery]);

  const value = {
    files,
    favorites,
    activities,
    recoveryItems,
    trashItems,
    fetchTrashItems,
    emptyNativeTrash,
    monitoredFolders,
    loading,
    selectedIds,
    setSelectedIds,
    sortField,
    sortDirection,
    setSorting,
    searchQuery,
    setSearchQuery,
    spotlightResults,
    currentFolder,
    setCurrentFolder,
    currentPath,
    setCurrentPath,
    currentFilter,
    setCurrentFilter,
    toggleFavorite,
    deleteFile,
    restoreFile,
    permanentDeleteFromTrash,
    emptyTrash,
    renameFile,
    addActivity,
    bulkDelete,
    bulkFavorite,
    organizePath,
    refreshMonitoredFolders,
    error,
    createFolder,
    duplicateFile,
    copyFileTo,
    moveFile,
    refreshFiles,
    clipboard,
    setClipboardData: setClipboard,
    stats
  };

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
};

export const useFilesManager = () => {
  const context = useContext(FilesContext);
  if (context === undefined) {
    throw new Error('useFilesManager must be used within a FilesProvider');
  }
  return context;
};
