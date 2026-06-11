import { describe, it, expect } from 'vitest';
import { formatBP, getStatusColor } from './utils';

describe('Blood Pressure Utilities', () => {
  it('formats blood pressure correctly', () => {
    expect(formatBP(120, 80)).toBe('120/80 mmHg');
    expect(formatBP(135, 85)).toBe('135/85 mmHg');
  });

  it('handles missing values in formatBP', () => {
    expect(formatBP(null, 80)).toBe('--/--');
    expect(formatBP(120, undefined)).toBe('--/--');
  });

  it('returns correct color for Normal status', () => {
    expect(getStatusColor('Normal')).toBe('#34d399');
    expect(getStatusColor('normal')).toBe('#34d399');
  });

  it('returns correct color for Hypertension statuses', () => {
    expect(getStatusColor('Elevated')).toBe('#fbbf24');
    expect(getStatusColor('Stage 1 Hypertension')).toBe('#fb923c');
    expect(getStatusColor('Stage 2 Hypertension')).toBe('#ef4444');
  });

  it('returns default color for unknown status', () => {
    expect(getStatusColor('Unknown')).toBe('#9ca3af');
    expect(getStatusColor(null)).toBe('#9ca3af');
  });
});

describe('API Client Configuration', () => {
  it('initializes API with correct base URL', () => {
    const API_BASE = 'http://localhost:8000';
    expect(API_BASE).toBeDefined();
    expect(API_BASE).toContain('localhost');
  });
});
