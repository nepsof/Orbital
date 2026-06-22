'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiFolder, FiZap, FiSearch } from 'react-icons/fi';
import analyticsService, { ProductivityData } from '../../services/analyticsService';
import './productivity-insights.css';

const ProductivityInsights: React.FC = () => {
  const [data, setData] = useState<ProductivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getProductivity();
        const result = res.data as { success: boolean; data: ProductivityData };
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
    return (
      <div className="glassCard productivitySection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glassCard productivitySection">
      <div className="sectionTitle">
        <FiTrendingUp size={20} />
        <span>Productivity Insights</span>
      </div>

      <div className="productivityGrid">
        <div className="miniStat">
          <span className="miniLabel">Organized Today</span>
          <span className="miniValue">{data.organizedTodayDisplay}</span>
        </div>
        <div className="miniStat">
          <span className="miniLabel">Automation Rate</span>
          <span className="miniValue">{data.automationRateDisplay}</span>
        </div>
        <div className="miniStat">
          <span className="miniLabel">Avg Search Speed</span>
          <span className="miniValue">{data.avgSearchSpeedDisplay}</span>
        </div>
        <div className="miniStat">
          <span className="miniLabel">Time Saved</span>
          <span className="miniValue">{data.timeSavedDisplay}</span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <span className="chartTitle">Most Active Monitored Folders</span>
        <div className="activeFoldersList">
          {data.activeFolders.map((folder, index) => (
            <div key={index} className="folderItem">
              <div className="folderInfo">
                <FiFolder size={14} color="var(--brand-primary)" />
                <span className="folderName">{folder.name}</span>
              </div>
              <span className="folderActivity">{folder.activity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductivityInsights;
