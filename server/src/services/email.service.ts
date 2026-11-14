import nodemailer from 'nodemailer';
import { getTransporter } from '../config/mailer.js';
import { ENV } from '../config/env.js';

interface BookingEmailData {
  code: string;
  title: string;
  customerName: string;
  customerEmail: string;
  start: Date;
  end: Date;
  totalCost: number;
  attendeesCount: number;
  selectedEquipment?: string[];
  notes?: string | null;
}

interface RoomEmailData {
  name: string;
  categoryLabel: string;
  floor: string;
}

export class EmailService {
  static async sendBookingConfirmation(booking: BookingEmailData, room: RoomEmailData) {
    try {
      const transporter = await getTransporter();

      const parseDateForEmail = (d: Date | string) => {
        const s = typeof d === 'string' ? d : d.toISOString();
        return new Date(s.endsWith('Z') ? s : `${s}Z`);
      };

      const startDateFormatted = new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(parseDateForEmail(booking.start));

      const endTimeFormatted = new Intl.DateTimeFormat('pl-PL', {
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(parseDateForEmail(booking.end));

      const equipmentListHtml =
        booking.selectedEquipment && booking.selectedEquipment.length > 0
          ? `<ul>${booking.selectedEquipment.map(eq => `<li>${eq}</li>`).join('')}</ul>`
          : '<p style="color: #64748b; font-style: italic;">Brak dodatkowego sprzętu</p>';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 28px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
            .code-badge { display: inline-block; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); padding: 6px 14px; border-radius: 9999px; font-weight: bold; margin-top: 10px; font-size: 15px; }
            .content { padding: 28px; }
            .details-box { background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { font-weight: 600; color: #475569; }
            .value { font-weight: 500; color: #0f172a; text-align: right; }
            .price-total { font-size: 18px; font-weight: 800; color: #4f46e5; }
            .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Potwierdzenie Rezerwacji Sali</h1>
              <div class="code-badge">Kod: ${booking.code}</div>
            </div>
            <div class="content">
              <p>Dzień dobry <strong>${booking.customerName}</strong>,</p>
              <p>Twoja rezerwacja w <strong>Gdańsk Hub Coworking</strong> została pomyślnie zarejestrowana i potwierdzona w systemie!</p>

              <div class="details-box">
                <div class="detail-row">
                  <span class="label">Wydarzenie:</span>
                  <span class="value">${booking.title}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Sala / Przestrzeń:</span>
                  <span class="value">${room.name} (${room.categoryLabel})</span>
                </div>
                <div class="detail-row">
                  <span class="label">Lokalizacja:</span>
                  <span class="value">${room.floor}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Termin:</span>
                  <span class="value">${startDateFormatted} – ${endTimeFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Liczba uczestników:</span>
                  <span class="value">${booking.attendeesCount} os.</span>
                </div>
                <div class="detail-row">
                  <span class="label">Łączny koszt:</span>
                  <span class="value price-total">${booking.totalCost} PLN</span>
                </div>
              </div>

              <h4>Wyposażenie:</h4>
              ${equipmentListHtml}

              ${booking.notes ? `<h4>Uwagi dodatkowe:</h4><p style="background: #fffbeb; padding: 10px; border-left: 3px solid #f59e0b; border-radius: 4px;">${booking.notes}</p>` : ''}

              <p style="margin-top: 24px; font-size: 14px; color: #475569;">
                Recepcja i obsługa techniczna są do Twojej dyspozycji na 15 minut przed rozpoczęciem rezerwacji.
              </p>
            </div>
            <div class="footer">
              Gdańsk Hub Coworking & Tech Spaces • Al. Grunwaldzka, Gdańsk Oliwa<br>
              Wiadomość wygenerowana automatycznie przez system rezerwacji IKR.
            </div>
          </div>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: booking.customerEmail,
        subject: `[${booking.code}] Potwierdzenie rezerwacji: ${room.name}`,
        html: htmlContent
      });

      console.log(`✉️ Confirmation email sent to ${booking.customerEmail} (MessageId: ${info.messageId})`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
      }
      return info;
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      return null;
    }
  }

  static async sendBookingCancellation(booking: BookingEmailData, room: RoomEmailData) {
    try {
      const transporter = await getTransporter();

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
          <h2 style="color: #dc2626;">Rezerwacja ${booking.code} została anulowana</h2>
          <p>Dzień dobry <strong>${booking.customerName}</strong>,</p>
          <p>Informujemy, że rezerwacja <strong>${booking.title}</strong> w sali <strong>${room.name}</strong> została anulowana w systemie.</p>
          <p>Termin został zwolniony w kalendarzu. W razie pytań prosimy o kontakt z recepcją Hubu.</p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: booking.customerEmail,
        subject: `[${booking.code}] Anulowanie rezerwacji: ${room.name}`,
        html: htmlContent
      });

      console.log(`✉️ Cancellation email sent to ${booking.customerEmail}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error);
      return null;
    }
  }

  static async sendBookingReminder(booking: BookingEmailData, room: RoomEmailData) {
    try {
      const transporter = await getTransporter();

      const parseDateForEmail = (d: Date | string) => {
        const s = typeof d === 'string' ? d : d.toISOString();
        return new Date(s.endsWith('Z') ? s : `${s}Z`);
      };

      const startDateFormatted = new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(parseDateForEmail(booking.start));

      const endTimeFormatted = new Intl.DateTimeFormat('pl-PL', {
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(parseDateForEmail(booking.end));

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 28px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
            .code-badge { display: inline-block; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); padding: 6px 14px; border-radius: 9999px; font-weight: bold; margin-top: 10px; font-size: 15px; }
            .content { padding: 28px; }
            .alert-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 20px; color: #92400e; font-size: 14px; }
            .details-box { background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { font-weight: 600; color: #475569; }
            .value { font-weight: 500; color: #0f172a; text-align: right; }
            .checklist { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .checklist li { margin-bottom: 6px; font-size: 14px; color: #334155; }
            .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Przypomnienie o Zbliżającym się Wydarzeniu</h1>
              <div class="code-badge">Rezerwacja: ${booking.code}</div>
            </div>
            <div class="content">
              <div class="alert-box">
                ⏰ Twoje wydarzenie rozpocznie się już wkrótce! Poniżej znajdziesz najważniejsze informacje organizacyjne.
              </div>

              <p>Dzień dobry <strong>${booking.customerName}</strong>,</p>
              <p>Przypominamy o Twojej nadchodzącej rezerwacji w <strong>Gdańsk Business Hub</strong>.</p>

              <div class="details-box">
                <div class="detail-row">
                  <span class="label">Wydarzenie:</span>
                  <span class="value">${booking.title}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Sala / Przestrzeń:</span>
                  <span class="value">${room.name} (${room.categoryLabel})</span>
                </div>
                <div class="detail-row">
                  <span class="label">Lokalizacja:</span>
                  <span class="value">${room.floor}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Termin:</span>
                  <span class="value" style="font-weight: 700; color: #ea580c;">${startDateFormatted} – ${endTimeFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Uczestnicy:</span>
                  <span class="value">${booking.attendeesCount} os.</span>
                </div>
              </div>

              <div class="checklist">
                <h4 style="margin: 0 0 10px 0; color: #1e293b;">📌 Wskazówki przed przybyciem:</h4>
                <ul style="padding-left: 20px; margin: 0;">
                  <li><strong>Karty wejściowe:</strong> Odbiór w recepcji głównej na parterze na podstawie kodu <strong>${booking.code}</strong>.</li>
                  <li><strong>Szybkie Wi-Fi:</strong> Sieć dla gości: <code>GdanskHub-Guest</code> (dostęp bez hasła).</li>
                  <li><strong>Wsparcie techniczne:</strong> Obsługa techniczna jest dostępna pod numerem wewnętrznym <strong>+48 58 888 12 34</strong>.</li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #475569;">
                Życzymy udanego i owocnego spotkania! W razie potrzeby zmiany lub pytań zapraszamy do kontaktu z recepcją.
              </p>
            </div>
            <div class="footer">
              Gdańsk Hub Coworking & Tech Spaces • Al. Grunwaldzka, Gdańsk Oliwa<br>
              Wiadomość z automatycznym przypomnieniem z systemu rezerwacji IKR.
            </div>
          </div>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: booking.customerEmail,
        subject: `[Przypomnienie] Zbliża się Twoje spotkanie: ${booking.title} (${room.name})`,
        html: htmlContent
      });

      console.log(`🔔 Reminder email sent to ${booking.customerEmail} (MessageId: ${info.messageId})`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Reminder Preview URL: ${previewUrl}`);
      }
      return info;
    } catch (error) {
      console.error('❌ Failed to send reminder email:', error);
      return null;
    }
  }
}
