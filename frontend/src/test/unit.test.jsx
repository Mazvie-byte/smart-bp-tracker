/**
 * UNIT TESTS for React components.
 * 
 * Tests individual components render correctly in isolation.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ──────────────────────────────────────────────
// Recommendations Component
// ──────────────────────────────────────────────
import Recommendations from '../components/Recommendations';

describe('Unit: Recommendations Component', () => {
    const mockAnalysis = {
        status: 'Normal',
        trend: 'Stable',
        recommendation: 'Keep up the good work!',
    };

    it('renders nothing when analysis is null', () => {
        const { container } = render(<Recommendations analysis={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders status correctly', () => {
        render(<Recommendations analysis={mockAnalysis} />);
        expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('renders trend text', () => {
        render(<Recommendations analysis={mockAnalysis} />);
        expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('renders recommendation text', () => {
        render(<Recommendations analysis={mockAnalysis} />);
        expect(screen.getByText('Keep up the good work!')).toBeInTheDocument();
    });

    it('shows AI Recommendation label', () => {
        render(<Recommendations analysis={mockAnalysis} />);
        expect(screen.getByText('AI Recommendation')).toBeInTheDocument();
    });

    it('applies success color for Normal status', () => {
        render(<Recommendations analysis={mockAnalysis} />);
        const statusEl = screen.getByText('Normal');
        expect(statusEl).toHaveStyle({ color: 'var(--success)' });
    });

    it('applies warning color for Elevated status', () => {
        const elevated = { ...mockAnalysis, status: 'Elevated' };
        render(<Recommendations analysis={elevated} />);
        const statusEl = screen.getByText('Elevated');
        expect(statusEl).toHaveStyle({ color: 'var(--warning)' });
    });

    it('applies danger color for Hypertension status', () => {
        const hyper = { ...mockAnalysis, status: 'Stage 2 Hypertension' };
        render(<Recommendations analysis={hyper} />);
        const statusEl = screen.getByText('Stage 2 Hypertension');
        expect(statusEl).toHaveStyle({ color: 'var(--danger)' });
    });
});


// ──────────────────────────────────────────────
// TrendChart Component
// ──────────────────────────────────────────────
import TrendChart from '../components/TrendChart';

describe('Unit: TrendChart Component', () => {
    it('shows empty message when no data', () => {
        render(<TrendChart data={[]} />);
        expect(screen.getByText('No data available yet')).toBeInTheDocument();
    });

    it('shows empty message when data is null', () => {
        render(<TrendChart data={null} />);
        expect(screen.getByText('No data available yet')).toBeInTheDocument();
    });

    it('renders chart title when data exists', () => {
        const data = [
            { systolic: 120, diastolic: 80, heart_rate: 72, timestamp: new Date().toISOString() },
        ];
        render(<TrendChart data={data} />);
        expect(screen.getByText('Blood Pressure Trends')).toBeInTheDocument();
    });
});


// ──────────────────────────────────────────────
// HabitCoach Component
// ──────────────────────────────────────────────
import HabitCoach from '../components/HabitCoach';

// Mock axios for HabitCoach
vi.mock('axios', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}));

describe('Unit: HabitCoach Component', () => {
    it('renders the title', () => {
        render(<HabitCoach />);
        expect(screen.getByText('Daily Habit Coach')).toBeInTheDocument();
    });

    it('shows empty message when no habits', async () => {
        render(<HabitCoach />);
        const msg = await screen.findByText(/No habits to show/i);
        expect(msg).toBeInTheDocument();
    });
});


// ──────────────────────────────────────────────
// Reminders Component
// ──────────────────────────────────────────────
import Reminders from '../components/Reminders';

describe('Unit: Reminders Component', () => {
    it('renders the title', () => {
        render(<Reminders />);
        expect(screen.getByText('Smart Reminders')).toBeInTheDocument();
    });

    it('shows empty message when no reminders set', () => {
        // Clear localStorage
        localStorage.removeItem('bp_reminders');
        render(<Reminders />);
        expect(screen.getByText('No reminders set')).toBeInTheDocument();
    });

    it('renders the time input', () => {
        render(<Reminders />);
        const timeInput = document.querySelector('input[type="time"]');
        expect(timeInput).toBeInTheDocument();
    });

    it('renders the label input', () => {
        render(<Reminders />);
        const labelInput = screen.getByPlaceholderText('Label');
        expect(labelInput).toBeInTheDocument();
    });
});
