import '@testing-library/jest-dom';

// Mock localStorage for jsdom
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i] || null,
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Notification API
Object.defineProperty(window, 'Notification', {
    value: { permission: 'denied', requestPermission: () => Promise.resolve('denied') },
    writable: true,
});

// Mock navigator.bluetooth
Object.defineProperty(navigator, 'bluetooth', { value: undefined, writable: true });

// Suppress ResizeObserver errors from Recharts
window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};
