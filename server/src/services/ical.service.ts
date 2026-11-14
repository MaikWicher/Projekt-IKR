interface IcalEventData {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  organizerName?: string;
  organizerEmail?: string;
}

export class IcalService {
  static generateIcs(event: IcalEventData): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const now = formatDate(new Date());
    const start = formatDate(new Date(event.start));
    const end = formatDate(new Date(event.end));

    const escapeText = (str: string) => {
      return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gdansk Hub Coworking//IKR Booking System//PL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.uid}@gdanskhub.pl`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeText(event.summary)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      'STATUS:CONFIRMED',
      event.organizerEmail ? `ORGANIZER;CN=${escapeText(event.organizerName || 'Gdansk Hub')}:mailto:${event.organizerEmail}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }
}
