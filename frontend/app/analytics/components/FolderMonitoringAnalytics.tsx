'use client';

import React, { useState, useEffect } from 'react';
import { FiActivity, FiFolder, FiZap } from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import analyticsService, { MonitoringData } from '../../services/analyticsService';
import './folder-monitoring-analytics.css';

const FolderMonitoringAnalytics: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getMonitoring();
        const result = res.data as { success: boolean; data: MonitoringData };
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
      <div className="glassCard monitoringSection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glassCard monitoringSection">
      <div className="monitoringHeader">
        <div className="sectionTitle">
          <FiActivity size={20} />
          <span>Folder Monitoring Analytics</span>
        </div>
        <div className="liveIndicator">
          <div className="pulse" />
          <span>Live Monitoring Active</span>
        </div>
      </div>

      <div className="monitoringGrid">
        <div className="monitoringChart">
          <span className="chartTitle">Real-time Event Frequency</span>
          <div className="chartContainer" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scanData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass-strong)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="var(--brand-secondary)" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: 'var(--brand-secondary)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="monitoringStats">
          <div className="monitoredCard">
            <span className="monitoredLabel">Files Scanned (1h)</span>
            <span className="monitoredValue">{data.filesScanned1hDisplay}</span>
          </div>
          <div className="monitoredCard">
            <span className="monitoredLabel">Changes Detected</span>
            <span className="monitoredValue">{data.changesDetectedDisplay}</span>
          </div>
          <div className="monitoredCard">
            <span className="monitoredLabel">Avg. CPU Usage</span>
            <span className="monitoredValue">{data.avgCpuUsageDisplay}</span>
          </div>
          <div className="monitoredCard">
            <span className="monitoredLabel">Health Status</span>
            <span className="monitoredValue" style={{ color: data.healthStatus === 'Optimal' || data.healthStatus === 'Healthy' ? 'var(--brand-success)' : 'var(--brand-danger)' }}>{data.healthStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderMonitoringAnalytics;
