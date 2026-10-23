/**
 * Date and time formatting helpers for mobile-friendly, single-line display
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  // Check if string is already formatted (e.g. contains English month)
  if (MONTH_NAMES.some((m) => typeof dateStr === 'string' && dateStr.includes(m))) {
    return dateStr;
  }

  // Handle ISO format YYYY-MM-DD
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
      }
    }
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }

  return dateStr;
}

export function formatDisplayDateTime(dateStr, timeStr) {
  const d = formatDisplayDate(dateStr);
  if (!d) return timeStr || '';
  if (!timeStr) return d;
  return `${d}, ${timeStr}`;
}
