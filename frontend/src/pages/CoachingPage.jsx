import React from 'react';
import { Heart } from 'lucide-react';
import HabitCoach from '../components/HabitCoach';
import Reminders from '../components/Reminders';

const CoachingPage = () => {
    return (
        <div className="page-content">
            <header className="page-header">
                <h1 className="page-title">
                    <Heart size={28} color="var(--primary)" />
                    Health Coaching
                </h1>
                <p className="page-description">Build healthy habits and never miss a check-up</p>
            </header>

            <div className="page-grid-2col">
                <HabitCoach />
                <Reminders />
            </div>
        </div>
    );
};

export default CoachingPage;
