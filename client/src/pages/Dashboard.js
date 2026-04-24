import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiFileText, FiBriefcase, FiCalendar, FiDollarSign, FiBell, FiCheckSquare, FiMessageSquare, FiCreditCard, FiBarChart2, FiFolder, FiList, FiTrendingUp, FiClock } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    { title: 'Applicants', value: stats.applicants || 0, icon: FiUsers, color: '#3b82f6', path: '/applicants', desc: 'Manage applicant profiles' },
    { title: 'Applications', value: stats.applications || 0, icon: FiFileText, color: '#8b5cf6', path: '/applications', desc: `${stats.pendingApps || 0} pending review` },
    { title: 'Cases', value: stats.cases || 0, icon: FiBriefcase, color: '#f59e0b', path: '/cases', desc: `${stats.openCases || 0} open cases` },
    { title: 'Documents', value: '-', icon: FiFolder, color: '#10b981', path: '/documents', desc: 'Track verifications' },
    { title: 'Appointments', value: stats.appointments || 0, icon: FiCalendar, color: '#06b6d4', path: '/appointments', desc: 'Upcoming scheduled' },
    { title: 'Benefits', value: stats.benefits || 0, icon: FiDollarSign, color: '#22c55e', path: '/benefits', desc: 'Active disbursements' },
    { title: 'Eligibility', value: '-', icon: FiCheckSquare, color: '#ec4899', path: '/eligibility', desc: 'AI-powered screening' },
    { title: 'Notifications', value: stats.notifications || 0, icon: FiBell, color: '#ef4444', path: '/notifications', desc: 'Unread alerts' },
    { title: 'AI Assistant', value: 'AI', icon: FiMessageSquare, color: '#6366f1', path: '/ai-assistant', desc: 'Get AI-powered help' },
    { title: 'Benefits Calculator', value: 'AI', icon: FiCreditCard, color: '#14b8a6', path: '/benefits-calculator', desc: 'Calculate eligibility' },
    { title: 'Reports', value: 'AI', icon: FiBarChart2, color: '#f97316', path: '/reports', desc: 'Generate AI reports' },
    { title: 'Audit Logs', value: '-', icon: FiList, color: '#64748b', path: '/audit-logs', desc: 'System activity log' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.firstName}! Here's your system overview.</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <FiTrendingUp className="stat-icon" />
            <div>
              <span className="stat-value">{stats.approvedApps || 0}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
          <div className="header-stat">
            <FiClock className="stat-icon" />
            <div>
              <span className="stat-value">{stats.pendingApps || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className="dashboard-card" onClick={() => navigate(card.path)} style={{ '--card-color': card.color }}>
            <div className="card-icon-wrapper" style={{ backgroundColor: `${card.color}15` }}>
              <card.icon style={{ color: card.color }} />
            </div>
            <div className="card-info">
              <h3>{card.title}</h3>
              <p className="card-desc">{card.desc}</p>
            </div>
            <div className="card-value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
