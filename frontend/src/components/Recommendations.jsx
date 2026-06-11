import React from 'react';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const Recommendations = ({ analysis }) => {
    if (!analysis) return null;

    const { status, trend, recommendation } = analysis;

    const getStatusColor = (status) => {
        if (status === 'Normal') return 'var(--accent-green)';
        if (status === 'Elevated') return 'var(--accent-amber)';
        return 'var(--accent-red)';
    };

    const getStatusIcon = (status) => {
        if (status === 'Normal') return <CheckCircle size={24} color="var(--accent-green)" />;
        if (status === 'Elevated') return <AlertTriangle size={24} color="var(--accent-amber)" />;
        return <AlertTriangle size={24} color="var(--accent-red)" />;
    };

    return (
        <div className="card" id="recommendations-container" style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', border: `1px solid ${getStatusColor(status)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                {getStatusIcon(status)}
                <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Status</span>
                    <h2 style={{ color: getStatusColor(status) }}>{status}</h2>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Trend detected: </span>
                <span style={{ fontWeight: 600 }}>{trend}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Zap size={16} color="var(--accent-amber)" />
                    <h4 style={{ color: 'var(--accent-amber)' }}>AI Recommendation</h4>
                </div>
                <p style={{ margin: 0, lineHeight: '1.5' }}>{recommendation}</p>
            </div>
        </div>
    );
};

export default Recommendations;
