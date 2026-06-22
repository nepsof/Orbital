'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './spotlight.module.css';
import searchService from '../services/searchService';

export interface FileItem {
  _id: string;
  name: string;
  type: string;
  path: string;
}

export interface Settings {
  monitoredFolders?: string[];
}

interface SpotlightProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  name: string;
  path: string;
  type: string;
  category: string;
  score: number;
  icon?: string;
  isDirectory?: boolean;
}

export default function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleOpenFile = useCallback(async (file: SearchResultItem) => {
    try {
      await searchService.openFile(file.path);
      onClose();
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [onClose]);

  const handleOpenFileInPath = useCallback(async (file: SearchResultItem) => {
    try {
      await searchService.showInFolder(file.path);
      onClose();
    } catch (error) {
      console.error('Failed to show file in folder:', error);
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          handleOpenFileInPath(results[selectedIndex]);
        } else {
          handleOpenFile(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onClose, handleOpenFile, handleOpenFileInPath]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }

    if (!open) {
      const timer = setTimeout(() => {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await searchService.search(query.trim(), 20);
        if (res.data) {
          const data = res.data as unknown as { data: SearchResultItem[]; meta: { total: number; webFallback: boolean } };
          const items = data.data || [];
          setResults(items);
          setSelectedIndex(0);

          if (data.meta?.webFallback && items.length === 0) {
            await searchService.webFallback(query.trim());
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll(`.${styles.resultItem}`);
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search apps, files, folders..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <div className={styles.spinner}></div>}
        </div>

        {results.length > 0 && (
          <div className={styles.results} ref={resultsRef}>
            {results.map((file, index) => (
              <div
                key={file.id}
                className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => handleOpenFile(file)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.fileIcon}>
                  {file.icon || getFileIcon(file.type)}
                </div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.categoryBadge}>{file.category}</span>
                    <span className={styles.filePath}>{file.path}</span>
                  </div>
                </div>
                <div className={styles.enterHint}>
                  <kbd>↵</kbd>
                </div>
              </div>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className={styles.noResults}>
            No results found for &quot;{query}&quot;
          </div>
        )}

        <div className={styles.footer}>
          <div key="navigate" className={styles.hint}>
            <kbd>↑↓</kbd> to navigate
          </div>
          <div key="open" className={styles.hint}>
            <kbd>↵</kbd> to open
          </div>
          <div key="open-path" className={styles.hint}>
            <kbd>⇧↵</kbd> to open in path
          </div>
          <div key="close" className={styles.hint}>
            <kbd>esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
    Applications: '🧩',
    application: '🧩',
    Images: '🖼️',
    Videos: '🎬',
    Audio: '🎵',
    Documents: '📄',
    Folders: '📁',
    folder: '📁',
    Archives: '📦',
    Code: '⚡',
    Files: '📄',
    Other: '📄',
  };
  return icons[type] || '📄';
}
