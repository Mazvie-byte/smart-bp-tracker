import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Heart, MessageSquare, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: isActive ? 600 : 400,
        fontSize: '0.95rem',
        color: isActive ? 'white' : 'var(--text-muted)',
        background: isActive ? 'var(--primary)' : 'transparent',
        transition: 'all 0.25s ease',
    });

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <Activity size={28} color="var(--primary)" />
                <span className="sidebar-title">BP Tracker</span>
            </div>

            <div className="sidebar-user">
                <div className="sidebar-avatar">{user?.charAt(0)?.toUpperCase()}</div>
                <span className="sidebar-username">{user}</span>
            </div>

            <div className="sidebar-links">
                <NavLink to="/" end style={linkStyle}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>
                <NavLink to="/coaching" style={linkStyle}>
                    <Heart size={20} />
                    Coaching
                </NavLink>
                <NavLink to="/ai-coach" style={linkStyle}>
                    <MessageSquare size={20} />
                    AI Coach
                </NavLink>
            </div>

            <button className="sidebar-logout" onClick={onLogout}>
                <LogOut size={18} />
                Log Out
            </button>
        </nav>
    );
};

export default Navbar;
