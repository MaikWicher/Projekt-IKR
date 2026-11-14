import type { Booking } from '../types';
import { jsPDF } from 'jspdf';

export const checkBookingCollision = (
  roomId: string,
  startIso: string,
  endIso: string,
  bookings: Booking[],
  excludeBookingId?: string
): { hasCollision: boolean; conflictingBooking?: Booking } => {
  const newStart = new Date(startIso).getTime();
  const newEnd = new Date(endIso).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || newStart >= newEnd) {
    return { hasCollision: true };
  }

  for (const b of bookings) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (b.status === 'cancelled') continue;
    if (b.roomId !== roomId) continue;

    const existingStart = new Date(b.start).getTime();
    const existingEnd = new Date(b.end).getTime();

    if (newStart < existingEnd && newEnd > existingStart) {
      return { hasCollision: true, conflictingBooking: b };
    }
  }

  return { hasCollision: false };
};

export const calculateDurationHours = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
};

export const calculateTotalCost = (hourlyRate: number, startIso: string, endIso: string): number => {
  const hours = calculateDurationHours(startIso, endIso);
  return Math.round(hours * hourlyRate);
};

export const formatPaymentMethod = (method?: string): string => {
  switch (method) {
    case 'card':
      return 'Karta płatnicza (Visa/Mastercard)';
    case 'transfer':
      return 'Szybki przelew online (Przelewy24)';
    case 'google_pay':
      return 'Google Pay';
    case 'apple_pay':
      return 'Apple Pay';
    case 'invoice_b2b':
      return 'Faktura B2B (termin 14 dni)';
    case 'blik':
      return 'Kod BLIK';
    default:
      return 'Płatność online';
  }
};

export const formatPaymentMethodShort = (method?: string): string => {
  switch (method) {
    case 'card':
      return 'Karta płatnicza';
    case 'transfer':
      return 'Szybki przelew';
    case 'google_pay':
      return 'Google Pay';
    case 'apple_pay':
      return 'Apple Pay';
    case 'invoice_b2b':
      return 'Faktura B2B';
    case 'blik':
      return 'Kod BLIK';
    default:
      return 'Płatność online';
  }
};

export const formatPolishDate = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const clean = isoString.replace(/Z$/, '');
    const d = new Date(clean);
    return d.toLocaleDateString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

