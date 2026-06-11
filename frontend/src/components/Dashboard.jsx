import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import BPEntryForm from './BPEntryForm';
import TrendChart from './TrendChart';
import Recommendations from './Recommendations';
import HabitCoach from './HabitCoach';
import Reminders from './Reminders';
import DeviceConnector from './DeviceConnector';
import ChatCoach from './ChatCoach';

const Dashboard = ({ user }) => {
    const [readings, setReadings] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    const fetchData = async () => {
        try {
            const readingsRes = await axios.get('http://localhost:8000/readings');
            setReadings(readingsRes.data);

            if (readingsRes.data.length > 0) {
                const analysisRes = await axios.get('http://localhost:8000/analysis');
                setAnalysis(analysisRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem', textAlign: 'center', paddingTop: '1rem' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    color: 'var(--primary)',
                    marginBottom: '0.5rem',
                    fontWeight: 800,
                    letterSpacing: '-1px'
                }}>
                    Welcome Back, {user}!
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Activity size={20} color="var(--primary)" />
                    <span style={{ fontSize: '1.2rem' }}>AI Blood Pressure Assistant</span>
                </div>
            </header>

            <div className="grid">
                {/* Top Row: Recommendations & Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {analysis ? <Recommendations analysis={analysis} /> : <div>Loading Stats...</div>}
                    <DeviceConnector onReadingReceived={fetchData} />
                </div>

                {/* Middle Row: Chart & Input Form */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <TrendChart data={readings} />
                    <BPEntryForm onReadingAdded={fetchData} />
                </div>

                {/* Bottom Row: Habit Coach & Reminders */}
                <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                    <HabitCoach />
                    <Reminders />
                </div>
            </div>
            <ChatCoach />
        </div>
    );
};

export default Dashboard;
