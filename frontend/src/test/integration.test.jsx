/**
 * INTEGRATION TESTS for React components.
 * 
 * Tests component interactions, form submissions, and state changes.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock axios
vi.mock('axios', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}));

import axios from 'axios';


// ──────────────────────────────────────────────
// BPEntryForm - Form Interactions
// ──────────────────────────────────────────────
import BPEntryForm from '../components/BPEntryForm';

describe('Integration: BPEntryForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all input fields', () => {
        render(<BPEntryForm />);
        expect(screen.getByPlaceholderText('120')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('80')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('75')).toBeInTheDocument();
    });

    it('renders lifestyle tag buttons', () => {
        render(<BPEntryForm />);
        expect(screen.getByText('Stressed')).toBeInTheDocument();
        expect(screen.getByText('Post-Exercise')).toBeInTheDocument();
        expect(screen.getByText('High Salt')).toBeInTheDocument();
        expect(screen.getByText('Caffeine')).toBeInTheDocument();
        expect(screen.getByText('Meds Taken')).toBeInTheDocument();
    });

    it('renders submit button', () => {
        render(<BPEntryForm />);
        expect(screen.getByText('Save Reading')).toBeInTheDocument();
    });

    it('calls API on form submission', async () => {
        const onReadingAdded = vi.fn();
        render(<BPEntryForm onReadingAdded={onReadingAdded} />);

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText('120'), '125');
        await user.type(screen.getByPlaceholderText('80'), '82');
        await user.type(screen.getByPlaceholderText('75'), '74');

        await user.click(screen.getByText('Save Reading'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8000/readings',
                expect.objectContaining({
                    systolic: 125,
                    diastolic: 82,
                    heart_rate: 74,
                })
            );
        });
    });

    it('clears inputs after successful submission', async () => {
        render(<BPEntryForm />);
        const user = userEvent.setup();

        const sysInput = screen.getByPlaceholderText('120');
        await user.type(sysInput, '120');
        await user.type(screen.getByPlaceholderText('80'), '80');
        await user.type(screen.getByPlaceholderText('75'), '72');
        await user.click(screen.getByText('Save Reading'));

        await waitFor(() => {
            expect(sysInput).toHaveValue(null);
        });
    });

    it('toggles lifestyle tags on click', async () => {
        render(<BPEntryForm />);
        const user = userEvent.setup();
        const stressedBtn = screen.getByText('Stressed');

        // Click to select
        await user.click(stressedBtn);
        expect(stressedBtn).toHaveStyle({ background: 'var(--primary)' });

        // Click to deselect
        await user.click(stressedBtn);
        expect(stressedBtn).toHaveStyle({ background: 'var(--bg-dark)' });
    });
});


// ──────────────────────────────────────────────
// Reminders - Add/Remove Interactions
// ──────────────────────────────────────────────
import Reminders from '../components/Reminders';

describe('Integration: Reminders', () => {
    beforeEach(() => {
        localStorage.removeItem('bp_reminders');
    });

    it('adds a new reminder', async () => {
        render(<Reminders />);
        const user = userEvent.setup();

        const timeInput = document.querySelector('input[type="time"]');
        const labelInput = screen.getByPlaceholderText('Label');

        await user.type(timeInput, '09:00');
        await user.type(labelInput, 'Morning Check');

        const addButton = document.querySelector('button[type="submit"]');
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Morning Check')).toBeInTheDocument();
        });
    });

    it('persists reminders to localStorage', async () => {
        render(<Reminders />);
        const user = userEvent.setup();

        const timeInput = document.querySelector('input[type="time"]');
        await user.type(timeInput, '14:30');

        const addButton = document.querySelector('button[type="submit"]');
        await user.click(addButton);

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem('bp_reminders'));
            expect(saved.length).toBe(1);
        });
    });
});


// ──────────────────────────────────────────────
// LoginPage - Login Flow
// ──────────────────────────────────────────────
import LoginPage from '../components/LoginPage';

describe('Integration: LoginPage', () => {
    it('renders login form', () => {
        render(<LoginPage onLogin={() => {}} />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('has name input', () => {
        render(<LoginPage onLogin={() => {}} />);
        const nameInput = screen.getByPlaceholderText(/name/i);
        expect(nameInput).toBeInTheDocument();
    });
});
