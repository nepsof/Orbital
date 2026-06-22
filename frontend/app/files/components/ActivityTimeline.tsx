import React from 'react';
import { FiMove, FiPackage, FiCopy, FiMonitor, FiClock, FiStar, FiTrash2, FiRotateCcw, FiSearch } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './activity-timeline.css';

const ActivityTimeline: React.FC = () => {
  const { activities } = useFilesManager();

  const getIcon = (type: string) => {
    switch (type) {
      case 'move': return <FiMove />;
      case 'compress': return <FiPackage />;
      case 'duplicate': return <FiCopy />;
      case 'monitor': return <FiMonitor />;
      case 'favorite': return <FiStar />;
      case 'delete': return <FiTrash2 />;
      case 'restore': return <FiRotateCcw />;
      case 'search': return <FiSearch />;
      default: return <FiClock />;
    }
  };

  return (
    <section className="activity-panel surface-raised">
      <div className="panel-header">
        <div className="header-title">
          <FiClock className="icon-clock" />
          <h3>Recent Activity</h3>
        </div>
      </div>

      <div className="timeline">
        {activities.length === 0 ? (
          <div className="empty-state-timeline">
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="timeline-item">
              <div className={`timeline-icon icon-${activity.color}`}>
                {getIcon(activity.type)}
              </div>
              <div className="timeline-content">
                <p className="activity-text">{activity.text}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ActivityTimeline;
