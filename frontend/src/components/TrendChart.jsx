import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                No data available yet
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        ...d,
        date: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
    })).slice(-14); // Last 14 readings

    return (
        <div className="card" id="trend-chart-container" style={{ height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Blood Pressure Trends</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[60, 180]} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <ReferenceLine y={120} stroke="#34d399" strokeDasharray="3 3" label="Normal Sys" />
                    <ReferenceLine y={80} stroke="#34d399" strokeDasharray="3 3" label="Normal Dia" />
                    <Line type="monotone" dataKey="systolic" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} name="Diastolic" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
