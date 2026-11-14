import React, { useState, useMemo } from 'react';
import {
  Search, Calendar, DollarSign, Clock, CheckCircle2,
  XCircle, Edit3, Trash2, Download, RefreshCw, FileText,
  Eye, MessageSquarePlus, CreditCard, UserCheck
} from 'lucide-react';
import type { Booking, BookingStatus, FilterState, User } from '../types';
import { ROOMS, getRoomById } from '../data/mockRooms';
import { formatPolishDate, formatPolishTime, formatPaymentMethodShort } from '../utils/calendarUtils';

interface AdminDashboardProps {
  bookings: Booking[];
  onOpenDetails: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
  onDeleteBooking: (bookingId: string) => void;
  onResetData: () => void;
  onOpenNewBooking: () => void;
  currentUser?: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  onOpenDetails,
  onEditBooking,
  onStatusChange,
  onDeleteBooking,
  onResetData,
  onOpenNewBooking,
  currentUser
}) => {
  const [onlyMyBookings, setOnlyMyBookings] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    roomId: 'all',
    status: 'all',
    dateFilter: 'all',
    sortBy: 'date-asc'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === 'confirmed');
    const today = active.filter(b => b.start.startsWith(todayStr));
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    const totalRevenue = active.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    return {
      totalCount: bookings.length,
      todayCount: today.length,
      cancelledCount: cancelled.length,
      totalRevenue
    };
  }, [bookings, todayStr]);

  const filteredBookings = useMemo(() => {
    const nowTime = new Date().getTime();

    return bookings.filter(b => {
      if (onlyMyBookings && currentUser) {
        const isMine =
          (Boolean(b.userId) && b.userId === currentUser.id) ||
          (Boolean(b.customerEmail) && Boolean(currentUser.email) && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (Boolean(b.customerName) && Boolean(currentUser.name) && b.customerName.toLowerCase() === currentUser.name.toLowerCase());
        if (!isMine) return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(query);
        const matchCode = b.code.toLowerCase().includes(query);
        const matchName = b.customerName.toLowerCase().includes(query);
        const matchEmail = b.customerEmail.toLowerCase().includes(query);
        const matchCompany = b.companyName?.toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchName && !matchEmail && !matchCompany) {
          return false;
        }
      }

      if (filters.roomId !== 'all' && b.roomId !== filters.roomId) {
        return false;
      }

      if (filters.status !== 'all' && b.status !== filters.status) {
        return false;
      }

      const startTime = new Date(b.start).getTime();
      if (filters.dateFilter === 'today') {
        if (!b.start.startsWith(todayStr)) return false;
      } else if (filters.dateFilter === 'upcoming') {
        if (startTime < nowTime) return false;
      } else if (filters.dateFilter === 'past') {
        if (startTime >= nowTime) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date-asc') {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      if (filters.sortBy === 'date-desc') {
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      }
      if (filters.sortBy === 'name-asc') {
        return a.customerName.localeCompare(b.customerName);
      }
      if (filters.sortBy === 'cost-desc') {
        return b.totalCost - a.totalCost;
      }
      return 0;
    });
  }, [bookings, filters, todayStr, onlyMyBookings, currentUser]);

  const handleExportCsv = () => {
    const headers = ['Kod', 'Tytuł', 'Sala', 'Klient', 'Email', 'Telefon', 'Start', 'Koniec', 'Uczestnicy', 'Kwota (PLN)', 'Status', 'Notatki'];
    const rows = filteredBookings.map(b => {
      const room = getRoomById(b.roomId);
      return [
        b.code,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${(room?.name || '').replace(/"/g, '""')}"`,
        `"${b.customerName.replace(/"/g, '""')}"`,
        b.customerEmail,
        b.customerPhone,
        b.start,
        b.end,
        b.attendeesCount,
        b.totalCost,
        b.status,
        `"${(b.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rezerwacje_gdansk_hub_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-section animate-fade-in">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Wszystkie rezerwacje</span>
            <span className="kpi-value">{stats.totalCount}</span>
            <span className="kpi-subtext">W bazie systemu</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Rezerwacje na dziś</span>
            <span className="kpi-value">{stats.todayCount}</span>
            <span className="kpi-subtext">Harmonogram bieżącego dnia</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--rose)' }}>
            <XCircle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Anulowane</span>
            <span className="kpi-value">{stats.cancelledCount}</span>
            <span className="kpi-subtext">Zwolnione terminy</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan)' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Szacowany obrót</span>
            <span className="kpi-value">{stats.totalRevenue} PLN</span>
            <span className="kpi-subtext">Z aktywnych rezerwacji</span>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Szukaj po nazwisku, emailu, firmie lub kodzie (#RES)..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-controls-row">
          <select
            className="filter-select"
            value={filters.roomId}
            onChange={e => setFilters(prev => ({ ...prev, roomId: e.target.value }))}
          >
            <option value="all">Wszystkie sale</option>
            {ROOMS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Wszystkie statusy</option>
            <option value="confirmed">Tylko potwierdzone</option>
            <option value="cancelled">Tylko anulowane</option>
          </select>

          <select
            className="filter-select"
            value={filters.dateFilter}
            onChange={e => setFilters(prev => ({ ...prev, dateFilter: e.target.value as any }))}
          >
            <option value="all">Wszystkie terminy</option>
            <option value="today">Tylko dzisiaj</option>
            <option value="upcoming">Nadchodzące</option>
            <option value="past">Zakończone / Minione</option>
          </select>

          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="date-asc">Data: od najbliższych</option>
            <option value="date-desc">Data: od najdalszych</option>
            <option value="name-asc">Klient: A-Z</option>
            <option value="cost-desc">Kwota: od najwyższej</option>
          </select>

          <button
            type="button"
            className="filter-select"
            onClick={() => setOnlyMyBookings(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: onlyMyBookings ? 'rgba(16, 185, 129, 0.18)' : undefined,
              borderColor: onlyMyBookings ? 'var(--emerald)' : undefined,
              color: onlyMyBookings ? 'var(--emerald)' : undefined
            }}
            title={onlyMyBookings ? 'Pokaż wszystkie rezerwacje w systemie' : 'Pokaż tylko rezerwacje powiązane z Twoim kontem'}
          >
            <UserCheck size={14} />
            <span>Tylko moje rezerwacje</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCsv}
            title="Eksportuj rezerwacje do pliku CSV"
          >
            <Download size={15} /> CSV
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onResetData}
            title="Przywróć początkowe dane demonstracyjne"
          >
            <RefreshCw size={15} /> Resetuj dane
          </button>
        </div>
      </div>

      <div className="table-card">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={28} />
            </div>
            <h3>Brak rezerwacji spełniających kryteria</h3>
            <p>Spróbuj zmienić parametry filtrów lub wyszukiwaną frazę.</p>
            <button type="button" className="btn-primary" onClick={onOpenNewBooking}>
              Dodaj nową rezerwację
            </button>
          </div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Kod / Tytuł</th>
                <th>Sala & Przestrzeń</th>
                <th>Klient & Kontakt</th>
                <th>Termin rezerwacji</th>
                <th>Wartość</th>
                <th>Status</th>
                <th>Notatki</th>
                <th style={{ textAlign: 'right' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => {
                const room = getRoomById(b.roomId);
                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="booking-ref-badge">{b.code}</span>
                        <strong style={{ fontSize: '0.88rem' }}>{b.title}</strong>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: room?.color || '#6366f1'
                          }}
                        ></span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{room?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {b.attendeesCount} os. • {room?.floor}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{b.customerName}</span>
                        {b.companyName && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.companyName}</span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.customerEmail}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{formatPolishDate(b.start)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatPolishTime(b.start)} - {formatPolishTime(b.end)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: 'var(--emerald)', fontSize: '0.9rem' }}>
                          {b.totalCost} PLN
                        </strong>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: b.paymentStatus === 'invoice_b2b' ? '#f59e0b' : '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <CreditCard size={10} />
                          {b.paymentStatus === 'invoice_b2b'
                            ? 'Faktura B2B'
                            : formatPaymentMethodShort(b.paymentMethod)}
                        </span>
                      </div>
                    </td>

                    <td>
                      {b.status === 'confirmed' ? (
                        <span className="status-pill status-confirmed">
                          <CheckCircle2 size={11} /> Potwierdzona
                        </span>
                      ) : (
                        <span className="status-pill status-cancelled">
                          <XCircle size={11} /> Anulowana
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {b.notes && (
                          <span
                            title={`Notatka klienta: ${b.notes}`}
                            style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            <FileText size={16} />
                          </span>
                        )}
                        {b.adminNotes && (
                          <span
                            title={`Notatka admina: ${b.adminNotes}`}
                            style={{ cursor: 'pointer', color: 'var(--amber)' }}
                          >
                            <MessageSquarePlus size={16} />
                          </span>
                        )}
                        {!b.notes && !b.adminNotes && (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="action-btn"
                          title="Szczegóły rezerwacji"
                          onClick={() => onOpenDetails(b)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          title="Edytuj rezerwację"
                          onClick={() => onEditBooking(b)}
                        >
                          <Edit3 size={15} />
                        </button>
                        {b.status !== 'cancelled' ? (
                          <button
                            type="button"
                            className="action-btn danger"
                            title="Anuluj rezerwację"
                            onClick={() => onStatusChange(b.id, 'cancelled')}
                          >
                            <XCircle size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="action-btn danger"
                            title="Usuń trwale"
                            onClick={() => onDeleteBooking(b.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
