'use client';

import React from 'react';
import './skeleton.css';

// Base skeleton component with shimmer effect
interface SkeletonBaseProps {
  className?: string;
  animation?: 'shimmer' | 'pulse' | 'none';
  count?: number;
  style?: React.CSSProperties;
}

const SkeletonBase: React.FC<SkeletonBaseProps & { children?: React.ReactNode }> = ({ 
  className = '', 
  animation = 'shimmer',
  count = 1,
  style,
  children 
}) => {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`skeleton ${animation} ${className}`} style={style}>
            {children}
          </div>
        ))}
      </>
    );
  }
  return <div className={`skeleton ${animation} ${className}`} style={style}>{children}</div>;
};

// Text skeletons
export const SkeletonText: React.FC<{
  width?: string | number;
  height?: string | number;
  margin?: string;
  count?: number;
  animation?: 'shimmer' | 'pulse';
}> = ({ width = '100%', height = '1rem', margin = '0.5rem 0', count = 1, animation = 'shimmer' }) => (
  <SkeletonBase animation={animation} count={count}>
    <div className="skeleton-text" style={{ width, height, margin }} />
  </SkeletonBase>
);

// Avatar/Circle skeleton
export const SkeletonAvatar: React.FC<{
  size?: number;
  margin?: string;
  animation?: 'shimmer' | 'pulse';
}> = ({ size = 40, margin = '0', animation = 'shimmer' }) => (
  <SkeletonBase animation={animation}>
    <div className="skeleton-avatar" style={{ width: size, height: size, margin }} />
  </SkeletonBase>
);

// Card skeleton (glass card style)
export const SkeletonCard: React.FC<{
  variant?: 'default' | 'stats' | 'folder' | 'category' | 'rule';
  count?: number;
  animation?: 'shimmer' | 'pulse';
}> = ({ variant = 'default', count = 1, animation = 'shimmer' }) => {
  const renderCard = () => {
    switch (variant) {
      case 'stats':
        return (
          <div className="skeleton-card stats-card">
            <div className="skeleton-card-header">
              <SkeletonAvatar size={48} />
              <SkeletonText width="60px" height="24px" margin="0" />
            </div>
            <SkeletonText width="80%" height="32px" margin="12px 0 8px" />
            <SkeletonText width="40%" height="14px" margin="0 0 12px" />
            <div className="skeleton-progress-bar" />
          </div>
        );
      case 'folder':
        return (
          <div className="skeleton-card folder-card">
            <div className="skeleton-folder-header">
              <SkeletonAvatar size={48} />
              <div className="skeleton-folder-info">
                <SkeletonText width="120px" height="18px" margin="0 0 6px" />
                <SkeletonText width="180px" height="12px" margin="0" />
              </div>
              <SkeletonText width="60px" height="20px" margin="0" />
            </div>
            <div className="skeleton-folder-stats">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-fstat-item">
                  <SkeletonText width="40px" height="12px" margin="0" />
                  <SkeletonText width="50px" height="14px" margin="0" />
                </div>
              ))}
            </div>
            <div className="skeleton-folder-actions">
              <div className="skeleton-switch" />
              <div className="skeleton-action-btns">
                <div className="skeleton-icon-btn" />
                <div className="skeleton-icon-btn" />
                <div className="skeleton-icon-btn" />
              </div>
            </div>
          </div>
        );
      case 'category':
        return (
          <div className="skeleton-card category-card">
            <div className="skeleton-cat-header">
              <SkeletonAvatar size={32} />
              <SkeletonText width="80px" height="16px" margin="0" />
            </div>
            <SkeletonText width="100px" height="12px" margin="8px 0" />
            <SkeletonText width="120px" height="12px" margin="0" />
          </div>
        );
      case 'rule':
        return (
          <div className="skeleton-card rule-card">
            <div className="skeleton-rule-content">
              <SkeletonText width="160px" height="16px" margin="0 0 6px" />
              <SkeletonText width="200px" height="12px" margin="0" />
            </div>
            <div className="skeleton-switch" />
          </div>
        );
      default:
        return (
          <div className="skeleton-card default-card">
            <SkeletonText width="60%" height="20px" margin="0 0 12px" />
            <SkeletonText width="90%" height="14px" />
            <SkeletonText width="80%" height="14px" margin="8px 0 0" />
          </div>
        );
    }
  };

  return (
    <SkeletonBase animation={animation} count={count}>
      {renderCard()}
    </SkeletonBase>
  );
};

