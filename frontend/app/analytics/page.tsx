'use client';

import React, { useState, useCallback } from 'react';
import './analytics.css';
import AnalyticsHeader from './components/AnalyticsHeader';
import OverviewCards from './components/OverviewCards';
import StorageIntelligence from './components/StorageIntelligence';
import ProductivityInsights from './components/ProductivityInsights';
import SearchAnalytics from './components/SearchAnalytics';
import FolderMonitoringAnalytics from './components/FolderMonitoringAnalytics';
import RecommendationsPanel from './components/RecommendationsPanel';
import ActivityTimeline from './components/ActivityTimeline';
import RecoverySafetyAnalytics from './components/RecoverySafetyAnalytics';
import CategoryBreakdown from './components/CategoryBreakdown';
import Navbar from '../components/navbar';

export default function AnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <Navbar currentPage="Analytics">
    <div className="analyticsContainer" key={refreshKey}>
      <AnalyticsHeader onRefresh={handleRefresh} />
      
      <div className="analyticsGrid">
        <div style={{ gridColumn: 'span 12' }}>
          <OverviewCards />
        </div>

        <div style={{ gridColumn: 'span 8' }}>
          <StorageIntelligence />
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <RecommendationsPanel />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <ProductivityInsights />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <CategoryBreakdown />
        </div>

        <div style={{ gridColumn: 'span 7' }}>
          <SearchAnalytics />
        </div>

        <div style={{ gridColumn: 'span 5' }}>
          <ActivityTimeline />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <FolderMonitoringAnalytics />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <RecoverySafetyAnalytics />
        </div>
      </div>
    </div>
    </Navbar>
  );
}