export const formatPolishTime = (isoString: string): string => {
  if (!isoString) return '';
  const clean = isoString.replace(/Z$/, '');
  if (clean.includes('T')) {
    const timePart = clean.split('T')[1];
    if (timePart && timePart.length >= 5) {
      return timePart.slice(0, 5);
    }
  }
  try {
    const d = new Date(clean);
    return d.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export const formatFullDateTimeRange = (startIso: string, endIso: string): string => {
  if (!startIso) return '';
  try {
    const cleanStart = startIso.replace(/Z$/, '');
    const cleanEnd = (endIso || '').replace(/Z$/, '');
    const dStart = new Date(cleanStart);
    const dateStr = dStart.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStart = formatPolishTime(cleanStart);
    const timeEnd = formatPolishTime(cleanEnd);
    return `${dateStr}, ${timeStart} - ${timeEnd}`;
  } catch {
    return `${startIso} - ${endIso}`;
  }
};

export const downloadPdfConfirmation = (booking: Booking, roomName: string): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const clean = (str: string) => {
    if (!str) return '';
    return str
      .replace(/ą/g, 'a').replace(/Ą/g, 'A')
      .replace(/ć/g, 'c').replace(/Ć/g, 'C')
      .replace(/ę/g, 'e').replace(/Ę/g, 'E')
      .replace(/ł/g, 'l').replace(/Ł/g, 'L')
      .replace(/ń/g, 'n').replace(/Ń/g, 'N')
      .replace(/ó/g, 'o').replace(/Ó/g, 'O')
      .replace(/ś/g, 's').replace(/Ś/g, 'S')
      .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
      .replace(/ż/g, 'z').replace(/Ż/g, 'Z');
  };

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 44, 'F');

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 44, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GDANSK BUSINESS & COWORK HUB', 20, 19);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('System rezerwacji sal konferencyjnych i przestrzeni biznesowych w Gdansku', 20, 27);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Olivia Centre • Al. Grunwaldzka 472 • tel. +48 58 555 12 34 • kontakt@gdanskhub.pl', 20, 35);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POTWIERDZENIE REZERWACJI', 20, 58);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Bilet wstepu i oficjalne potwierdzenie rezerwacji przestrzeni', 20, 64);
  doc.text(`Wystawiono: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}  •  Status: POTWIERDZONA`, 20, 70);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.6);
  doc.roundedRect(136, 50, 54, 22, 3, 3, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text('NUMER REZERWACJI', 163, 57, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(booking.code, 163, 66, { align: 'center' });

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 78, 170, 44, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 78, 170, 44, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('SZCZEGOLY WYNAJETEGO MIEJSCA', 26, 86);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Tytul rezerwacji:', 26, 94);
  doc.text('Przestrzen / Sala:', 26, 102);
  doc.text('Termin spotkania:', 26, 110);
  doc.text('Liczba osob:', 26, 118);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(clean(booking.title), 65, 94, { maxWidth: 120 });
  doc.text(clean(roomName), 65, 102, { maxWidth: 120 });
  doc.text(clean(formatFullDateTimeRange(booking.start, booking.end)), 65, 110, { maxWidth: 120 });
  doc.text(`${booking.attendeesCount} osob`, 65, 118);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 128, 170, 44, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 128, 170, 44, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('DANE OSOBY REZERWUJACEJ', 26, 136);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Imie i nazwisko:', 26, 144);
  doc.text('Firma / Organizacja:', 26, 152);
  doc.text('Adres e-mail:', 26, 160);
  doc.text('Telefon kontaktowy:', 26, 168);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(clean(booking.customerName), 65, 144, { maxWidth: 120 });
  doc.text(clean(booking.companyName || 'Klient indywidualny'), 65, 152, { maxWidth: 120 });
  doc.text(booking.customerEmail, 65, 160, { maxWidth: 120 });
  doc.text(booking.customerPhone, 65, 168, { maxWidth: 120 });

  let nextY = 180;
  if (booking.selectedEquipment && booking.selectedEquipment.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Wyposazenie w cenie:', 26, nextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitEquipment = doc.splitTextToSize(clean(booking.selectedEquipment.join(', ')), 120);
    doc.text(splitEquipment, 65, nextY);
    nextY += (splitEquipment.length * 5) + 3;
  }

  if (booking.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Uwagi do rezerwacji:', 26, nextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitNotes = doc.splitTextToSize(clean(booking.notes), 120);
    doc.text(splitNotes, 65, nextY);
    nextY += (splitNotes.length * 5) + 6;
  } else {
    nextY += 4;
  }

  doc.setFillColor(16, 185, 129);
  doc.roundedRect(20, nextY + 2, 170, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('KOSZT WYNAJMU (BRUTTO):', 28, nextY + 12);

  doc.setFontSize(16);
  doc.text(`${booking.totalCost} PLN`, 182, nextY + 12, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const isInvoice = booking.paymentStatus === 'invoice_b2b' || booking.paymentMethod === 'invoice_b2b';
  const paymentText = isInvoice
    ? 'FAKTURA B2B (TERMIN 14 DNI)'
    : 'STATUS: OPLACONO ONLINE 100%';
  const methodText = isInvoice
    ? 'PRZELEW TRADYCYJNY B2B'
    : booking.paymentMethod === 'card'
    ? 'KARTA PLATNICZA (VISA / MASTERCARD)'
    : booking.paymentMethod === 'transfer'
    ? 'SZYBKI PRZELEW ONLINE (PRZELEWY24)'
    : booking.paymentMethod === 'google_pay'
    ? 'GOOGLE / APPLE PAY'
    : booking.paymentMethod === 'apple_pay'
    ? 'APPLE PAY'
    : booking.paymentMethod === 'blik'
    ? 'KOD BLIK'
    : 'KARTA PLATNICZA / ONLINE';
  const txText = booking.transactionId || 'PAY-ONLINE';
  doc.text(`${paymentText}   |   METODA: ${methodText}   |   NR TRANSAKCJI: ${txText}`, 28, nextY + 20);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Niniejsze potwierdzenie uprawnia do wstepu do zarezerwowanej przestrzeni w Gdansk Business Hub.', 20, nextY + 33);
  doc.text('W cenie zawarty jest dostep do strefy kuchennej, kawy, herbaty oraz sieci Wi-Fi 6.', 20, nextY + 38);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, 275, 190, 275);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Gdansk Business & Cowork Hub  •  Al. Grunwaldzka 472, Gdansk Oliwa  •  tel. +48 58 555 12 34', 20, 281);
  doc.text('Dziekujemy za rezerwacje i zyczymy udanego spotkania w Gdansku!', 20, 286);

  doc.save(`Potwierdzenie_Rezerwacji_${booking.code}.pdf`);
};

export const downloadIcsFile = (booking: Booking, roomName: string): void => {
  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch {
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
  };

  const now = formatDate(new Date().toISOString());
  const start = formatDate(booking.start);
  const end = formatDate(booking.end);

  const escapeText = (str: string) => {
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gdansk Business Hub//Coworking Calendar//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.code || booking.id}@gdanskhub.pl`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(`${booking.title} (${roomName})`)}`,
    `DESCRIPTION:${escapeText(`Rezerwacja przestrzeni w Gdańsk Business Hub. Kod rezerwacji: ${booking.code}. Uczestników: ${booking.attendeesCount}. ${booking.notes || ''}`)}`,
    `LOCATION:${escapeText(`${roomName}, Gdańsk Business Hub`)}`,
    'STATUS:CONFIRMED',
    'ORGANIZER;CN=Gdansk Business Hub:mailto:rezerwacje@gdanskhub.pl',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${booking.code || 'rezerwacja'}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (booking: Booking, roomName: string): string => {
  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch {
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
  };
  const start = formatDate(booking.start);
  const end = formatDate(booking.end);
  const title = encodeURIComponent(`${booking.title} (${roomName})`);
  const details = encodeURIComponent(`Rezerwacja w Gdańsk Business Hub\nKod rezerwacji: ${booking.code}\nSala: ${roomName}\nUczestników: ${booking.attendeesCount}\n${booking.notes || ''}`);
  const location = encodeURIComponent(`${roomName}, Gdańsk Business Hub`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const createEmailSimulation = (booking: Booking, roomName: string) => {
  const dateFormatted = formatFullDateTimeRange(booking.start, booking.end);
  const subject = `Potwierdzenie rezerwacji ${booking.code}: ${booking.title} w Gdańsk Business Hub`;

  return {
    to: booking.customerEmail,
    recipient: booking.customerName,
    subject,
    dateRange: dateFormatted,
    cost: booking.totalCost,
    code: booking.code,
    roomName
  };
};
