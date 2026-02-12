
export const parseLocal = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  // Splitting ensures we map YYYY-MM-DD to local arguments (Year, MonthIndex, Day)
  // preventing UTC conversion shifts.
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return null;
  
  // Note: Month is 0-indexed in JS Date
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const getEndOfDay = (dateStr: string): Date | null => {
  const d = parseLocal(dateStr);
  if (!d) return null;
  d.setHours(23, 59, 59, 999);
  return d;
};
