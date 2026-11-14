import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Coffee,
  Wifi,
  Shield,
  Layers
} from 'lucide-react';
import { ROOMS } from '../data/mockRooms';

interface RoomsCatalogViewProps {
  onGoToCalendarForRoom: (roomId: string) => void;
  onBookRoom: (roomId: string) => void;
}

export const RoomsCatalogView: React.FC<RoomsCatalogViewProps> = ({
  onGoToCalendarForRoom,
  onBookRoom
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRooms = useMemo(() => {
    return ROOMS.filter(room => {
      if (selectedCategory !== 'all' && room.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesDesc = room.description.toLowerCase().includes(q);
        const matchesFloor = room.floor.toLowerCase().includes(q);
        const matchesEquipment = room.equipment.some(e => e.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesFloor && !matchesEquipment) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="rooms-catalog-root animate-fade-in">
      <div className="rooms-catalog-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Building2 size={15} />
            <span>Gdańsk Business & Cowork Hub</span>
          </div>
          <h2>Przestrzenie i Sale Biznesowe w Gdańsku</h2>
          <p>
            Poznaj nasze sale konferencyjne, studia nagraniowe oraz strefy coworkingowe.
            Sprawdź pełną listę wyposażenia, parametry techniczne i zdjęcia zrobione na miejscu.
          </p>

          <div className="hero-features-list">
            <span className="hero-feature-item">
              <Wifi size={14} color="var(--primary)" />
              Szybki światłowód & Wi-Fi 6
            </span>
            <span className="hero-feature-item">
              <Coffee size={14} color="var(--amber)" />
              Kawa speciality & strefy chillout
            </span>
            <span className="hero-feature-item">
              <Shield size={14} color="var(--emerald)" />
              Gwarancja czystości i wsparcie techniczne
            </span>
          </div>
        </div>
      </div>

      <div className="rooms-catalog-toolbar">
        <div className="rooms-catalog-tabs">
          <button
            type="button"
            className={`catalog-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Wszystkie sale ({ROOMS.length})
          </button>
          <button
            type="button"
            className={`catalog-tab ${selectedCategory === 'conference' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('conference')}
          >
            Konferencyjne
          </button>
          <button
            type="button"
            className={`catalog-tab ${selectedCategory === 'meeting' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('meeting')}
          >
            Spotkań & Warsztatowe
          </button>
          <button
            type="button"
            className={`catalog-tab ${selectedCategory === 'studio' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('studio')}
          >
            Studio Audio/Video
          </button>
          <button
            type="button"
            className={`catalog-tab ${selectedCategory === 'desk' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('desk')}
          >
            Biurka Hot-Desk
          </button>
        </div>

        <div className="rooms-catalog-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Szukaj wyposażenia (np. 4K, mikrofon, whiteboard)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="rooms-empty-state">
          <Layers size={36} color="var(--text-dim)" />
          <h3>Brak sal spełniających kryteria</h3>
          <p>Spróbuj zmienić kategorię lub wyczyścić pole wyszukiwania.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
          >
            Pokaż wszystkie sale
          </button>
        </div>
      ) : (
        <div className="rooms-catalog-grid">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className="catalog-room-card"
              style={{ borderTopColor: room.color }}
            >
              <div className="catalog-photo-wrapper">
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="catalog-photo"
                  loading="lazy"
                />
                <div className="catalog-photo-overlay" />

                <div className="catalog-photo-badges-top">
                  <span
                    className="catalog-cat-pill"
                    style={{ backgroundColor: room.color, color: '#fff' }}
                  >
                    {room.categoryLabel}
                  </span>
                  <span className="catalog-price-badge">
                    {room.hourlyRate} zł <small>/ godz.</small>
                  </span>
                </div>

                <div className="catalog-photo-badges-bottom">
                  <span className="catalog-capacity-pill">
                    <Users size={13} />
                    Maksymalnie {room.capacity} osób
                  </span>
                </div>
              </div>

              <div className="catalog-card-body">
                <div className="catalog-header-group">
                  <h3 className="catalog-room-title">{room.name}</h3>
                  <div className="catalog-room-loc">
                    <MapPin size={13} color={room.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{room.floor}</span>
                  </div>
                </div>

                <p className="catalog-room-desc">
                  {room.description}
                </p>

                <div className="catalog-eq-container">
                  <div className="catalog-eq-heading">
                    <Sparkles size={13} color="var(--primary)" />
                    <span>Wyposażenie wliczone w cenę rezerwacji:</span>
                  </div>
                  <div className="catalog-eq-tags-list">
                    {room.equipment.map(item => (
                      <div key={item} className="catalog-eq-tag">
                        <CheckCircle2 size={12} color="var(--emerald)" style={{ flexShrink: 0 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="catalog-card-actions">
                  <button
                    type="button"
                    className="btn-primary catalog-action-btn catalog-btn-book"
                    style={{ background: room.color }}
                    onClick={() => onBookRoom(room.id)}
                    title={`Zarezerwuj ${room.name}`}
                  >
                    <span>Zarezerwuj tę salę</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn-secondary catalog-action-btn catalog-btn-calendar"
                    onClick={() => onGoToCalendarForRoom(room.id)}
                    title={`Zobacz dostępność ${room.name} w kalendarzu`}
                  >
                    <Calendar size={15} />
                    <span>Sprawdź dostępność w kalendarzu</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
