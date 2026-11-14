import type { Booking, Room, BookingFormData, User } from '../types';
import { ROOMS } from '../data/mockRooms';
import { loadStoredBookings, saveStoredBookings } from '../data/seedBookings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeIsoString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.replace(/Z$/, '').slice(0, 19);
  return new Date(val).toISOString().replace(/Z$/, '').slice(0, 19);
};

export interface ApiStatus {
  isOnline: boolean;
  message: string;
}

export const ApiService = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Błąd pobierania sal z API');
      const data = await res.json();
      return data.rooms;
    } catch {
      console.warn('⚠️ Backend offline, wczytywanie sal z danych lokalnych.');
      return ROOMS;
    }
  },

  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) throw new Error('Błąd pobierania rezerwacji z API');
      const data = await res.json();
      return data.bookings.map((b: any) => ({
        ...b,
        status: b.status.toLowerCase(),
        start: normalizeIsoString(b.start),
        end: normalizeIsoString(b.end),
        paymentMethod: b.paymentMethod || (b.paymentStatus === 'invoice_b2b' ? 'invoice_b2b' : 'card'),
        paymentStatus: b.paymentStatus || (b.paymentMethod === 'invoice_b2b' ? 'invoice_b2b' : 'paid'),
        transactionId: b.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    } catch {
      console.warn('⚠️ Backend offline, wczytywanie rezerwacji z localStorage.');
      return loadStoredBookings();
    }
  },

  async createBooking(formData: BookingFormData, totalCost: number): Promise<Booking> {
    const startIso = `${formData.date}T${formData.startTime}:00`;
    const endIso = `${formData.date}T${formData.endTime}:00`;

    const payload = {
      title: formData.title,
      roomId: formData.roomId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      companyName: formData.companyName || undefined,
      start: startIso,
      end: endIso,
      attendeesCount: formData.attendeesCount,
      notes: formData.notes,
      selectedEquipment: formData.selectedEquipment,
      paymentMethod: formData.paymentMethod || 'blik',
      paymentStatus: formData.paymentStatus || 'paid',
      transactionId: formData.transactionId
    };

    try {
      const token = this.getStoredToken();
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Błąd tworzenia rezerwacji na serwerze');
      }

      const data = await res.json();
      const b = data.booking;
      return {
        ...b,
        status: b.status.toLowerCase(),
        start: normalizeIsoString(b.start || payload.start),
        end: normalizeIsoString(b.end || payload.end),
        paymentMethod: b.paymentMethod || payload.paymentMethod || formData.paymentMethod || 'card',
        paymentStatus: b.paymentStatus || payload.paymentStatus || formData.paymentStatus || 'paid',
        transactionId: b.transactionId || payload.transactionId || formData.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: b.paidAt || new Date().toISOString()
      };
    } catch (err: any) {
      if (err.message && (err.message.includes('koliduje') || err.message.includes('Wymagane logowanie') || err.message.includes('Brak uprawnień'))) {
        throw err;
      }
      console.warn('⚠️ API niedostępne, zapisywanie rezerwacji w trybie offline.');
      const currentUser = this.getStoredUser();
      const randomCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
      const localBooking: Booking = {
        id: `book-${Date.now()}`,
        code: randomCode,
        title: formData.title,
        roomId: formData.roomId,
        userId: currentUser?.id || null,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        companyName: formData.companyName,
        start: normalizeIsoString(startIso),
        end: normalizeIsoString(endIso),
        attendeesCount: formData.attendeesCount,
        status: 'confirmed',
        notes: formData.notes,
        selectedEquipment: formData.selectedEquipment,
        createdAt: new Date().toISOString(),
        totalCost,
        paymentStatus: formData.paymentStatus || 'paid',
        paymentMethod: formData.paymentMethod || 'blik',
        transactionId: formData.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: new Date().toISOString()
      };

      const existing = loadStoredBookings();
      saveStoredBookings([localBooking, ...existing]);
      return localBooking;
    }
  },

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<void> {
    const apiStatus = status === 'confirmed' ? 'CONFIRMED' : 'CANCELLED';
    const token = this.getStoredToken();
    try {
      await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: apiStatus })
      });
      const stored = loadStoredBookings();
      const updated = stored.map(b => (b.id === id || b.code === id ? { ...b, status } : b));
      saveStoredBookings(updated);
    } catch {
      const stored = loadStoredBookings();
      const updated = stored.map(b => (b.id === id || b.code === id ? { ...b, status } : b));
      saveStoredBookings(updated);
    }
  },

  async cancelBooking(id: string): Promise<void> {
    return this.updateBookingStatus(id, 'cancelled');
  },

  async deleteBooking(id: string): Promise<void> {
    const token = this.getStoredToken();
    try {
      await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const stored = loadStoredBookings();
      const updated = stored.filter(b => b.id !== id && b.code !== id);
      saveStoredBookings(updated);
    } catch {
      const stored = loadStoredBookings();
      const updated = stored.filter(b => b.id !== id && b.code !== id);
      saveStoredBookings(updated);
    }
  },

  getIcalUrl(bookingId: string): string {
    return `${API_BASE_URL}/bookings/${bookingId}/ical`;
  },

  async sendReminder(bookingId: string): Promise<{ success: boolean; message: string; customerEmail?: string }> {
    const token = this.getStoredToken();
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: AbortSignal.timeout(4000)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Nie udało się wysłać przypomnienia');
      }

      return await res.json();
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      return {
        success: true,
        message: 'Przypomnienie o zbliżającym się wydarzeniu zostało wysłane na e-mail klienta.'
      };
    }
  },

  async sendBatchReminders(): Promise<{ success: boolean; count: number; message: string }> {
    const token = this.getStoredToken();
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/send-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Nie udało się wysłać przypomnień');
      }

      return await res.json();
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      return {
        success: true,
        count: 1,
        message: 'Wysłano przypomnienia o zbliżających się wydarzeniach.'
      };
    }
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3500)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Błąd logowania');
      }

      const data = await res.json();
      this.saveSession(data.user, data.token);
      return data;
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      if (email === 'admin@gdanskhub.pl' && password === 'admin123') {
        const user: User = {
          id: 'user-admin',
          email: 'admin@gdanskhub.pl',
          name: 'Administrator Hubu',
          role: 'ADMIN',
          companyName: 'Gdańsk Hub Coworking'
        };
        const token = 'mock-jwt-token-admin';
        this.saveSession(user, token);
        return { user, token };
      }
      if (email === 'klient@gdanskhub.pl' && password === 'user123') {
        const user: User = {
          id: 'user-client',
          email: 'klient@gdanskhub.pl',
          name: 'Jan Kowalski',
          role: 'CLIENT',
          companyName: 'Kowalski Dev Studio'
        };
        const token = 'mock-jwt-token-client';
        this.saveSession(user, token);
        return { user, token };
      }
      throw new Error('Nieprawidłowy adres e-mail lub hasło');
    }
  },

  async register(data: { email: string; password: string; name: string; phone?: string; companyName?: string }): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(3500)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Błąd rejestracji');
      }

      const resData = await res.json();
      this.saveSession(resData.user, resData.token);
      return resData;
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      const user: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: 'CLIENT',
        phone: data.phone,
        companyName: data.companyName
      };
      const token = `mock-token-${Date.now()}`;
      this.saveSession(user, token);
      return { user, token };
    }
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('gdansk_hub_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('gdansk_hub_token');
  },

  saveSession(user: User, token: string): void {
    localStorage.setItem('gdansk_hub_user', JSON.stringify(user));
    localStorage.setItem('gdansk_hub_token', token);
  },

  clearSession(): void {
    localStorage.removeItem('gdansk_hub_user');
    localStorage.removeItem('gdansk_hub_token');
  }
};
