export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
}

export type RoomType = 'conference' | 'meeting' | 'studio' | 'desk' | 'workshop';

export interface Room {
  id: string;
  name: string;
  category: RoomType;
  categoryLabel: string;
  capacity: number;
  hourlyRate: number;
  color: string;
  bgColor: string;
  borderColor: string;
  equipment: string[];
  description: string;
  floor: string;
  imageUrl?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export type PaymentMethod = 'blik' | 'card' | 'transfer' | 'google_pay' | 'apple_pay' | 'invoice_b2b';
export type PaymentStatus = 'paid' | 'pending' | 'invoice_b2b';

export interface Booking {
  id: string;
  code: string;
  title: string;
  roomId: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  start: string;
  end: string;
  attendeesCount: number;
  status: BookingStatus;
  notes?: string;
  adminNotes?: string;
  selectedEquipment?: string[];
  createdAt: string;
  totalCost: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
}

export interface BookingFormData {
  title: string;
  roomId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeesCount: number;
  notes?: string;
  selectedEquipment: string[];
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

export interface FilterState {
  search: string;
  roomId: string;
  status: string;
  dateFilter: 'all' | 'today' | 'upcoming' | 'past';
  sortBy: 'date-asc' | 'date-desc' | 'name-asc' | 'cost-desc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
