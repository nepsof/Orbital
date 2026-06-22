'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { FiDatabase } from 'react-icons/fi';
import analyticsService, { StorageDistribution, ActivityTrend } from '../../services/analyticsService';
import './storage-intelligence.css';

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#94a3b8', '#ef4444'];

const StorageIntelligence: React.FC = () => {
  const [distribution, setDistribution] = useState<StorageDistribution | null>(null);
  const [trends, setTrends] = useState<ActivityTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, trendsRes] = await Promise.all([
          analyticsService.getStorageDistribution(),
          analyticsService.getActivityTrends(30),
        ]);
        const distResult = distRes.data as { success: boolean; data: StorageDistribution };
        if (distResult?.data) {
          setDistribution(distResult.data);
        }
        const trendsResult = trendsRes.data as { success: boolean; data: ActivityTrend[] };
        if (trendsResult?.data) {
          setTrends(trendsResult.data);
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
      <div className="glassCard storageSection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  const fileTypeData = distribution
    ? distribution.labels.map((name, i) => ({
        name,
        value: distribution.values[i],
        color: distribution.colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }))
    : [];

  const growthData = trends.length > 0
    ? trends.map(t => ({ month: t.label, size: Math.round(t.size / (1024 * 1024 * 1024)) }))
    : [];

  const categoryStats = distribution
    ? distribution.labels.slice(0, 4).map((name, i) => ({
        name,
        size: `${((distribution.values[i] / (1024 * 1024 * 1024))).toFixed(0)} GB`,
        percentage: distribution.total > 0 ? Math.round((distribution.values[i] / distribution.total) * 100) : 0,
        color: distribution.colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }))
    : [];

  return (
    <div className="glassCard storageSection">
      <div className="sectionTitle">
        <FiDatabase size={20} />
        <span>Storage Intelligence</span>
      </div>

      <div className="chartsGrid">
        <div className="storageStats">
          <span className="chartTitle">Storage Utilization</span>
          {categoryStats.map((stat, index) => (
            <div key={index} className="storageStatItem">
              <div className="statInfo">
                <span className="statName">{stat.name}</span>
                <span className="statValue">{stat.size}</span>
              </div>
              <div className="progressBar">
                <div 
                  className="progressFill" 
                  style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                />
              </div>
            </div>
          ))}
          
          <div className="chartContainer" style={{ height: '180px' }}>
            <span className="chartTitle">File Type Distribution</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass-strong)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="growthTrend">
          <span className="chartTitle">Storage Growth Trend (GB)</span>
          <div className="chartContainer">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis 
                  dataKey="month" 
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
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass-strong)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorSize)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageIntelligence;
