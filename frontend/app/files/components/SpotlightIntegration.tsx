import React from 'react';
import { FiSearch, FiCode, FiFile, FiGlobe, FiClock } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './spotlight-integration.css';

const SpotlightIntegration: React.FC = () => {
  const { searchQuery, setSearchQuery, spotlightResults } = useFilesManager();

  const getIcon = (type: string) => {
    switch (type) {
      case 'app': return <FiCode />;
      case 'file': return <FiFile />;
      case 'web': return <FiGlobe />;
      default: return <FiFile />;
    }
  };

  return (
    <section className="spotlight-panel surface-raised">
      <div className="spotlight-mock-input">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="spotlight-input-mock"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="k-hint">⌘ K</div>
      </div>

      <div className="spotlight-results">
        <div className="results-group">
          <span className="group-title">
            {searchQuery ? <FiSearch /> : <FiClock />} 
            {searchQuery ? ' Search Results' : ' Recent Searches'}
          </span>
          
          {searchQuery && spotlightResults.length === 0 ? (
            <div className="result-item web-fallback">
              <div className="result-icon web">
                <FiGlobe />
              </div>
              <div className="result-info">
                <span className="result-label">Search the web for "{searchQuery}"</span>
                <span className="result-sub">Web fallback</span>
              </div>
            </div>
          ) : (
            spotlightResults.map((item: { id: string, type: string, label: string, sub: string }) => (
              <div key={item.id} className="result-item">
                <div className={`result-icon ${item.type}`}>
                  {getIcon(item.type)}
                </div>
                <div className="result-info">
                  <span className="result-label">{item.label}</span>
                  <span className="result-sub">{item.sub}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="spotlight-footer">
        <span>Press <kbd>Esc</kbd> to close</span>
      </div>
    </section>
  );
};

export default SpotlightIntegration;
