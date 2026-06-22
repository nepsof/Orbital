'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { FileItem } from '../files/context/FilesContext';
import { joinPaths } from '../files/utils/path-utils';
import { formatFileSize, formatDate } from '../files/utils/file-formatters';
import { MonitoredFolder } from '../folder-monitoring/types';
import './file-preview.css';

interface FilePreviewProps {
  file: FileItem;
  allFiles: FileItem[];
  fileList: FileItem[];
  monitoredFolders?: MonitoredFolder[];
  onClose: () => void;
  onNavigate: (file: FileItem) => void;
}

const previewUrl = (file: FileItem) => {
  const realPath = (file as any).realPath as string | undefined;
  if (realPath) return `/api/files/preview?path=${encodeURIComponent(realPath)}`;
  const fullPath = joinPaths(file.path, file.name);
  return `/api/files/preview?path=${encodeURIComponent(fullPath)}`;
};

const TEXT_EXTS = new Set([
  '.txt', '.md', '.csv',
  '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',
  '.js', '.ts', '.jsx', '.tsx',
  '.html', '.css', '.scss', '.less',
  '.py', '.java', '.c', '.cpp', '.h', '.hpp',
  '.rb', '.php', '.go', '.rs', '.swift', '.kt',
  '.sh', '.bash', '.zsh', '.ps1',
  '.sql', '.r', '.lua', '.pl',
  '.log', '.env', '.gitignore', '.dockerignore',
]);

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.flac', '.ogg', '.aac', '.wma']);

const ext = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i).toLowerCase() : '';
};

type PreviewKind = 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'folder' | 'unsupported';

const previewKind = (file: FileItem): PreviewKind => {
  if (file.isFolder) return 'folder';
  const e = ext(file.name);
  if (IMAGE_EXTS.has(e)) return 'image';
  if (VIDEO_EXTS.has(e)) return 'video';
  if (AUDIO_EXTS.has(e)) return 'audio';
  if (e === '.pdf') return 'pdf';
  if (TEXT_EXTS.has(e)) return 'document';
  return 'unsupported';
};

