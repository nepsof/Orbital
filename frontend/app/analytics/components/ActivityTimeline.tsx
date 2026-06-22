'use client';

import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import analyticsService, { ActivityLogEntry } from '../../services/analyticsService';
import './activity-timeline.css';

const ActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getActivityLog(5);
        const result = res.data as { success: boolean; data: ActivityLogEntry[] };
        if (result?.data) {
          setActivities(result.data);
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
      <div className="glassCard timelineSection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="glassCard timelineSection">
      <div className="sectionTitle">
        <FiClock size={20} />
        <span>Recent System Activity</span>
      </div>

      <div className="timelineList">
        {activities.map((activity) => (
          <div key={activity.id} className="timelineItem">
            <div 
              className="timelineDot" 
              style={{ backgroundColor: activity.color }}
            />
            <div className="timelineHeader">
              <span className="timelineTitle">
                {activity.title}
                <span className={`timelineBadge ${activity.type}`}>Event</span>
              </span>
              <span className="timelineTime">{activity.time}</span>
            </div>
            <span className="timelineDesc">{activity.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
