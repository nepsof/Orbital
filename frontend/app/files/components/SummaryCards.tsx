import React from 'react';
import { FiFile, FiCheckCircle, FiHardDrive, FiCopy, FiAlertCircle, FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './summary-cards.css';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  isPositive: boolean;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isPositive, color }) => (
  <div className={`stat-card glass-card`} style={{ '--accent-color': color } as React.CSSProperties}>
    <div className="card-header">
      <div className="icon-wrapper" style={{ backgroundColor: `var(--brand-${color}-muted)`, color: `var(--brand-${color})` }}>
        {icon}
      </div>
      <div className={`trend ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <FiTrendingUp /> : <FiTrendingDown />} {trend}
      </div>
    </div>
    <div className="card-body">
      <span className="stat-value">{value}</span>
      <h3 className="stat-title">{title}</h3>
    </div>
  </div>
);

const SummaryCards: React.FC = () => {
  const { stats } = useFilesManager();

  const cards = [
    { title: 'Total Files', value: stats.totalFiles.toLocaleString(), icon: <FiFile />, trend: '+12%', isPositive: true, color: 'primary' },
    { title: 'Organized Today', value: stats.organizedToday.toString(), icon: <FiCheckCircle />, trend: '+5%', isPositive: true, color: 'success' },
    { title: 'Storage Usage', value: stats.storageUsage, icon: <FiHardDrive />, trend: '+850 MB', isPositive: true, color: 'purple' },
    { title: 'Duplicate Files', value: stats.duplicateCount.toString(), icon: <FiCopy />, trend: '-3', isPositive: true, color: 'danger' },
    { title: 'Large Files', value: stats.largeCount.toString(), icon: <FiAlertCircle />, trend: 'No change', isPositive: true, color: 'accent' },
    { title: 'Recently Modified', value: stats.recentCount.toString(), icon: <FiClock />, trend: 'Just now', isPositive: true, color: 'pink' },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default SummaryCards;