const useTextContent = (url: string | null) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) { setContent(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then(text => { if (!cancelled) { setContent(text); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { content, loading, error };
};

interface FolderChild {
  id: string;
  name: string;
  isFolder: boolean;
  size: number;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, allFiles, fileList, monitoredFolders, onClose, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(() => fileList.findIndex(f => f.id === file.id));
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [folderChildren, setFolderChildren] = useState<FolderChild[]>([]);
  const [folderLoading, setFolderLoading] = useState(false);

  const kind = previewKind(file);
  const url = kind !== 'folder' ? previewUrl(file) : null;
  const { content: textContent, loading: textLoading, error: textError } = useTextContent(
    kind === 'document' ? url : null
  );

  useEffect(() => {
    setCurrentIndex(fileList.findIndex(f => f.id === file.id));
    setImgLoaded(false);
    setImgError(false);
  }, [file.id, fileList]);

  useEffect(() => {
    if (!file.isFolder) { setFolderChildren([]); return; }

    const real = (file as any).realPath as string | undefined;
    if (real) {
      setFolderLoading(true);
      fetch(`/api/files/list?path=${encodeURIComponent(real)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFolderChildren(data.map((f: any) => ({
              id: f.id || f.name,
              name: f.name,
              isFolder: f.isFolder || false,
              size: f.size || 0,
            })));
          }
          setFolderLoading(false);
        })
        .catch(() => setFolderLoading(false));
      return;
    }

    const folder = monitoredFolders?.find(m => m.name === file.name);
    if (folder) {
      setFolderLoading(true);
      fetch(`/api/files/list?path=${encodeURIComponent(folder.path)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFolderChildren(data.map((f: any) => ({
              id: f.id || f.name,
              name: f.name,
              isFolder: f.isFolder || false,
              size: f.size || 0,
            })));
          }
          setFolderLoading(false);
        })
        .catch(() => setFolderLoading(false));
      return;
    }

    const children = allFiles.filter(f => f.path === joinPaths(file.path, file.name) && f.name !== file.name);
    setFolderChildren(children.map(f => ({ id: f.id, name: f.name, isFolder: !!f.isFolder, size: f.size })));
  }, [file, allFiles, monitoredFolders]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(fileList[currentIndex - 1]);
  }, [currentIndex, fileList, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < fileList.length - 1) onNavigate(fileList[currentIndex + 1]);
  }, [currentIndex, fileList, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); handlePrev(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); handleNext(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderLoading = () => (
    <div className="fp-loading">
      <div className="fp-spinner" />
    </div>
  );

  const renderContent = () => {
    if (kind === 'folder') {
      return (
        <div className="fp-folder-content">
          <div className="fp-folder-header">
            <span className="fp-folder-icon">📁</span>
            <span className="fp-folder-name">{file.name}</span>
          </div>
          <div className="fp-folder-meta">
            <span>{folderChildren.length} item{folderChildren.length !== 1 ? 's' : ''}</span>
            <span>Modified {formatDate(file.modifiedAt)}</span>
          </div>
          <div className="fp-folder-list">
            {folderLoading ? (
              renderLoading()
            ) : folderChildren.length === 0 ? (
              <div className="fp-empty-folder">Empty folder</div>
            ) : (
              folderChildren.map(child => (
                <div key={child.id} className="fp-folder-item">
                  <span className="fp-item-icon">{child.isFolder ? '📁' : '📄'}</span>
                  <span className="fp-item-name">{child.name}</span>
                  <span className="fp-item-size">{child.isFolder ? '--' : formatFileSize(child.size)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (kind === 'image') {
      return (
        <div className="fp-image-container">
          {!imgLoaded && !imgError && renderLoading()}
          {imgError ? (
            <div className="fp-preview-na">
              <span className="fp-na-icon">🖼️</span>
              <span className="fp-na-text">Preview not available</span>
            </div>
          ) : (
            <img
              src={url!}
              alt={file.name}
              className={`fp-image ${imgLoaded ? 'fp-image-loaded' : ''}`}
              draggable={false}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
        </div>
      );
    }

    if (kind === 'video') {
      return (
        <div className="fp-video-container">
          <video src={url!} className="fp-video" controls autoPlay />
        </div>
      );
    }

    if (kind === 'audio') {
      return (
        <div className="fp-audio-container">
          <div className="fp-generic-icon">🎵</div>
          <div className="fp-audio-label">{file.name}</div>
          <audio src={url!} controls autoPlay className="fp-audio" />
        </div>
      );
    }

    if (kind === 'pdf') {
      return (
        <div className="fp-pdf-container">
          <iframe src={url!} className="fp-pdf" title={file.name} />
        </div>
      );
    }

    if (kind === 'document') {
      if (textLoading) return renderLoading();
      if (textError) {
        return (
          <div className="fp-preview-na">
            <span className="fp-na-icon">📄</span>
            <span className="fp-na-text">Preview not available</span>
          </div>
        );
      }
      return (
        <div className="fp-document-container">
          <pre className="fp-document-pre">{textContent}</pre>
        </div>
      );
    }

    return (
      <div className="fp-preview-na">
        <span className="fp-na-icon">📄</span>
        <span className="fp-na-text">Preview not available</span>
        <span className="fp-na-sub">{file.name}</span>
      </div>
    );
  };

  return (
    <div className="fp-overlay" onClick={handleBackdropClick}>
      <div className="fp-modal">
        <div className="fp-header">
          <span className="fp-title" title={file.name}>{file.name}</span>
          <div className="fp-header-right">
            {kind !== 'unsupported' && (
              <span className="fp-kind-badge">{kind === 'folder' ? 'Folder' : kind === 'document' ? 'Document' : kind === 'pdf' ? 'PDF' : kind.charAt(0).toUpperCase() + kind.slice(1)}</span>
            )}
            <span className="fp-counter">
              {currentIndex !== -1 ? `${currentIndex + 1} / ${fileList.length}` : ''}
            </span>
            <button className="fp-close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>
        <div className="fp-body">
          {kind !== 'unsupported' && currentIndex > 0 && (
            <button className="fp-nav-btn fp-nav-prev" onClick={handlePrev} title="Previous (↑)">
              ‹
            </button>
          )}
          {renderContent()}
          {kind !== 'unsupported' && currentIndex < fileList.length - 1 && (
            <button className="fp-nav-btn fp-nav-next" onClick={handleNext} title="Next (↓)">
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
