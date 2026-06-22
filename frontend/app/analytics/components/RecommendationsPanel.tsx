'use client';

import React, { useState, useEffect } from 'react';
import { FiCpu, FiArchive, FiImage, FiVideo, FiCopy, FiAlertCircle } from 'react-icons/fi';
import analyticsService, { Recommendation as RecType } from '../../services/analyticsService';
import './recommendations-panel.css';

const FALLBACK_ICONS = [FiArchive, FiImage, FiVideo, FiCopy, FiAlertCircle];

const RecommendationsPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getRecommendations();
        const result = res.data as { success: boolean; data: RecType[] };
        if (result?.data) {
          setRecommendations(result.data);
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
      <div className="glassCard recommendationsSection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="glassCard recommendationsSection">
      <div className="sectionTitle">
        <FiCpu size={20} />
        <span>Smart Recommendations</span>
      </div>

      <div className="recommendationsList">
        {recommendations.map((rec, index) => {
          const IconComponent = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
          return (
            <div key={rec.id} className="recommendationCard">
              <div className="recHeader">
                <div 
                  className="recIcon" 
                  style={{ backgroundColor: `${rec.color}15`, color: rec.color }}
                >
                  <IconComponent size={16} />
                </div>
                <span className={`severityBadge severity${rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)}`}>
                  {rec.severity.toUpperCase()}
                </span>
              </div>
              
              <div className="recContent">
                <span className="recTitle">{rec.title}</span>
                <span className="recDesc">{rec.description}</span>
              </div>
              
              <button className="recAction">
                {rec.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