// Chart skeleton (for Recharts containers)
export const SkeletonChart: React.FC<{
  type?: 'bar' | 'line' | 'pie' | 'area';
  count?: number;
  animation?: 'shimmer' | 'pulse';
}> = ({ type = 'bar', count = 1, animation = 'shimmer' }) => {
  const renderChart = () => (
    <div className={`skeleton-chart ${type}-chart`}>
      <div className="skeleton-chart-header">
        <SkeletonText width="150px" height="20px" margin="0" />
        <div className="skeleton-chart-options">
          <div className="skeleton-chart-option" />
          <div className="skeleton-chart-option" />
        </div>
      </div>
      <div className="skeleton-chart-body">
        {type === 'pie' ? (
          <div className="skeleton-pie-container">
            <div className="skeleton-pie" />
            <div className="skeleton-legend">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-legend-item">
                  <div className="skeleton-legend-color" />
                  <SkeletonText width="60px" height="12px" margin="0" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="skeleton-axis">
            <div className="skeleton-y-axis">
              {[1, 2, 3, 4].map(i => (
                <SkeletonText key={i} width="30px" height="12px" margin="8px 0" />
              ))}
            </div>
            <div className="skeleton-bars-container">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="skeleton-bar" style={{ height: `${20 + Math.random() * 60}px` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="skeleton-x-axis">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <SkeletonText key={i} width="30px" height="12px" margin="8px 0" />
        ))}
      </div>
    </div>
  );

  return (
    <SkeletonBase animation={animation} count={count}>
      {renderChart()}
    </SkeletonBase>
  );
};

// Stats grid skeleton (for dashboard stats)
export const SkeletonStatsGrid: React.FC<{
  count?: number;
  columns?: number;
  animation?: 'shimmer' | 'pulse';
}> = ({ count = 6, columns = 3, animation = 'shimmer' }) => (
  <div className="skeleton-stats-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    <SkeletonCard variant="stats" count={count} animation={animation} />
  </div>
);

// Folder monitoring skeleton (full page)
export const SkeletonFolderMonitoring: React.FC<{
  animation?: 'shimmer' | 'pulse';
}> = ({ animation = 'shimmer' }) => (
  <div className="skeleton-folder-monitoring">
    <SkeletonText width="250px" height="32px" margin="0 0 24px" />
    
    <div className="skeleton-overview-card">
      <div className="skeleton-overview-header">
        <div>
          <SkeletonText width="120px" height="24px" margin="0 0 8px" />
          <SkeletonText width="280px" height="16px" margin="0" />
        </div>
        <div className="skeleton-switch" />
      </div>
      <div className="skeleton-stats-row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-item">
            <SkeletonText width="60px" height="28px" margin="0 0 6px" />
            <SkeletonText width="80px" height="12px" margin="0" />
          </div>
        ))}
      </div>
      <SkeletonText width="100%" height="14px" margin="16px 0 0" />
    </div>

    <SkeletonCard variant="folder" count={4} animation={animation} />

    <SkeletonText width="200px" height="24px" margin="32px 0 16px" />
    <SkeletonCard variant="rule" count={6} animation={animation} />

    <SkeletonText width="180px" height="24px" margin="32px 0 16px" />
    <SkeletonCard variant="category" count={5} animation={animation} />

    <SkeletonText width="150px" height="24px" margin="32px 0 16px" />
    <div className="skeleton-timeline">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-timeline-item">
          <div className="skeleton-timeline-dot" />
          <div className="skeleton-timeline-content">
            <div className="skeleton-timeline-header">
              <SkeletonText width="180px" height="16px" margin="0" />
              <SkeletonText width="80px" height="12px" margin="0" />
            </div>
            <SkeletonText width="240px" height="12px" margin="8px 0 0" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings page skeleton
export const SkeletonSettings: React.FC<{
  animation?: 'shimmer' | 'pulse';
}> = ({ animation = 'shimmer' }) => (
  <div className="skeleton-settings">
    <div className="skeleton-settings-header">
      <SkeletonText width="200px" height="36px" margin="0 0 16px" animation={animation} />
      <SkeletonText width="100%" height="14px" margin="0" animation={animation} />
    </div>
    
    <div className="skeleton-settings-tabs">
      <div className="skeleton-tab-nav">
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonText key={i} width="160px" height="40px" margin="0 0 8px" animation={animation} />
        ))}
      </div>
      <div className="skeleton-tab-content">
        <SkeletonText width="60%" height="24px" margin="0 0 24px" animation={animation} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-setting-row">
            <SkeletonText width="200px" height="16px" margin="0" animation={animation} />
            <div className="skeleton-switch" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dashboard skeleton (main page)
