import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiFileText, FiBriefcase, FiFolder, FiCalendar, FiDollarSign, FiBell, FiCheckSquare, FiList, FiMessageSquare, FiCreditCard, FiBarChart2, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

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
  { path: '/audit-logs', icon: FiList, label: 'Audit Logs' },
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
          {menuItems.map((item) => (
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
