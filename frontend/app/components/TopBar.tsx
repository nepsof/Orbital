'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FiChevronRight,
  FiPackage,
  FiSun,
  FiMoon,
  FiMonitor,
  FiSettings,
  FiLogOut,
  FiX,
  FiMenu,
  FiLoader,
} from 'react-icons/fi';
import { AiOutlineUser } from 'react-icons/ai';
import { GiFastBackwardButton, GiFastForwardButton } from 'react-icons/gi';
import { FiTrash2 } from 'react-icons/fi';
import { FaList, FaSearch } from 'react-icons/fa';
import { LuBlocks } from 'react-icons/lu';
import { useTheme } from './ThemeProvider';
import Image from 'next/image';

interface TopBarProps {
  filteredFilesCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onOrganize: () => void;
  onOrganizeDisabled: boolean;
  isOrganizing?: boolean;
  profileName: string;
  profileEmail: string;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  isTrashView?: boolean;
  onEmptyTrash?: () => void;
}

// Dropdown content for the responsive menu (used on small screens)
const ResponsiveDropdownMenu: React.FC<{
  filteredFilesCount: number;
  onOrganize: () => void;
  onOrganizeDisabled: boolean;
  isOrganizing?: boolean;
  profileName: string;
  profileEmail: string;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  isTrashView?: boolean;
  onEmptyTrash?: () => void;
  onClose: () => void;
}> = ({
  filteredFilesCount,
  onOrganize,
  onOrganizeDisabled,
  profileName,
  profileEmail,
  viewMode,
  onViewModeChange,
  isTrashView,
  onEmptyTrash,
  onClose,
}) => {
  const { settings, updateSettings } = useTheme();
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);

  return (
    <div className="responsive-dropdown-menu surface-raised">
      {/* Profile section */}
      <div className="dropdown-menu-item profile-item">
        <div className="profile-info">
          <div className="profile-avatar-small">
            <AiOutlineUser />
          </div>
          <div>
            <div className="profile-name">{profileName}</div>
            <div className="profile-email">{profileEmail}</div>
          </div>
        </div>
        <button
          className="dropdown-submenu-toggle"
          onClick={() => setShowThemeSubmenu(!showThemeSubmenu)}
        >
          <FiChevronRight />
        </button>
      </div>

      {showThemeSubmenu && (
        <div className="dropdown-submenu">
          <div className="dropdown-submenu-header">Theme mode</div>
          <div className="theme-switcher-row">
            <button className={`theme-switcher-button ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'light' })}><FiSun /></button>
            <button className={`theme-switcher-button ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'dark' })}><FiMoon /></button>
            <button className={`theme-switcher-button ${settings.theme === 'system' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'system' })}><FiMonitor /></button>
          </div>
        </div>
      )}

      <div className="dropdown-divider" />

      {isTrashView ? (
        <div className="dropdown-menu-item" onClick={() => { onEmptyTrash?.(); onClose(); }}>
          <FiTrash2 /> Empty Trash
        </div>
      ) : (
        <div className="dropdown-menu-item" onClick={() => { onOrganize(); onClose(); }} style={{ opacity: onOrganizeDisabled ? 0.5 : 1, pointerEvents: onOrganizeDisabled ? 'none' : 'auto' }}>
          <FiPackage /> Organize Folder
        </div>
      )}

      <div className={`dropdown-menu-item ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { onViewModeChange('list'); onClose(); }}>
        <FaList /> View as List {viewMode === 'list' && '✓'}
      </div>

      <div className={`dropdown-menu-item ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => { onViewModeChange('grid'); onClose(); }}>
        <LuBlocks /> View as Grid {viewMode === 'grid' && '✓'}
      </div>

      <div className="dropdown-divider" />
      <div className="dropdown-menu-item disabled">{filteredFilesCount} items</div>
      <div className="dropdown-divider" />

      <div className="dropdown-menu-item" onClick={() => { window.location.href = '/settings'; onClose(); }}><FiSettings /> Settings</div>
      <div className="dropdown-menu-item logout" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}><FiLogOut /> Logout</div>
    </div>
  );
};

export const TopBar: React.FC<TopBarProps> = ({
  filteredFilesCount,
  searchQuery,
  onSearchChange,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  onOrganize,
  onOrganizeDisabled,
  isOrganizing = false,
  profileName,
  profileEmail,
  viewMode,
  onViewModeChange,
  isTrashView,
  onEmptyTrash,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-focus search when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close search when clicking outside (only if empty)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchQuery.trim() === ''
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchExpanded, searchQuery]);

  // Close menu when clicking outside or window loses focus
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handleBlur = () => setIsMenuOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMenuOpen]);

  // Close profile dropdown when clicking outside or window loses focus
  useEffect(() => {
    if (!showProfileDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current?.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };
    const handleBlur = () => setShowProfileDropdown(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleBlur);
    };
  }, [showProfileDropdown]);

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
  };

  const { settings, updateSettings } = useTheme();

  return (
    <div className="explorer-topbar">
      {/* Logo section - always first */}
      <div className="logo-section">
        <div className="logo-container">
          <div className="logo">
            <Image src="/logo.png" alt="Orbital Logo" className="navbar-logo-img" width={36} height={36} priority />
          </div>
          <div className="brand-text">
            <h1>Orbital</h1>
            <p>Intelligent File System</p>
          </div>
        </div>
      </div>

      {/* Back/Forward buttons - now after logo */}
      <div className="nav-buttons-always">
        <button className="nav-button" onClick={onBack} disabled={!canGoBack}>
          <GiFastBackwardButton />
        </button>
        <button className="nav-button" onClick={onForward} disabled={!canGoForward}>
          <GiFastForwardButton />
        </button>
      </div>

      {/* Desktop controls (hidden on small screens) */}
      <div className="desktop-controls">
        <div className="view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => onViewModeChange('list')}>
            <FaList />
          </button>
          <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => onViewModeChange('grid')}>
            <LuBlocks />
          </button>
        </div>
        {!isSearchExpanded && (
          isTrashView ? (
            <button className="btn-organize-toolbar danger" onClick={onEmptyTrash}>
              <FiTrash2 /> <span>Empty Trash</span>
            </button>
          ) : (
            <button className="btn-organize-toolbar" onClick={onOrganize} disabled={onOrganizeDisabled}>
              {isOrganizing ? (
                <>
                  <FiLoader className="animate-spin" /> <span>Organizing...</span>
                </>
              ) : (
                <>
                  <FiPackage /> <span>Organize Folder</span>
                </>
              )}
            </button>
          )
        )}

        {/* Profile button with dropdown */}
        <div className="profile-container">
          <button
            ref={profileButtonRef}
            className="profile-button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <AiOutlineUser className="profile-icon" />
            <span>{profileName}</span>
          </button>
          {showProfileDropdown && (
            <div className="profile-dropdown surface-raised" ref={profileDropdownRef}>
              <div className="profile-dropdown-header">
                <div className="profile-avatar"><AiOutlineUser /></div>
                <div>
                  <div className="profile-name">{profileName}</div>
                  <div className="profile-email">{profileEmail}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <div className="profile-dropdown-section">
                <div className="profile-dropdown-section-title">Theme mode</div>
                <div className="theme-switcher-row">
                  <button className={`theme-switcher-button ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'light' })}><FiSun /></button>
                  <button className={`theme-switcher-button ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'dark' })}><FiMoon /></button>
                  <button className={`theme-switcher-button ${settings.theme === 'system' ? 'active' : ''}`} onClick={() => updateSettings({ theme: 'system' })}><FiMonitor /></button>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button className="profile-dropdown-link" onClick={() => { window.location.href = '/settings'; setShowProfileDropdown(false); }}><FiSettings /> Settings</button>
              <button className="profile-dropdown-link navbar-dropdown-logout" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}><FiLogOut /> Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Search (always visible, expands) */}
      <div className={`topbar-search ${isSearchExpanded ? 'expanded' : ''}`} ref={searchContainerRef}>
        {!isSearchExpanded ? (
          <button className="search-icon-btn" onClick={handleSearchIconClick}>
            <FaSearch />
          </button>
        ) : (
          <div className="search-expanded">
            <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search..." />
            <button className="search-close-btn" onClick={handleCloseSearch}><FiX /></button>
          </div>
        )}
      </div>

      {/* Responsive Menu Button (appears only when needed) */}
      <button ref={menuButtonRef} className="responsive-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
        <FiMenu />
      </button>

      {/* Responsive Dropdown Menu (for small screens) */}
      {isMenuOpen && (
        <div className="responsive-menu-dropdown" ref={menuRef}>
          <ResponsiveDropdownMenu
            filteredFilesCount={filteredFilesCount}
            onOrganize={onOrganize}
            onOrganizeDisabled={onOrganizeDisabled}
            isTrashView={isTrashView}
            onEmptyTrash={onEmptyTrash}
            profileName={profileName}
            profileEmail={profileEmail}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
};