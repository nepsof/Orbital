import React from 'react';
import { FiSearch, FiGrid, FiList, FiAlignJustify, FiRefreshCw, FiPlus, FiFilter, FiChevronDown, FiZap, FiSearch as FiSpotlight } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './header.css';

const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useFilesManager();

  return (
    <header className="workspace-header surface-raised">
      <div className="header-top">
        <div className="title-section">
          <h1>Smart File Workspace</h1>
          <div className="monitored-folder">
            <span className="folder-label">Monitoring:</span>
            <span className="folder-path">/Users/manzil/Documents/Projects</span>
          </div>
        </div>
        
        <div className="search-section">
          <div className="search-bar-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Global smart search..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="shortcut-hint">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>
            </div>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div className="action-group primary-actions">
          <button className="btn btn-primary">
            <FiZap /> Organize Now
          </button>
          <button className="btn btn-secondary">
            <FiSpotlight /> Scan Folder
          </button>
          <button className="btn btn-ghost">
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn btn-ghost">
            <FiPlus /> Add Folder
          </button>
        </div>

        <div className="action-group view-actions">
          <div className="view-mode-switcher">
            <button className="view-btn active" title="Grid View"><FiGrid /></button>
            <button className="view-btn" title="List View"><FiList /></button>
            <button className="view-btn" title="Compact View"><FiAlignJustify /></button>
          </div>
          
          <div className="dropdown-group">
            <button className="btn-dropdown">
              <FiFilter /> Filter <FiChevronDown />
            </button>
            <button className="btn-dropdown">
              Sort By <FiChevronDown />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
