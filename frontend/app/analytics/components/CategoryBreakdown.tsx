'use client';

import React, { useState, useEffect } from 'react';
import { FiGrid, FiImage, FiVideo, FiFileText, FiBox, FiPlayCircle, FiFile } from 'react-icons/fi';
import analyticsService, { CategoryBreakdownItem } from '../../services/analyticsService';
import './category-breakdown.css';

const ICON_MAP: Record<string, React.ReactNode> = {
  'image': <FiImage size={16} />,
  'video': <FiVideo size={16} />,
  'pdf': <FiFileText size={16} />,
  'archive': <FiBox size={16} />,
  'program': <FiPlayCircle size={16} />,
  'document': <FiFile size={16} />,
};

const getIcon = (iconName: string, index: number): React.ReactNode => {
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  const fallbacks = [FiImage, FiVideo, FiFileText, FiBox, FiPlayCircle, FiFile];
  const Fallback = fallbacks[index % fallbacks.length];
  return <Fallback size={16} />;
};

const CategoryBreakdown: React.FC = () => {
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getCategoryBreakdown();
        const result = res.data as { success: boolean; data: { categories: CategoryBreakdownItem[]; total: number } };
        if (result?.data?.categories) {
          setCategories(result.data.categories);
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
      <div className="glassCard categorySection">
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="glassCard categorySection">
      <div className="sectionTitle">
        <FiGrid size={20} />
        <span>File Category Breakdown</span>
      </div>

      <div className="categoryGrid">
        {categories.map((category, index) => (
          <div key={index} className="categoryCard">
            <div className="categoryHeader">
              <div 
                className="categoryIcon" 
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {getIcon(category.icon, index)}
              </div>
              <span className="categoryGrowth">{category.percentage}%</span>
            </div>
            
            <div className="categoryInfo">
              <span className="categoryName">{category.name}</span>
              <div className="categoryDetails">
                <span>{category.count} files</span>
                <span>{category.percentage}%</span>
              </div>
              <div className="categoryTrend">
                <div 
                  className="categoryTrendFill" 
                  style={{ width: `${category.percentage}%`, backgroundColor: category.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
