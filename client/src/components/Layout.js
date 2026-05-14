import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiFileText, FiBriefcase, FiFolder, FiCalendar, FiDollarSign, FiBell, FiCheckSquare, FiList, FiMessageSquare, FiCreditCard, FiBarChart2, FiLogOut, FiMenu, FiX, FiCompass, FiAlertCircle, FiMapPin, FiTrendingUp } from 'react-icons/fi';

const ROLE_LEVELS = { caseworker: 1, reviewer: 1, supervisor: 2, admin: 3 };

const menuItems = [
  { path: '/', icon: FiHome, label: 'Dashboard' },
  { path: '/applicants', icon: FiUsers, label: 'Applicants' },
  { path: '/applications', icon: FiFileText, label: 'Applications' },
  { path: '/cases', icon: FiBriefcase, label: 'Case Management' },
  { path: '/documents', icon: FiFolder, label: 'Documents' },
  { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/benefits', icon: FiDollarSign, label: 'Benefits' },
  { path: '/eligibility', icon: FiCheckSquare, label: 'Eligibility' },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
  { path: '/ai-assistant', icon: FiMessageSquare, label: 'AI Assistant' },
  { path: '/benefits-calculator', icon: FiCreditCard, label: 'Benefits Calculator' },
  { path: '/reports', icon: FiBarChart2, label: 'Reports' },
  { path: '/benefits-navigator', icon: FiCompass, label: 'Benefits Navigator' },
  { path: '/income-verification-guide', icon: FiFileText, label: 'Income Verification' },
  { path: '/appeal-preparation', icon: FiAlertCircle, label: 'Appeal Preparation' },
  { path: '/service-locator', icon: FiMapPin, label: 'Service Locator' },
  { path: '/income-change-advisor', icon: FiTrendingUp, label: 'Income Change Advisor' },
  // Supervisor+ only
  { path: '/audit-logs', icon: FiList, label: 'Audit Logs', minRole: 'supervisor' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/')}>
            {sidebarOpen && <><span className="logo-icon">🏛️</span><h2>SNAP Benefits</h2></>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.filter((item) => {
            if (!item.minRole) return true;
            const userLevel = ROLE_LEVELS[user?.role] || 0;
            const requiredLevel = ROLE_LEVELS[item.minRole] || 0;
            return userLevel >= requiredLevel;
          }).map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <item.icon className="nav-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Logout">
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
