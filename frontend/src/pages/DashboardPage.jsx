import React, { useEffect, useState } from 'react';
import api from '../api';
import { Activity } from 'lucide-react';
import Recommendations from '../components/Recommendations';
import DeviceConnector from '../components/DeviceConnector';
import TrendChart from '../components/TrendChart';
import BPEntryForm from '../components/BPEntryForm';

const DashboardPage = ({ user }) => {
    const [readings, setReadings] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    const fetchData = async () => {
        try {
            const readingsRes = await api.get('/readings');
            setReadings(readingsRes.data);

            if (readingsRes.data.length > 0) {
                const analysisRes = await api.get('/analysis');
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
        <div className="page-content">
            <header className="page-header">
                <h1 className="page-welcome">
                    Welcome Back, {user}!
                </h1>
                <div className="page-subtitle">
                    <Activity size={20} color="var(--primary)" />
                    <span>AI Blood Pressure Assistant</span>
                </div>
            </header>

            {/* Row 1: Recommendations & Device Connector */}
            <div className="page-grid-2col" style={{ marginBottom: '1.5rem' }}>
                {analysis ? <Recommendations analysis={analysis} /> : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>
                        {readings.length === 0 ? 'Add readings to see your analysis' : 'Loading analysis...'}
                    </div>
                )}
                <DeviceConnector onReadingReceived={fetchData} />
            </div>

            {/* Row 2: Trend Chart & Entry Form */}
            <div className="page-grid-2col">
                <TrendChart data={readings} />
                <BPEntryForm onReadingAdded={fetchData} />
            </div>
        </div>
    );
};

export default DashboardPage;
