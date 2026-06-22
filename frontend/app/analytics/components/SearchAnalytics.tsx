'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiArrowUpRight } from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import analyticsService, { SearchVolumeDay, TopSearch } from '../../services/analyticsService';
import './search-analytics.css';

const SearchAnalytics: React.FC = () => {
  const [volume, setVolume] = useState<SearchVolumeDay[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volRes, topRes] = await Promise.all([
          analyticsService.getSearchVolume(7),
          analyticsService.getTopSearches(),
        ]);
        const volResult = volRes.data as { success: boolean; data: SearchVolumeDay[] };
        if (volResult?.data) {
          setVolume(volResult.data);
        }
        const topResult = topRes.data as { success: boolean; data: TopSearch[] };
        if (topResult?.data) {
          setTopSearches(topResult.data);
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
      <div className="glassCard searchAnalyticsSection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="glassCard searchAnalyticsSection">
      <div className="sectionTitle">
        <FiSearch size={20} />
        <span>Spotlight Search Analytics</span>
      </div>

      <div className="searchGrid">
        <div className="searchChart">
          <span className="chartTitle">Daily Search Volume</span>
          <div className="chartContainer" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--brand-primary-light)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass-strong)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Bar dataKey="count" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="searchRanking">
          <span className="chartTitle">Top Search Queries</span>
          <div className="activeFoldersList">
            {topSearches.map((item, index) => (
              <div key={index} className="rankingItem">
                <div className="rankingInfo">
                  <span className="rankingPos">#{index + 1}</span>
                  <div>
                    <div className="rankingName">{item.name}</div>
                    <span className="searchCategoryTag">{item.category}</span>
                  </div>
                </div>
                <div className="rankingCount">
                  {item.count} hits
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;
