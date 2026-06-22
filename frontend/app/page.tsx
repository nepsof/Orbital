'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasAuthToken, isGuestMode, hasGuestSession } from './services/guestService';

import { useFilesManager, FileItem, FilesProvider } from './files/context/FilesContext';
import { getBreadcrumbs, joinPaths, reconstructPath } from './files/utils/path-utils';
import { sortFiles, SortField } from './files/utils/file-sorting';
import { filterFiles } from './files/utils/file-filters';
import { LeftSidebar } from './components/LeftSidebar';
import { TopBar } from './components/TopBar';
import { MainContent } from './components/MainContent';
import FilePreview from './components/FilePreview';
import './home.css';
import './components/left-sidebar.css';
import './components/top-bar.css';
import './components/main-content.css';
import './components/title-bar.css';



const FileExplorerContent: React.FC = () => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!(window as any).orbital?.hasCustomTitlebar);
  }, []);

  const { 
    files, 
    setCurrentFolder, 
    currentFolder,
    currentPath,
    setCurrentPath,
    currentFilter, 
    setCurrentFilter,
    toggleFavorite,
    deleteFile,
    renameFile,
    monitoredFolders,
    selectedIds,
    setSelectedIds,
    sortField,
    sortDirection,
    setSorting,
    searchQuery,
    setSearchQuery,
    bulkDelete,
    bulkFavorite,
    organizePath,
    refreshMonitoredFolders,
    error,
    createFolder,
    duplicateFile,
    copyFileTo,
    moveFile,
    clipboard,
    setClipboardData,
    recoveryItems,
    restoreFile,
    permanentDeleteFromTrash,
    refreshFiles,
    trashItems,
    fetchTrashItems,
    emptyNativeTrash
  } = useFilesManager();

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fileId: string | null } | null>(null);

  // Close context menu on any click outside it or when window loses focus
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener('mousedown', close);
    window.addEventListener('blur', close);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('blur', close);
    };
  }, [contextMenu]);

  const [backStack, setBackStack] = useState<string[]>([]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'list';
    const saved = localStorage.getItem('file-explorer-view-mode');
    if (saved === 'grid' || saved === 'list') return saved;
    const folderPref = localStorage.getItem('file-explorer-folder-view');
    if (folderPref) {
      try {
        const prefs = JSON.parse(folderPref);
        if (prefs['/'] === 'grid' || prefs['/'] === 'list') return prefs['/'];
      } catch {}
    }
    return 'list';
  });
  const [renamingFile, setRenamingFile] = useState<{ id: string; name: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Folder-specific preferences: load when path changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('file-explorer-folder-preferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          const folderPref = prefs[currentPath];
          if (folderPref) {
            if (folderPref.viewMode && folderPref.viewMode !== viewMode) {
              setViewMode(folderPref.viewMode);
            }
            if (folderPref.sortField && (folderPref.sortField !== sortField || folderPref.sortDirection !== sortDirection)) {
              setSorting(folderPref.sortField, folderPref.sortDirection || 'asc');
            }
          }
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // Folder-specific preferences: save when viewMode/sort changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('file-explorer-folder-preferences');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[currentPath] = { viewMode, sortField, sortDirection };
      localStorage.setItem('file-explorer-folder-preferences', JSON.stringify(prefs));
    } catch {}
  }, [currentPath, viewMode, sortField, sortDirection]);

  // Update document title with current path
  useEffect(() => {
    document.title = currentFolder || currentPath || 'Orbital';
  }, [currentFolder, currentPath]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = hasAuthToken();
      const isGuest = isGuestMode() && hasGuestSession();

      // Redirect to login if not authenticated and not in guest mode
      if (!isAuthenticated && !isGuest) {
        router.push('/login');
        return;
      }

      setIsCheckingAuth(false);
    };

    // Delay check to ensure localStorage is available
    const timer = setTimeout(checkAuth, 0);
    return () => clearTimeout(timer);
  }, [router]);

  const getFolderNameFromPath = useCallback((path: string) => {
    const crumbs = getBreadcrumbs(path);
    return crumbs.length > 0 ? crumbs[crumbs.length - 1] : 'My Files';
  }, []);

  const navigateToPath = useCallback(
    (newPath: string, folderName: string, replace = false) => {
      if (newPath === currentPath) return;
      if (!replace) {
        setBackStack((prev) => [...prev, currentPath]);
        setForwardStack([]);
      }
      setCurrentPath(newPath);
      setCurrentFolder(folderName);
      setCurrentFilter('all');
      setSelectedIds([]);
    },
    [currentPath, setCurrentPath, setCurrentFolder, setCurrentFilter, setSelectedIds]
  );

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      const breadcrumbs = getBreadcrumbs(currentPath);
      const newPath = index === -1 ? '/' : reconstructPath(breadcrumbs.slice(0, index + 1));
      const folderName = getFolderNameFromPath(newPath);
      navigateToPath(newPath, folderName);
    },
    [currentPath, getFolderNameFromPath, navigateToPath]
  );

  const goBack = useCallback(() => {
    if (backStack.length === 0) return;
    const previousPath = backStack[backStack.length - 1];
    setBackStack((prev) => prev.slice(0, -1));
    setForwardStack((prev) => [...prev, currentPath]);
    setCurrentPath(previousPath);
    setCurrentFolder(getFolderNameFromPath(previousPath));
    setCurrentFilter('all');
    setSelectedIds([]);
  }, [backStack, currentPath, getFolderNameFromPath, setCurrentFolder, setCurrentFilter, setSelectedIds, setCurrentPath]);

  const goForward = useCallback(() => {
    if (forwardStack.length === 0) return;
    const nextPath = forwardStack[forwardStack.length - 1];
    setForwardStack((prev) => prev.slice(0, -1));
    setBackStack((prev) => [...prev, currentPath]);
    setCurrentPath(nextPath);
    setCurrentFolder(getFolderNameFromPath(nextPath));
    setCurrentFilter('all');
    setSelectedIds([]);
  }, [currentPath, forwardStack, getFolderNameFromPath, setCurrentFolder, setCurrentFilter, setSelectedIds, setCurrentPath]);

  const getInitialUser = (): { fullName?: string; username?: string; email?: string } | null => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const [loggedInUser, setLoggedInUser] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    refreshMonitoredFolders();
  }, [refreshMonitoredFolders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeout = window.setTimeout(() => {
      const user = getInitialUser();
      if (user) {
        setLoggedInUser(user);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  // Filtered and Sorted Files
  const filteredFiles = useMemo(() => {
    if (currentFilter === 'trash') {
      const source = trashItems.length > 0 ? trashItems : (recoveryItems as FileItem[]);
      return sortFiles(source, sortField, sortDirection);
    }
    const filtered = filterFiles(files, searchQuery, currentPath, currentFilter);
    return sortFiles(filtered, sortField, sortDirection);
  }, [files, trashItems, recoveryItems, currentPath, currentFilter, searchQuery, sortField, sortDirection]);

  // Fetch native trash items when entering trash view
  useEffect(() => {
    if (currentFilter === 'trash') {
      fetchTrashItems();
    }
  }, [currentFilter, fetchTrashItems]);

  // Selection Logic
  const handleFileClick = useCallback((file: FileItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey && selectedIds.length > 0) {
      // Range selection
      const lastId = selectedIds[selectedIds.length - 1];
      const lastIndex = filteredFiles.findIndex(f => f.id === lastId);
      const currentIndex = filteredFiles.findIndex(f => f.id === file.id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = filteredFiles.slice(start, end + 1).map(f => f.id);
        setSelectedIds(Array.from(new Set([...selectedIds, ...rangeIds])));
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      if (selectedIds.includes(file.id)) {
        setSelectedIds(selectedIds.filter(id => id !== file.id));
      } else {
        setSelectedIds([...selectedIds, file.id]);
      }
    } else {
      // Single selection
      setSelectedIds([file.id]);
    }
  }, [filteredFiles, selectedIds, setSelectedIds]);

  const handleDoubleClick = useCallback((file: FileItem) => {
    if (file.isFolder) {
      const nextPath = joinPaths(file.path, file.name);
      navigateToPath(nextPath, file.name);
    } else {
      // Mock open
      console.log('Opening file:', file.name);
    }
  }, [navigateToPath]);

  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string | null) => {
    e.preventDefault();
    const menuWidth = 240;
    const menuHeight = fileId === null ? 480 : selectedIds.length > 1 ? 220 : 380;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth - 8) x = e.clientX - menuWidth;
    if (y + menuHeight > window.innerHeight - 8) y = e.clientY - menuHeight;
    x = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));
    setContextMenu({ x, y, fileId });
    if (fileId) {
      if (!selectedIds.includes(fileId)) {
        setSelectedIds([fileId]);
      }
    } else {
      setSelectedIds([]);
    }
  }, [selectedIds, setSelectedIds]);

  const handleQuickPreview = useCallback((file: FileItem) => {
    setPreviewFile(file);
    setContextMenu(null);
  }, []);

  const handleRevealInFolder = useCallback((file: FileItem) => {
    setCurrentPath(file.path);
    setCurrentFolder(file.path === '/' ? 'My Files' : file.path.split('/').pop() || 'My Files');
    setCurrentFilter('all');
    setSelectedIds([file.id]);
    setContextMenu(null);
  }, [setCurrentPath, setCurrentFolder, setCurrentFilter, setSelectedIds]);

  const handleCopy = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    setClipboardData({
      operation: 'copy',
      fileIds: [fileId],
      sourcePath: file.path,
      timestamp: Date.now()
    });
  }, [files, setClipboardData]);

  const handleCut = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    setClipboardData({
      operation: 'cut',
      fileIds: [fileId],
      sourcePath: file.path,
      timestamp: Date.now()
    });
  }, [files, setClipboardData]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    clipboard.fileIds.forEach((fileId: string) => {
      if (clipboard.operation === 'copy') {
        copyFileTo(fileId, currentPath);
      } else if (clipboard.operation === 'cut') {
        moveFile(fileId, currentPath);
      }
    });
    if (clipboard.operation === 'cut') {
      setClipboardData(null);
    }
  }, [clipboard, copyFileTo, moveFile, currentPath, setClipboardData]);

  const handleCreateFolder = useCallback(() => {
    createFolder(currentPath);
    setContextMenu(null);
  }, [createFolder, currentPath]);

  const handleDuplicate = useCallback((fileId: string) => {
    duplicateFile(fileId);
    setContextMenu(null);
  }, [duplicateFile]);

  const handleRestore = useCallback((fileId: string) => {
    restoreFile(fileId);
    refreshFiles();
  }, [restoreFile, refreshFiles]);

  const handlePermanentDelete = useCallback((fileId: string) => {
    permanentDeleteFromTrash(fileId);
  }, []);

  const handleEmptyNativeTrash = useCallback(() => {
    if (window.confirm('This action cannot be undone. All files in the trash will be permanently deleted.')) {
      emptyNativeTrash();
    }
  }, [emptyNativeTrash]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return;

      if (e.key === 'Escape') {
        setPreviewFile(null);
        setSelectedIds([]);
        setContextMenu(null);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (previewFile) {
          setPreviewFile(null);
        } else if (selectedIds.length === 1) {
          const target = filteredFiles.find(f => f.id === selectedIds[0]);
          if (target) setPreviewFile(target);
        }
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSelectedIds(filteredFiles.map(f => f.id));
      } else if (e.key === 'Delete' || (e.key === 'Backspace' && (e.ctrlKey || e.metaKey))) {
        if (selectedIds.length > 0) {
          bulkDelete(selectedIds);
        }
      } else if (e.key === 'Enter' && selectedIds.length === 1) {
        const file = filteredFiles.find(f => f.id === selectedIds[0]);
        if (file) handleDoubleClick(file);
      } else if (e.key === 'F2' && selectedIds.length === 1) {
        const file = filteredFiles.find(f => f.id === selectedIds[0]);
        if (file) setRenamingFile({ id: file.id, name: file.name });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const lastId = selectedIds[selectedIds.length - 1];
        const currentIndex = filteredFiles.findIndex(f => f.id === lastId);
        const nextFile = filteredFiles[currentIndex + 1];
        if (nextFile) {
          if (e.shiftKey) setSelectedIds([...selectedIds, nextFile.id]);
          else setSelectedIds([nextFile.id]);
        } else if (selectedIds.length === 0 && filteredFiles.length > 0) {
          setSelectedIds([filteredFiles[0].id]);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const lastId = selectedIds[selectedIds.length - 1];
        const currentIndex = filteredFiles.findIndex(f => f.id === lastId);
        const prevFile = filteredFiles[currentIndex - 1];
        if (prevFile) {
          if (e.shiftKey) setSelectedIds([...selectedIds, prevFile.id]);
          else setSelectedIds([prevFile.id]);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        router.push('/search');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, filteredFiles, bulkDelete, handleDoubleClick, renameFile, setSelectedIds, previewFile, router]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handlePreviewNavigate = useCallback((file: FileItem) => {
    setPreviewFile(file);
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSorting(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(field, 'asc');
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingTop: isElectron ? 40 : 0 }}>
        <div className={"electron-titlebar" + (isElectron ? ' with-traffic-lights draggable' : '')}>
          <div className="electron-titlebar-left">
            <span className="electron-titlebar-path">Orbital</span>
          </div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ paddingTop: isElectron ? 40 : 0 }}>
      <div className={"electron-titlebar" + (isElectron ? ' with-traffic-lights draggable' : '')}>
        <div className="electron-titlebar-left">
          <span className="electron-titlebar-path">
            {(() => {
              const crumbs = getBreadcrumbs(currentPath);
              return crumbs.length > 0 ? 'My Files  >  ' + crumbs.join('  >  ') : 'My Files';
            })()}
          </span>
        </div>
        <div className="electron-titlebar-right">
          <span className="electron-titlebar-items">{filteredFiles.length} items</span>
        </div>
      </div>
      <TopBar 
        filteredFilesCount={filteredFiles.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={goBack}
        onForward={goForward}
        canGoBack={backStack.length > 0}
        canGoForward={forwardStack.length > 0}
        onOrganize={async () => {
          setIsOrganizing(true);
          await organizePath(currentPath);
          setIsOrganizing(false);
        }}
        onOrganizeDisabled={filteredFiles.filter(f => !f.isFolder).length === 0 || isOrganizing}
        isOrganizing={isOrganizing}
        profileName={loggedInUser?.fullName || loggedInUser?.username || 'User'}
        profileEmail={loggedInUser?.email || 'admin@orbital.app'}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isTrashView={currentFilter === 'trash'}
        onEmptyTrash={handleEmptyNativeTrash}
      />

      <div className="file-explorer-container surface-raised">
        <LeftSidebar 
          currentPath={currentPath}
          currentFilter={currentFilter}
          files={files}
          monitoredFolders={monitoredFolders}
          onNavigate={(path: string, name: string) => {
            navigateToPath(path, name);
          }}
          onFilterClick={(filterName: string) => {
            setCurrentFilter(filterName);
            setSelectedIds([]);
          }}
          onMyFilesClick={() => {
            navigateToPath('/', 'My Files');
          }}
          trashCount={trashItems.length > 0 ? trashItems.length : recoveryItems.length}
        />

        <main className="explorer-main">
          <MainContent 
            filteredFiles={filteredFiles}
            selectedIds={selectedIds}
            sortField={sortField}
            sortDirection={sortDirection}
            error={error}
            contextMenu={contextMenu}
            viewMode={viewMode}
            onFileClick={handleFileClick}
            onFileDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onSort={toggleSort}
            onToggleFavorite={toggleFavorite}
            onBulkDelete={bulkDelete}
            onBulkFavorite={bulkFavorite}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            renamingFile={renamingFile}
            setRenamingFile={setRenamingFile}
            onSelectAll={() => setSelectedIds(filteredFiles.map(f => f.id))}
            onClearSelection={() => setSelectedIds([])}
            onSelectionChange={(ids) => setSelectedIds(ids)}
            onFixConfig={() => window.location.href = '/folder-monitoring'}
            onContextMenuClose={() => setContextMenu(null)}
            onFileOpen={handleDoubleClick}
            onViewModeChange={setViewMode}
            onQuickPreview={handleQuickPreview}
            onRevealInFolder={handleRevealInFolder}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            hasClipboard={clipboard !== null}
            onCreateFolder={handleCreateFolder}
            onDuplicate={handleDuplicate}
            isTrashView={currentFilter === 'trash'}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onEmptyTrash={handleEmptyNativeTrash}
          />
        </main>
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          allFiles={files}
          fileList={filteredFiles}
          monitoredFolders={monitoredFolders}
          onClose={() => setPreviewFile(null)}
          onNavigate={handlePreviewNavigate}
        />
      )}
    </div>
  );
};

const Home: React.FC = () => {
  return (
      <FilesProvider>
        <FileExplorerContent />
      </FilesProvider>
      
  );
};

export default Home;
