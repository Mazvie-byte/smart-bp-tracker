import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import TrendChart from '../components/TrendChart';
import BPEntryForm from '../components/BPEntryForm';

const ReadingsPage = () => {
    const [readings, setReadings] = useState([]);

    const fetchReadings = async () => {
        try {
            const res = await axios.get('http://localhost:8000/readings');
            setReadings(res.data);
        } catch (error) {
            console.error("Error fetching readings:", error);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    return (
        <div className="page-content">
            <header className="page-header">
                <h1 className="page-title">
                    <Activity size={28} color="var(--primary)" />
                    Blood Pressure Readings
                </h1>
                <p className="page-description">Track and log your blood pressure over time</p>
            </header>

            <div className="page-grid-2col">
                <TrendChart data={readings} />
                <BPEntryForm onReadingAdded={fetchReadings} />
            </div>
        </div>
    );
};

export default ReadingsPage;
