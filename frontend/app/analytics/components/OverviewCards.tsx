'use client';

import React, { useState, useEffect } from 'react';
import { FiFileText, FiDatabase, FiShield, FiCopy, FiSearch, FiFolder, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import analyticsService, { SummaryData } from '../../services/analyticsService';
import './overview-cards.css';

interface StatProps {
  label: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  footer: string;
  className?: string;
}

const StatCard: React.FC<StatProps> = ({ label, value, trend, icon, footer, className }) => {
  const isPositive = trend > 0;

  return (
    <div className={`glassCard statCard ${className}`}>
      <div className="statHeader">
        <div className="iconWrapper">
          {icon}
        </div>
        <div className={`trendBadge ${isPositive ? 'trendUp' : 'trendDown'}`}>
          {isPositive ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      
      <div className="statBody">
        <span className="statLabel">{label}</span>
        <span className="statValue">{value}</span>
      </div>
      
      <div className="statFooter">
        {footer}
      </div>
    </div>
  );
};

const OverviewCards: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getSummary();
        const result = res.data as { success: boolean; data: SummaryData };
        if (result?.data) {
          setData(result.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="overviewGrid"><div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>Loading...</div></div>;
  }

  if (!data) return null;

  return (
    <div className="overviewGrid">
      <StatCard 
        label="Total Files" 
        value={data.totalFilesDisplay} 
        trend={data.totalFilesTrend} 
        icon={<FiFileText size={20} />} 
        footer={data.totalFilesFooter}
      />
      <StatCard 
        label="Storage Used" 
        value={data.storageUsedDisplay} 
        trend={data.storageUsedTrend} 
        icon={<FiDatabase size={20} />} 
        footer={data.storageUsedFooter}
        className="cardStorage"
      />
      <StatCard 
        label="Storage Saved" 
        value={data.storageSavedDisplay} 
        trend={data.storageSavedTrend} 
        icon={<FiShield size={20} />} 
        footer={data.storageSavedFooter}
        className="cardSaved"
      />
      <StatCard 
        label="Duplicate Files" 
        value={data.duplicateCountDisplay} 
        trend={data.duplicateTrend} 
        icon={<FiCopy size={20} />} 
        footer={data.duplicateFooter}
        className="cardDuplicates"
      />
      <StatCard 
        label="Searches" 
        value={data.searchCountDisplay} 
        trend={data.searchTrend} 
        icon={<FiSearch size={20} />} 
        footer={data.searchFooter}
        className="cardSearch"
      />
      <StatCard 
        label="Active Folders" 
        value={data.activeFoldersDisplay} 
        trend={data.folderTrend} 
        icon={<FiFolder size={20} />} 
        footer={data.folderFooter}
        className="cardFolders"
      />
    </div>
  );
};

export default OverviewCards;
