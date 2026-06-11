import React, { useEffect, useState } from 'react';
import api from '../api';
import { Target, Droplets, Footprints, Brain } from 'lucide-react';

const HabitCoach = () => {
    const [habits, setHabits] = useState([]);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const res = await api.get('/habits');
                setHabits(res.data);
            } catch (error) {
                console.error("Error fetching habits:", error);
            }
        };
        fetchHabits();
    }, []);

    const getIcon = (title) => {
        if (title.includes('Water') || title.includes('Hydration')) return <Droplets size={20} />;
        if (title.includes('Walk') || title.includes('Step')) return <Footprints size={20} />;
        if (title.includes('Meditation') || title.includes('Stress')) return <Brain size={20} />;
        return <Target size={20} />;
    };

    const getDifficultyColor = (diff) => {
        if (diff === 'Easy') return 'var(--accent-green)';
        if (diff === 'Medium') return 'var(--accent-amber)';
        return 'var(--accent-red)';
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Target color="var(--primary)" />
                <h3>Daily Habit Coach</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {habits.map((habit, index) => (
                    <div key={index} style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '1rem',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${getDifficultyColor(habit.difficulty)}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                {getIcon(habit.title)}
                                <span>{habit.title}</span>
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.1)',
                                color: getDifficultyColor(habit.difficulty)
                            }}>
                                {habit.difficulty}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{habit.description}</p>
                    </div>
                ))}
                {habits.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No habits to show. Add readings to generate plan.</p>}
            </div>
        </div>
    );
};

export default HabitCoach;
