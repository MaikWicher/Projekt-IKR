import React, { useMemo } from 'react';
import { Filter, Users, Sparkles, UserCheck } from 'lucide-react';
import { ROOMS } from '../data/mockRooms';
import type { Booking, User } from '../types';

interface RoomFilterBarProps {
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  bookings: Booking[];
  currentUser?: User | null;
  onlyMyBookings?: boolean;
  onToggleOnlyMyBookings?: () => void;
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  selectedRoomId,
  onSelectRoom,
  bookings,
  currentUser,
  onlyMyBookings,
  onToggleOnlyMyBookings
}) => {
  const countPerRoom = (roomId: string) => {
    return bookings.filter(b => b.roomId === roomId && b.status !== 'cancelled').length;
  };

  const totalActiveBookings = bookings.filter(b => b.status !== 'cancelled').length;

  const myBookingsCount = useMemo(() => {
    if (!currentUser) return 0;
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      return (
        (Boolean(b.userId) && b.userId === currentUser.id) ||
        (Boolean(b.customerEmail) && Boolean(currentUser.email) && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
      );
    }).length;
  }, [bookings, currentUser]);

  return (
    <div className="filter-bar-card">
      <div className="filter-bar-header">
        <div className="filter-bar-title">
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <span>Filtruj przestrzeń i sale:</span>
        </div>

        <div className="filter-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--emerald)' }}></span>
            <span>Potwierdzona rezerwacja</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px dashed var(--text-dim)' }}></span>
            <span>Wolny slot (kliknij aby zarezerwować)</span>
          </div>
        </div>
      </div>

      <div className="room-pills-container">
        <button
          type="button"
          className={`room-pill ${selectedRoomId === 'all' && !onlyMyBookings ? 'active' : ''}`}
          onClick={() => {
            if (onlyMyBookings && onToggleOnlyMyBookings) {
              onToggleOnlyMyBookings();
            }
            onSelectRoom('all');
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <span>Wszystkie przestrzenie</span>
          <span className="pill-badge">{totalActiveBookings}</span>
        </button>

        <button
          type="button"
          className={`room-pill ${onlyMyBookings ? 'active' : ''}`}
          onClick={onToggleOnlyMyBookings}
          style={
            onlyMyBookings
              ? {
                  background: 'rgba(16, 185, 129, 0.18)',
                  borderColor: 'var(--emerald)',
                  color: 'var(--emerald)',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)'
                }
              : {}
          }
          title={
            currentUser
              ? onlyMyBookings
                ? 'Wyłącz filtr moich rezerwacji'
                : 'Pokaż tylko Twoje rezerwacje'
              : 'Zaloguj się, aby filtrować własne rezerwacje'
          }
        >
          <UserCheck
            size={14}
            style={{ color: onlyMyBookings ? 'var(--emerald)' : 'var(--text-muted)' }}
          />
          <span>Tylko moje rezerwacje</span>
          {currentUser && (
            <span
              className="pill-badge"
              style={
                onlyMyBookings
                  ? { background: 'var(--emerald)', color: '#ffffff' }
                  : {}
              }
            >
              {myBookingsCount}
            </span>
          )}
        </button>

        {ROOMS.map(room => {
          const count = countPerRoom(room.id);
          const isSelected = selectedRoomId === room.id;

          return (
            <button
              key={room.id}
              type="button"
              className={`room-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectRoom(room.id)}
              style={isSelected ? { borderColor: room.color, color: 'var(--text-main)' } : {}}
            >
              <span
                className="pill-dot"
                style={{ background: room.color }}
              ></span>
              <span>{room.name}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Users size={12} /> {room.capacity} os. • {room.hourlyRate} zł/h
              </span>
              {count > 0 && (
                <span className="pill-badge">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
