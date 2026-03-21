export function ensureEndIso(startISO, endISO) {
  if (endISO) return endISO;

  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid startISO provided');
  }

  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return end.toISOString();
}

export function assertValidIso(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}. Expected ISO-8601 datetime string.`);
  }
}
