/**
 * Formats a blood pressure reading into a display string
 */
export function formatBP(systolic, diastolic) {
  if (!systolic || !diastolic) return '--/--';
  return `${systolic}/${diastolic} mmHg`;
}

/**
 * Gets the color code for a specific BP status
 */
export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'normal': return '#34d399';
    case 'elevated': return '#fbbf24';
    case 'stage 1 hypertension': return '#fb923c';
    case 'stage 2 hypertension': return '#ef4444';
    default: return '#9ca3af';
  }
}
