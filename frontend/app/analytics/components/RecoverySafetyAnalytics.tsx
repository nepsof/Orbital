'use client';

import React, { useState, useEffect } from 'react';
import { FiShield, FiRotateCcw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip 
} from 'recharts';
import analyticsService, { RecoveryData } from '../../services/analyticsService';
import './recovery-safety-analytics.css';

const RecoverySafetyAnalytics: React.FC = () => {
  const [data, setData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getRecovery();
        const result = res.data as { success: boolean; data: RecoveryData };
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
      <div className="glassCard recoverySection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glassCard recoverySection">
      <div className="sectionTitle">
        <FiShield size={20} />
        <span>Recovery & Safety Analytics</span>
      </div>

      <div className="recoveryGrid">
        <div className="safetyCard">
          <div className="safetyIcon" style={{ backgroundColor: 'var(--brand-success-muted)', color: 'var(--brand-success)' }}>
            <FiRotateCcw />
          </div>
          <div className="safetyInfo">
            <span className="safetyLabel">Files Restored</span>
            <span className="safetyValue">{data.filesRestoredDisplay}</span>
          </div>
        </div>

        <div className="safetyCard">
          <div className="safetyIcon" style={{ backgroundColor: 'var(--brand-primary-muted)', color: 'var(--brand-primary)' }}>
            <FiCheckCircle />
          </div>
          <div className="safetyInfo">
            <span className="safetyLabel">Undo Actions Used</span>
            <span className="safetyValue">{data.undoActionsDisplay}</span>
          </div>
        </div>

        <div className="safetyCard">
          <div className="safetyIcon" style={{ backgroundColor: 'var(--brand-danger-muted)', color: 'var(--brand-danger)' }}>
            <FiAlertTriangle />
          </div>
          <div className="safetyInfo">
            <span className="safetyLabel">Risky Actions Blocked</span>
            <span className="safetyValue">{data.riskyBlockedDisplay}</span>
          </div>
        </div>

        <div className="safetyCard">
          <div className="safetyIcon" style={{ backgroundColor: 'var(--brand-purple-muted)', color: 'var(--brand-purple)' }}>
            <FiShield />
          </div>
          <div className="safetyInfo">
            <span className="safetyLabel">Protected Folders</span>
            <span className="safetyValue">{data.protectedFoldersDisplay}</span>
          </div>
        </div>
      </div>

      <div className="safetyChart">
        <span className="chartTitle">Weekly Recovery Activity</span>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data.weeklyData}>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-glass-strong)', 
                borderColor: 'var(--glass-border)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="var(--brand-success)" 
              fill="var(--brand-success-muted)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecoverySafetyAnalytics;
