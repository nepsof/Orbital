'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoMdNotifications } from 'react-icons/io';

import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import Spotlight from './spotlight';
import { useTheme } from './ThemeProvider';
import './navbar.css';

interface NavbarProps {
  currentPage?: string;
  children?: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  emoji: string;
  href: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = 'Dashboard', children }) => {
  const { settings, updateSettings } = useTheme();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);

  

  useEffect(() => {
    // Set initial values on mount to avoid hydration mismatch
    const checkSpotlightEnabled = () => {
      const saved = localStorage.getItem('spotlightEnabled');
      setSpotlightEnabled(saved === null ? true : saved === 'true');
    };

    checkSpotlightEnabled();
    
    const timer = setTimeout(() => {
      setCurrentTime(new Date());
    }, 0);

    window.addEventListener('storage', checkSpotlightEnabled);
    return () => {
      window.removeEventListener('storage', checkSpotlightEnabled);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spotlightEnabled && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightEnabled]);

  // Sidebar navigation items
  const sidebarItems: NavItem[] = [
    { id: 'folder-monitoring', label: 'Folder Monitoring', emoji: '🗂️', href: '/folder-monitoring' },
    { id: 'analytics', label: 'Analytics', emoji: '📈', href: '/analytics' },
    { id: 'logs', label: 'Logs', emoji: '📝', href: '/logs' },
    { id: 'search', label: 'Search', emoji: '🔍', href: '/search' },
    { id: 'settings', label: 'Settings', emoji: '⚙️', href: '/settings' },
    
  ];

  // Sample notifications
  const notifications = [
    { id: 1, message: 'New file uploaded successfully', time: '2 min ago', read: false },
    { id: 2, message: 'System backup completed', time: '1 hour ago', read: false },
    { id: 3, message: 'Storage usage at 85%', time: '3 hours ago', read: true },
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: undefined 
    });
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="navbar-container">
      {/* Left Sidebar */}
      <aside className="navbar-sidebar">
        {/* Logo Section */}
        <div className="navbar-logo-section">
          <div className="navbar-logo-container">
            <div className="navbar-logo">
              <Image 
                src="/logo.png" 
                alt="Orbital Logo" 
                className="navbar-logo-img"
                width={44}
                height={44}
                priority
              />
            </div>
            <div className="navbar-brand-text">
              <h1>Orbital</h1>
              <p>Intelligent File System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="navbar-nav">
          <ul className="navbar-nav-list">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`navbar-nav-link ${
                    currentPage.toLowerCase() === item.label.toLowerCase()
                      ? 'active'
                      : ''
                  }`}
                >
                  <span className="navbar-nav-emoji">{item.emoji}</span>
                  <span className="navbar-nav-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="navbar-sidebar-footer">
          <div className="navbar-footer-text">
            <p>© 2024 Smart File</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="navbar-main-content">
        {/* Top Navigation Bar */}
        <header className="navbar-header">
          <div className="navbar-header-content">
            {/* Left Section - Date & Time */}
            <div className="navbar-header-left">
              <div>
                <h2 className="navbar-page-title">{currentPage}</h2>
                <div className="navbar-date-time">
                  <span>{currentTime ? formatDate(currentTime) : ''}</span>
                  <span>•</span>
                  <span>{currentTime ? formatTime(currentTime) : ''}</span>
                </div>
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="navbar-header-right">
              {/* Theme Toggle */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowThemeDropdown(!showThemeDropdown);
                    setShowNotifications(false);
                  }}
                  className="navbar-control-btn"
                  title="Change Theme"
                >
                  {settings.theme === 'light' && <FiSun className="text-secondary" />}
                  {settings.theme === 'dark' && <FiMoon className="text-secondary" />}
                  {settings.theme === 'system' && <FiMonitor className="text-secondary" />}
                </button>

                {showThemeDropdown && (
                  <div className="navbar-dropdown theme-dropdown">
                    <div className="navbar-dropdown-header">
                      <h3>Appearance</h3>
                    </div>
                    <div className="navbar-dropdown-menu">
                      <button
                        onClick={() => {
                          updateSettings({ theme: 'light' });
                          setShowThemeDropdown(false);
                        }}
                        className={`navbar-dropdown-link ${settings.theme === 'light' ? 'active' : ''}`}
                      >
                        <FiSun />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => {
                          updateSettings({ theme: 'dark' });
                          setShowThemeDropdown(false);
                        }}
                        className={`navbar-dropdown-link ${settings.theme === 'dark' ? 'active' : ''}`}
                      >
                        <FiMoon />
                        <span>Dark</span>
                      </button>
                      <button
                        onClick={() => {
                          updateSettings({ theme: 'system' });
                          setShowThemeDropdown(false);
                        }}
                        className={`navbar-dropdown-link ${settings.theme === 'system' ? 'active' : ''}`}
                      >
                        <FiMonitor />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                  }}
                  className="navbar-control-btn"
                  title="Notifications"
                >
                  {unreadNotifications > 0 && (
                    <span className="navbar-notification-badge">
                      {unreadNotifications}
                    </span>
                  )}
                  <IoMdNotifications className="text-secondary" />
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <h3>Notifications</h3>
                    </div>
                    <div className="navbar-dropdown-body">
                      {notifications.length === 0 ? (
                        <div className="navbar-dropdown-item">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`navbar-dropdown-item ${
                              !notification.read ? 'unread' : ''
                            }`}
                          >
                            <div className="navbar-notification-item">
                              <div className={`navbar-notification-indicator ${
                                !notification.read ? 'unread' : ''
                              }`} />
                              <div className="navbar-notification-content">
                                <p className="navbar-notification-message">{notification.message}</p>
                                <p className="navbar-notification-time">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Back to Home */}
              <Link href="/" className="navbar-back-btn">
                ← Back
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area (for pages to use) */}
        <main className="navbar-main">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showThemeDropdown) && (
        <div
          className="navbar-overlay"
          onClick={() => {
            setShowNotifications(false);
            setShowThemeDropdown(false);
          }}
        />
      )}

      <Spotlight open={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
    </div>
  );
};

export default Navbar;