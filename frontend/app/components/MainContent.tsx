'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  FiChevronUp,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiFolder,
  FiStar,
  FiTrash2,
  FiX,
  FiMove,
  FiPackage,
  FiExternalLink,
  FiEdit2,
  FiCopy,
  FiPlus,
  FiCheckSquare,
  FiEye,
  FiInfo,
  FiTerminal,
  FiEyeOff,
  FiClipboard,
} from 'react-icons/fi';
import { FileItem, SortField } from '../files/context/FilesContext';
import { getFileIcon, getIconClassName } from '../files/utils/file-icons';
import { formatFileSize, formatDate } from '../files/utils/file-formatters';
import './main-content.css';

interface ContextMenu {
  x: number;
  y: number;
  fileId: string | null;
}

interface MainContentProps {
  filteredFiles: FileItem[];
  selectedIds: string[];
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  error: string | null;
  contextMenu: ContextMenu | null;
  viewMode: 'list' | 'grid';
  onFileClick: (file: FileItem, e: React.MouseEvent) => void;
  onFileDoubleClick: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, fileId: string | null) => void;
  onSort: (field: SortField) => void;
  onToggleFavorite: (fileId: string) => void;
  onBulkDelete: (fileIds: string[]) => void;
  onBulkFavorite: (fileIds: string[], favorite: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectionChange: (ids: string[]) => void;
  onFixConfig: () => void;
  onContextMenuClose: () => void;
  onFileOpen: (file: FileItem) => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onQuickPreview: (file: FileItem) => void;
  onRevealInFolder: (file: FileItem) => void;
  onCopy: (fileId: string) => void;
  onCut: (fileId: string) => void;
  onPaste: () => void;
  hasClipboard: boolean;
  onCreateFolder: () => void;
  onDuplicate: (fileId: string) => void;
  isTrashView?: boolean;
  onRestore?: (fileId: string) => void;
  onPermanentDelete?: (fileId: string) => void;
  onEmptyTrash?: () => void;
  renamingFile: { id: string; name: string } | null;
  setRenamingFile: (file: { id: string; name: string } | null) => void;
}

const ResponsiveFileName: React.FC<{ name: string }> = ({ name }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(name);

  const update = useCallback(() => {
    const wrapper = wrapperRef.current;
    const measure = measureRef.current;
    if (!wrapper || !measure) return;

    const measureText = (text: string) => {
      measure.textContent = text;
      return measure.offsetWidth;
    };

    const available = wrapper.clientWidth;
    const fullWidth = measureText(name);

    if (fullWidth <= available) {
      setTruncated(name);
      return;
    }

    const dot = name.lastIndexOf('.');
    const ext = dot > 0 ? name.slice(dot) : '';
    const base = dot > 0 ? name.slice(0, dot) : name;
    const sep = '....';

    let lo = 0, hi = base.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const half = Math.ceil(mid / 2);
      const rest = mid - half;
      const testStr = base.slice(0, half) + sep + base.slice(-rest) + ext;
      if (measureText(testStr) <= available) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }

    const half = Math.ceil(lo / 2);
    setTruncated(base.slice(0, half) + sep + base.slice(-(lo - half)) + ext);
  }, [name]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div ref={wrapperRef} className="responsive-file-name-wrapper" title={name}>
      <span ref={measureRef} className="responsive-file-name-measure" aria-hidden="true" />
      <span className="responsive-file-name-text">{truncated}</span>
    </div>
  );
};

