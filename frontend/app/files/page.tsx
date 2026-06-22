'use client';

import React from 'react';
import Navbar from '../components/navbar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import Suggestions from './components/Suggestions';
import ActivityTimeline from './components/ActivityTimeline';
import RecoveryCenter from './components/RecoveryCenter';
import SpotlightIntegration from './components/SpotlightIntegration';
import { FilesProvider } from './context/FilesContext';
import './files.css';

const FilesPage: React.FC = () => {
  return (
    <Navbar currentPage="Files">
    <FilesProvider>
      <div className="files-page">
        
        <main className="files-container">
          <Header />
          
          <div className="files-grid">
            <section className="main-content">
              <SummaryCards />
              <div className="bottom-panels">
                <ActivityTimeline />
                <RecoveryCenter />
              </div>
            </section>
            
            <aside className="side-panels">
              <Suggestions />
              <SpotlightIntegration />
            </aside>
          </div>
        </main>
      </div>
    </FilesProvider>
    </Navbar>
  );
};

export default FilesPage;
