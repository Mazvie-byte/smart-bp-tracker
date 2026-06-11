/**
 * SYSTEM TESTS for the full React application.
 * 
 * Tests complete page rendering and navigation flows.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock axios globally
vi.mock('axios', () => ({
    default: {
        get: vi.fn((url) => {
            if (url.includes('/readings')) return Promise.resolve({ data: [] });
            if (url.includes('/analysis')) return Promise.resolve({ data: { status: 'Normal', trend: 'Stable', recommendation: 'Good!', average_systolic: 115, average_diastolic: 75, correlations: [] } });
            if (url.includes('/habits')) return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
        }),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })),
        button: React.forwardRef((props, ref) => React.createElement('button', { ...props, ref })),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

import App from '../App';

// Helper: login with the given name
async function loginAs(user, name) {
    const nameInput = screen.getByPlaceholderText('Enter your name');
    await user.type(nameInput, name);

    // Password field uses bullet placeholder
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) await user.type(passwordInput, 'testpass');

    // Submit the form
    const submitBtn = document.querySelector('button[type="submit"]');
    await user.click(submitBtn);
}


// ──────────────────────────────────────────────
// Full App Rendering
// ──────────────────────────────────────────────

describe('System: Full Application', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login page on initial load', () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    });

    it('shows dashboard after login', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const user = userEvent.setup();
        await loginAs(user, 'TestUser');

        await waitFor(() => {
            expect(screen.getByText(/Welcome Back, TestUser/i)).toBeInTheDocument();
        });
    });

    it('shows navigation sidebar after login', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const user = userEvent.setup();
        await loginAs(user, 'Test');

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Coaching')).toBeInTheDocument();
            expect(screen.getByText('AI Coach')).toBeInTheDocument();
        });
    });

    it('navigates to Coaching page', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const user = userEvent.setup();
        await loginAs(user, 'User');

        await waitFor(() => {
            expect(screen.getByText('Coaching')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Coaching'));

        await waitFor(() => {
            expect(screen.getByText('Health Coaching')).toBeInTheDocument();
            expect(screen.getByText('Daily Habit Coach')).toBeInTheDocument();
            expect(screen.getByText('Smart Reminders')).toBeInTheDocument();
        });
    });

    it('logs out and returns to login', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const user = userEvent.setup();
        await loginAs(user, 'User');

        await waitFor(() => {
            expect(screen.getByText('Log Out')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Log Out'));

        await waitFor(() => {
            expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        });
    });
});


// ──────────────────────────────────────────────
// Page-Level System Tests
// ──────────────────────────────────────────────

describe('System: Dashboard Page', () => {
    it('renders dashboard with all sections', async () => {
        const { default: DashboardPage } = await import('../pages/DashboardPage');
        render(
            <MemoryRouter>
                <DashboardPage user="Test" />
            </MemoryRouter>
        );

        expect(screen.getByText(/Welcome Back, Test/i)).toBeInTheDocument();
        expect(screen.getByText('Device Connect')).toBeInTheDocument();
        expect(screen.getByText('No data available yet')).toBeInTheDocument();
        expect(screen.getByText('Log New Reading')).toBeInTheDocument();
    });
});

describe('System: Coaching Page', () => {
    it('renders coaching page with all sections', async () => {
        const { default: CoachingPage } = await import('../pages/CoachingPage');
        render(
            <MemoryRouter>
                <CoachingPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Health Coaching')).toBeInTheDocument();
        expect(screen.getByText('Daily Habit Coach')).toBeInTheDocument();
        expect(screen.getByText('Smart Reminders')).toBeInTheDocument();
    });
});
