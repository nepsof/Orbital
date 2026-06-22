'use client';

import React, { useCallback } from 'react';
import {
  FiFolder,
  FiFileText,
  FiImage,
  FiVideo,
  FiStar,
  FiMusic,
  FiAlertCircle,
  FiCopy,
  FiPackage,
  FiTrash2,
} from 'react-icons/fi';
import { FileItem } from '../files/context/FilesContext';
import { joinPaths } from '../files/utils/path-utils';
import './left-sidebar.css';

const SidebarFolderItem: React.FC<{
  folder: FileItem;
  currentPath: string;
  onNavigate: (path: string, name: string) => void;
}> = ({ folder, currentPath, onNavigate }) => {
  const isActive = currentPath === joinPaths(folder.path, folder.name);

  return (
    <div
      className={`tree-item ${isActive ? 'active' : ''}`}
      style={{ paddingLeft: '8px' }}
      onClick={() => onNavigate(joinPaths(folder.path, folder.name), folder.name)}
    >
      <FiFolder className="folder-icon" />
      <span className="folder-name">{folder.name}</span>
    </div>
  );
};

interface LeftSidebarProps {
  currentPath: string;
  currentFilter: string;
  files: FileItem[];
  monitoredFolders: Array<{ id: string; name: string; lastScan: string }>;
  onNavigate: (path: string, name: string) => void;
  onFilterClick: (filter: string) => void;
  onMyFilesClick: () => void;
  trashCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentPath,
  currentFilter,
  files,
  monitoredFolders,
  onNavigate,
  onFilterClick,
  onMyFilesClick,
  trashCount,
}) => {
  const handleFilterClick = useCallback(
    (filterName: string, e: React.MouseEvent) => {
      e.preventDefault();
      onFilterClick(filterName);
    },
    [onFilterClick]
  );

  const handleFolderClick = useCallback(
    (path: string, e: React.MouseEvent) => {
      e.preventDefault();
      const name = path.split('/').pop() || path;
      onNavigate(path, name);
    },
    [onNavigate]
  );

  return (
    <aside className="explorer-sidebar">
      {/* Logo Section */}
      <div className="sidebar-section">
        

        {/* Navigation */}
        <h4 className="section-title">Navigation</h4>
        <nav className="folder-list">
          <div
            className={`tree-item ${currentPath === '/' ? 'active' : ''}`}
            style={{ paddingLeft: '8px', marginBottom: '4px' }}
            onClick={onMyFilesClick}
          >
            <FiPackage
              className="folder-icon"
              style={{ color: 'var(--brand-primary)' }}
            />
            <span
              className="folder-name"
              style={{
                fontWeight: currentPath === '/' ? '600' : '400',
              }}
            >
              My Files
            </span>
          </div>

          {monitoredFolders.length === 0 ? (
            <div className="empty-sidebar-msg">No folders monitored</div>
          ) : (
            monitoredFolders.map((mFolder) => {
              const folderItem = files.find(
                (f) =>
                  f.isFolder &&
                  f.path === '/' &&
                  f.name === mFolder.name
              );

              if (!folderItem) {
                const virtualFolder: FileItem = {
                  id: mFolder.id,
                  name: mFolder.name,
                  extension: '',
                  path: '/',
                  category: 'Folder',
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
                  status: 'Safe',
                };

                return (
                  <SidebarFolderItem
                    key={mFolder.id}
                    folder={virtualFolder}
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                  />
                );
              }

              return (
                <SidebarFolderItem
                  key={mFolder.id}
                  folder={folderItem}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                />
              );
            })
          )}
        </nav>
      </div>

      {/* Smart Filters */}
      <div className="sidebar-section">
        <h4 className="section-title">Smart Filters</h4>
        <nav className="filter-list">
          <a
            href="#"
            className={`filter-item ${currentFilter === 'videos' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('videos', e)}
          >
            <FiVideo className="icon-video" /> Videos
          </a>
          <a
            href="#"
            className={`filter-item ${currentFilter === 'images' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('images', e)}
          >
            <FiImage className="icon-image" /> Images
          </a>
          <a
            href="#"
            className={`filter-item ${currentFilter === 'files' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('files', e)}
          >
            <FiFileText /> Files
          </a>
          <a
            href="#"
            className={`filter-item ${currentFilter === 'audio' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('audio', e)}
          >
            <FiMusic className="icon-audio" /> Audio
          </a>
          <a
            href="#"
            className={`filter-item ${currentFilter === 'large' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('large', e)}
          >
            <FiAlertCircle className="icon-danger" /> Large Files
          </a>
          <a
            href="#"
            className={`filter-item ${currentFilter === 'duplicates' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('duplicates', e)}
          >
            <FiCopy className="icon-warning" /> Duplicates
          </a>
        </nav>
      </div>

      {/* Favorites */}
      <div className="sidebar-section">
        <h4 className="section-title">Favorites</h4>
        <nav className="filter-list">
          <a
            href="#"
            className={`filter-item ${currentFilter === 'favorites' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('favorites', e)}
          >
            <FiStar className="icon-warning" /> Favorite Files
          </a>
          {files
            .filter((f) => f.isFavorite && f.isFolder)
            .map((folder) => (
              <a
                key={folder.id}
                href="#"
                className={`filter-item ${
                  currentPath === joinPaths(folder.path, folder.name)
                    ? 'active'
                    : ''
                }`}
                onClick={(e) =>
                  handleFolderClick(
                    joinPaths(folder.path, folder.name),
                    e
                  )
                }
              >
                <FiFolder className="icon-folder" /> {folder.name}
              </a>
            ))}
        </nav>
      </div>

      {/* Trash */}
      <div className="sidebar-section">
        <h4 className="section-title">Trash</h4>
        <nav className="filter-list">
          <a
            href="#"
            className={`filter-item ${currentFilter === 'trash' ? 'active' : ''}`}
            onClick={(e) => handleFilterClick('trash', e)}
          >
            <FiTrash2 className="icon-danger" />
            <span>Trash</span>
            {trashCount > 0 && (
              <span className="trash-badge">{trashCount}</span>
            )}
          </a>
        </nav>
      </div>
    </aside>
  );
};
