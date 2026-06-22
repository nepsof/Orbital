import React, { useMemo } from 'react';
import { FiZap, FiCopy, FiTrash2, FiPackage, FiChevronRight } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './suggestions.css';

const Suggestions: React.FC = () => {
  const { files, stats } = useFilesManager();

  const suggestions = useMemo(() => {
    const items = [];

    // Rule 1: Screenshots in Downloads
    const screenshots = files.filter(f => 
      f.sourceFolder === 'Downloads' && 
      (f.name.toLowerCase().includes('screenshot') || f.extension === 'png')
    );
    if (screenshots.length > 0) {
      items.push({
        id: 'suggest-screenshots',
        title: 'Organize Screenshots',
        desc: `${screenshots.length} screenshots detected in Downloads can be moved to Images.`,
        icon: <FiZap />,
        color: 'primary',
        action: 'Organize Now'
      });
    }

    // Rule 2: Duplicates
    if (stats.duplicateCount > 0) {
      items.push({
        id: 'suggest-duplicates',
        title: 'Remove Duplicates',
        desc: `${stats.duplicateCount} duplicate files found taking up space.`,
        icon: <FiCopy />,
        color: 'danger',
        action: 'Review'
      });
    }

    // Rule 3: Large Files
    if (stats.largeCount > 0) {
      items.push({
        id: 'suggest-large',
        title: 'Large Files Found',
        desc: `${stats.largeCount} large files detected. Consider moving to archive.`,
        icon: <FiTrash2 />,
        color: 'accent',
        action: 'Clean Up'
      });
    }

    // Rule 4: Archives
    const archives = files.filter(f => f.category === 'Archives');
    if (archives.length > 5) {
      items.push({
        id: 'suggest-archives',
        title: 'Optimize Storage',
        desc: 'Multiple archives detected. Compression could save more space.',
        icon: <FiPackage />,
        color: 'success',
        action: 'Compress'
      });
    }

    return items;
  }, [files, stats]);

  return (
    <section className="suggestions-panel surface-raised">
      <div className="panel-header">
        <div className="header-title">
          <FiZap className="icon-bulb" />
          <h3>Smart Suggestions</h3>
        </div>
        <button className="btn-view-all">View All</button>
      </div>

      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <div className="empty-state-suggestions">
            <p>No new suggestions today</p>
          </div>
        ) : (
          suggestions.map((item) => (
            <div key={item.id} className="suggestion-card">
              <div className={`suggestion-icon icon-${item.color}`}>
                {item.icon}
              </div>
              <div className="suggestion-content">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <button className={`suggestion-action btn-${item.color}`}>
                  {item.action} <FiChevronRight />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Suggestions;