const ContextMenuContent: React.FC<{
  contextMenu: ContextMenu;
  filteredFiles: FileItem[];
  selectedIds: string[];
  viewMode: 'list' | 'grid';
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  hasClipboard: boolean;
  isTrashView?: boolean;
  onFileOpen: (file: FileItem) => void;
  onQuickPreview: (file: FileItem) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onCopy: (fileId: string) => void;
  onCut: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onDuplicate: (fileId: string) => void;
  onRevealInFolder: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onPermanentDelete?: (fileId: string) => void;
  onEmptyTrash?: () => void;
  onBulkFavorite: (fileIds: string[], favorite: boolean) => void;
  onBulkDelete: (fileIds: string[]) => void;
  onCreateFolder: () => void;
  onPaste: () => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSort: (field: SortField) => void;
  onSelectAll: () => void;
  onContextMenuClose: () => void;
  setRenamingFile: (file: { id: string; name: string } | null) => void;
}> = ({
  contextMenu,
  filteredFiles,
  selectedIds,
  viewMode,
  sortField,
  hasClipboard,
  isTrashView,
  onFileOpen,
  onQuickPreview,
  onRenameFile,
  onCopy,
  onCut,
  onToggleFavorite,
  onDuplicate,
  onRevealInFolder,
  onDeleteFile,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onBulkFavorite,
  onBulkDelete,
  onCreateFolder,
  onPaste,
  onViewModeChange,
  onSort,
  onSelectAll,
  onContextMenuClose,
  setRenamingFile,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  return (
    <div
      className="desktop-context-menu surface-raised"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ----- EMPTY SPACE CONTEXT MENU ----- */}
      {contextMenu.fileId === null && (
        <>
          {isTrashView ? (
            <div className="menu-item danger" onClick={() => { onEmptyTrash?.(); onContextMenuClose(); }}>
              <FiTrash2 /> Empty Trash
            </div>
          ) : (
            <div className="menu-item" onClick={() => { onCreateFolder(); }}>
              <FiPlus /> New Folder
            </div>
          )}
          <div className="menu-divider" />
          <div className={`menu-item ${!isTrashView && !hasClipboard ? 'disabled' : ''}`} onClick={() => { if (!isTrashView && hasClipboard) { onPaste(); } }}>
            <FiClipboard /> Paste
          </div>
          <div className="menu-divider" />
          <div className="menu-item has-submenu" onClick={() => setActiveSubmenu(activeSubmenu === 'viewAs' ? null : 'viewAs')}>
            <FiEye /> View As
            <FiChevronRight className="submenu-indicator" />
            {activeSubmenu === 'viewAs' && (
              <div className="context-submenu" onClick={(e) => e.stopPropagation()}>
                <div className={`menu-item ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { onViewModeChange('list'); onContextMenuClose(); }}>List</div>
                <div className={`menu-item ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => { onViewModeChange('grid'); onContextMenuClose(); }}>Grid</div>
              </div>
            )}
          </div>
          <div className="menu-item has-submenu" onClick={() => setActiveSubmenu(activeSubmenu === 'sortBy' ? null : 'sortBy')}>
            <FiChevronUp /> Sort By
            <FiChevronRight className="submenu-indicator" />
            {activeSubmenu === 'sortBy' && (
              <div className="context-submenu" onClick={(e) => e.stopPropagation()}>
                <div className={`menu-item ${sortField === 'name' ? 'active' : ''}`} onClick={() => { onSort('name'); onContextMenuClose(); }}>Name</div>
                <div className={`menu-item ${sortField === 'modifiedAt' ? 'active' : ''}`} onClick={() => { onSort('modifiedAt'); onContextMenuClose(); }}>Date Modified</div>
                <div className={`menu-item ${sortField === 'size' ? 'active' : ''}`} onClick={() => { onSort('size'); onContextMenuClose(); }}>Size</div>
                <div className={`menu-item ${sortField === 'category' ? 'active' : ''}`} onClick={() => { onSort('category'); onContextMenuClose(); }}>Kind</div>
              </div>
            )}
          </div>
          <div className="menu-divider" />
          <div className="menu-item" onClick={() => { onSelectAll(); onContextMenuClose(); }}>
            <FiCheckSquare /> Select All
          </div>
          <div className="menu-item disabled">
            <FiEyeOff /> Show Hidden Files
          </div>
          <div className="menu-divider" />
          <div className="menu-item disabled">
            <FiTerminal /> Open in Terminal
          </div>
          <div className="menu-item disabled">
            <FiInfo /> Get Info
          </div>
        </>
      )}

      {/* ----- SINGLE-ITEM CONTEXT MENU ----- */}
      {contextMenu.fileId && selectedIds.length <= 1 && (
        <>
          {(() => {
            const file = filteredFiles.find(f => f.id === contextMenu.fileId);
            if (!file) return null;
            return (
              <>
                <div className="menu-item" onClick={() => { onFileOpen(file); onContextMenuClose(); }}>
                  <FiExternalLink /> Open
                </div>
                <div className="menu-item" onClick={() => { onQuickPreview(file); onContextMenuClose(); }}>
                  <FiEye /> Quick Preview
                </div>
                <div className="menu-item" onClick={() => {
                  setRenamingFile({ id: file.id, name: file.name });
                  onContextMenuClose();
                }}>
                  <FiEdit2 /> Rename
                </div>
                <div className="menu-divider" />
                <div className="menu-item" onClick={() => { onCopy(file.id); onContextMenuClose(); }}>
                  <FiCopy /> Copy
                </div>
                <div className="menu-item" onClick={() => { onCut(file.id); onContextMenuClose(); }}>
                  <FiMove /> Cut
                </div>
                <div className="menu-divider" />
                <div className="menu-item" onClick={() => { onToggleFavorite(file.id); onContextMenuClose(); }}>
                  <FiStar /> {file.isFavorite ? 'Unfavorite' : 'Favorite'}
                </div>
                <div className="menu-item" onClick={() => { onDuplicate(file.id); }}>
                  <FiCopy /> Duplicate
                </div>
                <div className="menu-item disabled">
                  <FiMove /> Move To...
                </div>
                <div className="menu-item disabled">
                  <FiPackage /> Compress
                </div>
                <div className="menu-divider" />
                <div className="menu-item" onClick={() => { onRevealInFolder(file); }}>
                  <FiFolder /> Reveal in Parent Folder
                </div>
                <div className="menu-item disabled">
                  <FiInfo /> Get Info
                </div>
                <div className="menu-divider" />
                {isTrashView ? (
                  <>
                    <div className="menu-item" onClick={() => { onRestore?.(file.id); onContextMenuClose(); }}>
                      <FiTrash2 /> Restore
                    </div>
                    <div className="menu-item danger" onClick={() => { onPermanentDelete?.(file.id); onContextMenuClose(); }}>
                      <FiTrash2 /> Delete Forever
                    </div>
                  </>
                ) : (
                  <div className="menu-item danger" onClick={() => { onDeleteFile(file.id); onContextMenuClose(); }}>
                    <FiTrash2 /> Delete
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}

      {/* ----- MULTI-SELECTION CONTEXT MENU ----- */}
      {contextMenu.fileId && selectedIds.length > 1 && (
        <>
          <div className="menu-item disabled">
            <FiExternalLink /> Open
          </div>
          <div className="menu-divider" />
          {isTrashView ? (
            <>
              <div className="menu-item" onClick={() => { selectedIds.forEach(id => onRestore?.(id)); onContextMenuClose(); }}>
                <FiTrash2 /> Restore Selected
              </div>
              <div className="menu-item danger" onClick={() => { selectedIds.forEach(id => onPermanentDelete?.(id)); onContextMenuClose(); }}>
                <FiTrash2 /> Delete Forever
              </div>
            </>
          ) : (
            <>
              <div className="menu-item" onClick={() => { onBulkFavorite(selectedIds, true); onContextMenuClose(); }}>
                <FiStar /> Favorite Selected
              </div>
              <div className="menu-item disabled">
                <FiMove /> Move Selected
              </div>
              <div className="menu-item disabled">
                <FiPackage /> Compress Selected
              </div>
              <div className="menu-divider" />
              <div className="menu-item danger" onClick={() => { onBulkDelete(selectedIds); onContextMenuClose(); }}>
                <FiTrash2 /> Delete Selected
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export const MainContent: React.FC<MainContentProps> = ({
  filteredFiles,
  selectedIds,
  sortField,
  sortDirection,
  error,
  contextMenu,
  viewMode,
  onFileClick,
  onFileDoubleClick,
  onContextMenu,
  onSort,
  onToggleFavorite,
  onBulkDelete,
  onBulkFavorite,
  onDeleteFile,
  onRenameFile,
  onSelectAll,
  onClearSelection,
  onFixConfig,
  onContextMenuClose,
  onFileOpen,
  onViewModeChange,
  onQuickPreview,
  onRevealInFolder,
  onCopy,
  onCut,
  onPaste,
  hasClipboard,
  onCreateFolder,
  onDuplicate,
  isTrashView,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onSelectionChange,
  renamingFile,
  setRenamingFile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startIndex: number; isDragging: boolean } | null>(null);

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.action-btn, .file-list-header, .trash-action-bar, .file-card-favorite')) return;
    if (e.shiftKey || e.ctrlKey || e.metaKey) return;

    const row = target.closest<HTMLElement>('[data-index]');
    if (row) {
      dragRef.current = { startIndex: parseInt(row.dataset.index || '0', 10), isDragging: false };
    } else {
      onClearSelection();
      dragRef.current = { startIndex: -1, isDragging: false };
    }
  }, [onClearSelection]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const row = el?.closest<HTMLElement>('[data-index]');
    if (!row) return;

    const currentIndex = parseInt(row.dataset.index || '0', 10);
    const { startIndex } = dragRef.current;

    if (currentIndex === startIndex) {
      if (!dragRef.current.isDragging) return;
      onSelectionChange([filteredFiles[startIndex]?.id].filter(Boolean));
      return;
    }

    dragRef.current.isDragging = true;

    const lo = Math.min(startIndex, currentIndex);
    const hi = Math.max(startIndex, currentIndex);
    const ids = filteredFiles.slice(lo, hi + 1).map(f => f.id);
    onSelectionChange(ids);
  }, [filteredFiles, onSelectionChange]);

  const handleContainerMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
  }, []);

  const handleContainerDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const [renameInputValue, setRenameInputValue] = useState('');
  const [renameExtConfirm, setRenameExtConfirm] = useState<{ oldExt: string; newExt: string; newName: string } | null>(null);

  useEffect(() => {
    if (renamingFile) setRenameInputValue(renamingFile.name);
  }, [renamingFile]);

  const handleRenameSubmit = useCallback(() => {
    if (!renamingFile) return;
    const newName = renameInputValue.trim();
    if (!newName || newName === renamingFile.name) {
      setRenamingFile(null);
      return;
    }
    const oldDot = renamingFile.name.lastIndexOf('.');
    const newDot = newName.lastIndexOf('.');
    const oldExt = oldDot > 0 ? renamingFile.name.slice(oldDot) : '';
    const newExt = newDot > 0 ? newName.slice(newDot) : '';
    if (oldExt && newExt && oldExt !== newExt) {
      setRenameExtConfirm({ oldExt, newExt, newName });
    } else {
      onRenameFile(renamingFile.id, newName);
      setRenamingFile(null);
    }
  }, [renamingFile, renameInputValue, onRenameFile, setRenamingFile]);
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  return (
    <main className="explorer-main">
      {/* File List Header - Only show in list view */}
      {viewMode === 'list' && (
        <div className="file-list-header">
          <div className="col-name clickable" onClick={() => onSort('name')}>
            Name {renderSortIcon('name')}
          </div>
          <div
            className="col-date clickable"
            onClick={() => onSort('modifiedAt')}
          >
            Date Modified {renderSortIcon('modifiedAt')}
          </div>
          <div className="col-size clickable" onClick={() => onSort('size')}>
            Size {renderSortIcon('size')}
          </div>
          <div className="col-actions"></div>
          <div className="col-kind clickable" onClick={() => onSort('category')}>
            Kind {renderSortIcon('category')}
          </div>
        </div>
      )}

      {/* Trash action bar */}
      {isTrashView && filteredFiles.length > 0 && (
        <div className="trash-action-bar">
          <span className="trash-action-info">{filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''} in Trash</span>
          <button className="btn-empty-trash" onClick={() => onEmptyTrash?.()}>
            <FiTrash2 /> Empty Trash
          </button>
        </div>
      )}

      {/* File Items Container */}
      <div 
        ref={containerRef}
        className={`file-items-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClearSelection();
            onContextMenuClose();
          }
        }}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            onContextMenu(e, null);
          }
        }}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onDragStart={handleContainerDragStart}
      >
        {error ? (
          <div className="empty-state-explorer error-state">
            <div className="empty-icon-wrapper danger">
              <FiAlertCircle className="empty-icon" />
            </div>
            <h3>Configuration Error</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-fix-config" onClick={onFixConfig}>
                Fix Folder Settings
              </button>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="empty-state-explorer">
            <div className="empty-icon-wrapper">
              {isTrashView ? <FiTrash2 className="empty-icon" /> : <FiFolder className="empty-icon" />}
            </div>
            <h3>{isTrashView ? 'Trash is empty' : 'No items found'}</h3>
            <p>{isTrashView ? 'Deleted items will appear here' : 'Try adjusting your search or filters'}</p>
          </div>
        ) : (
          filteredFiles.map((file, index) => {
            const Icon = getFileIcon(file.category, file.name, file.isFolder);
            const isSelected = selectedIds.includes(file.id);

            if (viewMode === 'grid') {
              // Grid View Card
              return (
                <div
                  key={file.id}
                  data-index={index}
                  className={`file-card ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => onFileClick(file, e)}
                  onDoubleClick={() => onFileDoubleClick(file)}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    onContextMenu(e, file.id);
                  }}
                >
                  <div className="file-card-thumbnail">
                    <Icon className={getIconClassName(file.category, file.isFolder)} />
                  </div>
                  <div className="file-card-content">
                    <div className="file-card-name">{file.name}</div>
                    {file.status && file.status !== 'Safe' && (
                      <span className={`file-badge badge-${file.status.toLowerCase()}`}>
                        {file.status}
                      </span>
                    )}
                    <div className="file-card-meta">
                      <span className="file-card-type">{file.isFolder ? 'Folder' : (file.extension || 'File').toUpperCase()}</span>
                      <span className="file-card-size">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`file-card-favorite ${file.isFavorite ? 'active' : ''}`}
                    title="Favorite"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(file.id);
                    }}
                  >
                    <FiStar className={file.isFavorite ? 'filled' : ''} />
                  </button>
                </div>
              );
            } else {
              // List View Row
              return (
                <div
                  key={file.id}
                  data-index={index}
                  className={`file-row ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => onFileClick(file, e)}
                  onDoubleClick={() => onFileDoubleClick(file)}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    onContextMenu(e, file.id);
                  }}
                >
                  <div className="col-name">
                    <div className="file-info-cell">
                      <span className="file-icon-wrapper">
                        <Icon
                          className={getIconClassName(
                            file.category,
                            file.isFolder
                          )}
                        />
                      </span>
                      <div className="file-name-wrapper">
                        <ResponsiveFileName name={file.name} />
                        {file.status && file.status !== 'Safe' && (
                          <span
                            className={`file-badge badge-${file.status.toLowerCase()}`}
                          >
                            {file.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-date">{formatDate(file.modifiedAt)}</div>
                  <div className="col-size">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-actions">
                    <button
                      className={`action-btn ${file.isFavorite ? 'active' : ''}`}
                      title="Favorite"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(file.id);
                      }}
                    >
                      <FiStar className={file.isFavorite ? 'filled' : ''} />
                    </button>
                  </div>
                  <div className="col-kind">{file.isFolder ? 'Folder' : (file.extension || 'File').toUpperCase()}</div>
                </div>
              );
            }
          })
        )}
      </div>

      {/* Selection Toolbar */}
      {selectedIds.length > 0 && (
        <div className="selection-toolbar surface-raised">
          <div className="selection-info">
            <span className="selected-count">
              {selectedIds.length} items selected
            </span>
            <button
              className="btn-clear-selection"
              onClick={() => onClearSelection()}
            >
              <FiX />
            </button>
          </div>
          <div className="selection-actions">
            {isTrashView ? (
              <>
                <button
                  className="toolbar-btn"
                  onClick={() => { selectedIds.forEach(id => onRestore?.(id)); onClearSelection(); }}
                >
                  <FiTrash2 /> Restore
                </button>
                <button
                  className="toolbar-btn danger"
                  onClick={() => { selectedIds.forEach(id => onPermanentDelete?.(id)); onClearSelection(); }}
                >
                  <FiTrash2 /> Delete Forever
                </button>
              </>
            ) : (
              <>
                <button
                  className="toolbar-btn"
                  onClick={() => onBulkFavorite(selectedIds, true)}
                >
                  <FiStar /> Favorite
                </button>
                <button className="toolbar-btn">
                  <FiMove /> Move
                </button>
                <button className="toolbar-btn">
                  <FiPackage /> Compress
                </button>
                <button
                  className="toolbar-btn danger"
                  onClick={() => onBulkDelete(selectedIds)}
                >
                  <FiTrash2 /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenuContent
          key={`${contextMenu.x}-${contextMenu.y}-${contextMenu.fileId}`}
          contextMenu={contextMenu}
          filteredFiles={filteredFiles}
          selectedIds={selectedIds}
          viewMode={viewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          hasClipboard={hasClipboard}
          isTrashView={isTrashView}
          onFileOpen={onFileOpen}
          onQuickPreview={onQuickPreview}
          onRenameFile={onRenameFile}
          onCopy={onCopy}
          onCut={onCut}
          onToggleFavorite={onToggleFavorite}
          onDuplicate={onDuplicate}
          onRevealInFolder={onRevealInFolder}
          onDeleteFile={onDeleteFile}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          onEmptyTrash={onEmptyTrash}
          onBulkFavorite={onBulkFavorite}
          onBulkDelete={onBulkDelete}
          onCreateFolder={onCreateFolder}
          onPaste={onPaste}
          onViewModeChange={onViewModeChange}
          onSort={onSort}
          onSelectAll={onSelectAll}
          onContextMenuClose={onContextMenuClose}
          setRenamingFile={setRenamingFile}
        />
      )}

      {/* Rename Dialog */}
      {renamingFile && !renameExtConfirm && (
        <div className="rename-overlay" onClick={() => { setRenamingFile(null); setRenameInputValue(''); }}>
          <div className="rename-dialog" onClick={e => e.stopPropagation()}>
            <h3>Rename</h3>
            <input
              type="text"
              value={renameInputValue}
              onChange={e => setRenameInputValue(e.target.value)}
              autoFocus
              onFocus={e => {
                const dot = renamingFile.name.lastIndexOf('.');
                if (dot > 0) e.target.setSelectionRange(dot, dot);
                else e.target.select();
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') { setRenamingFile(null); setRenameInputValue(''); }
              }}
            />
            <div className="rename-actions">
              <button onClick={() => { setRenamingFile(null); setRenameInputValue(''); }}>Cancel</button>
              <button className="rename-confirm" onClick={handleRenameSubmit}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* Extension change confirmation */}
      {renamingFile && renameExtConfirm && (
        <div className="rename-overlay">
          <div className="rename-dialog" onClick={e => e.stopPropagation()}>
            <h3>Change extension?</h3>
            <p className="rename-ext-warning">
              Are you sure you want to change the file extension from <strong>.{renameExtConfirm.oldExt}</strong> to <strong>.{renameExtConfirm.newExt}</strong>?
            </p>
            <div className="rename-actions">
              <button onClick={() => { setRenameExtConfirm(null); }}>Cancel</button>
              <button className="rename-confirm" onClick={() => {
                onRenameFile(renamingFile.id, renameExtConfirm.newName);
                setRenamingFile(null);
                setRenameExtConfirm(null);
                setRenameInputValue('');
              }}>Change Extension</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
