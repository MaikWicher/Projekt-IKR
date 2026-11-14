export function getLocalNow(): Date {
  return new Date(new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Warsaw' }).replace(' ', 'T') + 'Z');
}

export function parseLocalDate(val: string | Date): Date {
  if (val instanceof Date) return val;
  const str = String(val);
  return new Date(str.endsWith('Z') ? str : `${str}Z`);
}

export function formatBookingDates<T extends { start: Date | string; end: Date | string; paidAt?: Date | string | null }>(b: T): T {
  const formatIso = (v: Date | string) => {
    if (v instanceof Date) {
      return v.toISOString().replace(/Z$/, '').slice(0, 19);
    }
    return String(v).replace(/Z$/, '').slice(0, 19);
  };
  return {
    ...b,
    start: formatIso(b.start),
    end: formatIso(b.end),
    paidAt: b.paidAt ? (b.paidAt instanceof Date ? b.paidAt.toISOString() : b.paidAt) : b.paidAt
  };
}