export const SkeletonDashboard: React.FC<{
  animation?: 'shimmer' | 'pulse';
}> = ({ animation = 'shimmer' }) => (
  <div className="skeleton-dashboard">
    <div className="skeleton-welcome-header">
      <SkeletonText width="280px" height="32px" margin="0 0 8px" animation={animation} />
      <SkeletonText width="320px" height="18px" margin="0 0 20px" animation={animation} />
      <div className="skeleton-summary">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-summary-item">
            <SkeletonAvatar size={48} animation={animation} />
            <div>
              <SkeletonText width="80px" height="24px" margin="0 0 4px" animation={animation} />
              <SkeletonText width="100px" height="12px" margin="0" animation={animation} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <SkeletonStatsGrid count={6} columns={3} animation={animation} />

    <div className="skeleton-charts-section">
      {[1, 2, 3, 4].map(i => (
        <SkeletonChart key={i} type={i === 2 ? 'pie' : 'bar'} animation={animation} />
      ))}
    </div>

    <div className="skeleton-two-columns">
      <div className="skeleton-quick-actions">
        <SkeletonText width="140px" height="20px" margin="0 0 16px" animation={animation} />
        <div className="skeleton-actions-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-action-card">
              <SkeletonAvatar size={48} animation={animation} />
              <SkeletonText width="80px" height="14px" margin="8px 0 0" animation={animation} />
            </div>
          ))}
        </div>
      </div>
      <div className="skeleton-activity">
        <SkeletonText width="140px" height="20px" margin="0 0 16px" animation={animation} />
        <div className="skeleton-timeline">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-timeline-item">
              <div className="skeleton-timeline-dot" />
              <div className="skeleton-timeline-content">
                <SkeletonText width="200px" height="16px" margin="0 0 4px" animation={animation} />
                <SkeletonText width="150px" height="12px" margin="0" animation={animation} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Search page skeleton
export const SkeletonSearch: React.FC<{
  animation?: 'shimmer' | 'pulse';
}> = ({ animation = 'shimmer' }) => (
  <div className="skeleton-search">
    <div className="skeleton-overview-card">
      <div className="skeleton-overview-header">
        <div>
          <SkeletonText width="150px" height="24px" margin="0 0 8px" animation={animation} />
          <SkeletonText width="250px" height="16px" margin="0" animation={animation} />
        </div>
        <SkeletonBase className="skeleton-switch" animation={animation} />
      </div>
      <SkeletonText width="100%" height="14px" margin="16px 0 0" animation={animation} />
    </div>

    <div className="skeleton-two-columns">
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <SkeletonText width="180px" height="20px" margin="0 0 8px" animation={animation} />
          <SkeletonText width="120px" height="14px" margin="0" animation={animation} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-priority-item">
            <SkeletonBase className="skeleton-avatar" style={{ width: 24, height: 24 } as React.CSSProperties} animation={animation} />
            <SkeletonText width="60%" height="16px" margin="0" animation={animation} />
          </div>
        ))}
      </div>
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <SkeletonText width="200px" height="20px" margin="0 0 8px" animation={animation} />
          <SkeletonText width="150px" height="14px" margin="0" animation={animation} />
        </div>
        <div className="skeleton-grid-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-drive-card">
              <SkeletonText width="100%" height="16px" margin="0 0 8px" animation={animation} />
              <SkeletonBase className="skeleton-switch" animation={animation} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="skeleton-card">
      <SkeletonText width="140px" height="20px" margin="0 0 16px" animation={animation} />
      <div className="skeleton-grid-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton-setting-row">
            <SkeletonText width="120px" height="14px" margin="0" animation={animation} />
            <SkeletonBase className="skeleton-switch" animation={animation} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Generic container with custom children skeleton
export const SkeletonContainer: React.FC<{
  children: React.ReactNode;
  loading: boolean;
  skeleton: React.ReactNode;
  delay?: number;
}> = ({ children, loading, skeleton, delay = 0 }) => {
  const [delayedLoading, setDelayedLoading] = React.useState(false);
  const [prevLoading, setPrevLoading] = React.useState(loading);

  if (loading !== prevLoading) {
    setPrevLoading(loading);
    setDelayedLoading(false);
  }

  React.useEffect(() => {
    if (loading && delay > 0) {
      const timeoutId = setTimeout(() => setDelayedLoading(true), delay);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, delay]);

  const showSkeleton = loading && (delay === 0 || delayedLoading);

  if (showSkeleton) return <>{skeleton}</>;
  return <>{children}</>;
};

// Export all skeletons as default object
const Skeleton = {
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
  Chart: SkeletonChart,
  StatsGrid: SkeletonStatsGrid,
  FolderMonitoring: SkeletonFolderMonitoring,
  Settings: SkeletonSettings,
  Dashboard: SkeletonDashboard,
  Search: SkeletonSearch,
  Container: SkeletonContainer,
};

export default Skeleton;