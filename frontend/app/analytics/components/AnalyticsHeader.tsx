'use client';

import React from 'react';
import { FiDownload, FiRefreshCw, FiZap, FiCalendar, FiClock } from 'react-icons/fi';
import './analytics-header.css';

interface AnalyticsHeaderProps {
  onRefresh?: () => void;
  lastUpdated?: string;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ onRefresh, lastUpdated }) => {
  const displayTime = lastUpdated || new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="headerContainer">
      <div className="headerInfo">
        <h1>System Intelligence Center</h1>
        <p className="headerDescription">Real-time insights across your digital workspace and connected storage.</p>
        
        <div className="workspaceBadge">
          <FiCalendar size={12} />
          <span>Live Analytics Dashboard</span>
        </div>
      </div>

      <div className="headerActions">
        <div className="actionButtons">
          <select className="dateSelector">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          
          <button className="btn btnSecondary" onClick={onRefresh}>
            <FiRefreshCw size={14} />
            <span>Refresh</span>
          </button>
          
          <button className="btn btnSecondary">
            <FiDownload size={14} />
            <span>Export Report</span>
          </button>
          
          <button className="btn btnPrimary">
            <FiZap size={14} />
            <span>Generate Summary</span>
          </button>
        </div>
        
        <div className="lastUpdated">
          <FiClock size={10} />
          <span>Last updated: {displayTime}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
