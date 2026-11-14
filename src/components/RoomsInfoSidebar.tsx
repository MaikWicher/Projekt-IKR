import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  Building2,
  Layers,
  Filter,
  Calendar
} from 'lucide-react';
import { ROOMS } from '../data/mockRooms';

interface RoomsInfoSidebarProps {
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onBookRoom: (roomId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const RoomsInfoSidebar: React.FC<RoomsInfoSidebarProps> = ({
  selectedRoomId,
  onSelectRoom,
  onBookRoom,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredRooms = ROOMS.filter(room => {
    if (activeCategory === 'all') return true;
    return room.category === activeCategory;
  });

  return (
    <div className={`rooms-sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="rooms-sidebar-header">
        <div className="rooms-sidebar-title-area">
          <div className="rooms-sidebar-icon">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="rooms-sidebar-title">Katalog Przestrzeni</h3>
            <p className="rooms-sidebar-subtitle">Wyposażenie i zdjęcia sal w Gdańsku</p>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            className="rooms-sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Rozwiń panel przestrzeni" : "Zwiń panel"}
          >
            <Layers size={15} />
            <span className="toggle-text">{isCollapsed ? "Pokaż sale" : "Zwiń"}</span>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="rooms-category-tabs">
            <button
              type="button"
              className={`cat-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Wszystkie ({ROOMS.length})
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategory === 'conference' ? 'active' : ''}`}
              onClick={() => setActiveCategory('conference')}
            >
              Konferencyjne
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategory === 'meeting' ? 'active' : ''}`}
              onClick={() => setActiveCategory('meeting')}
            >
              Spotkań
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategory === 'studio' ? 'active' : ''}`}
              onClick={() => setActiveCategory('studio')}
            >
              Studio
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategory === 'desk' ? 'active' : ''}`}
              onClick={() => setActiveCategory('desk')}
            >
              Hot-Desk
            </button>
          </div>

          <div className="rooms-cards-scroll">
            {filteredRooms.map(room => {
              const isCurrentSelected = selectedRoomId === room.id;

              return (
                <article
                  key={room.id}
                  className={`room-info-card ${isCurrentSelected ? 'active-room-card' : ''}`}
                  style={{
                    borderColor: isCurrentSelected ? room.color : undefined
                  }}
                >
                  <div className="room-card-photo-wrapper">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="room-card-photo"
                      loading="lazy"
                    />
                    <div className="room-photo-gradient-overlay" />

                    <div className="room-photo-top-badges">
                      <span
                        className="room-cat-tag"
                        style={{
                          backgroundColor: room.color,
                          color: '#ffffff'
                        }}
                      >
                        {room.categoryLabel}
                      </span>

                      <span className="room-rate-badge">
                        {room.hourlyRate} zł <small>/ h</small>
                      </span>
                    </div>

                    <div className="room-photo-bottom-stats">
                      <span className="room-stat-pill">
                        <Users size={12} /> max {room.capacity} osób
                      </span>
                    </div>
                  </div>

                  <div className="room-card-content">
                    <div className="room-card-header">
                      <h4 className="room-name">{room.name}</h4>
                      <p className="room-location">
                        <MapPin size={12} className="loc-pin" />
                        <span>{room.floor}</span>
                      </p>
                    </div>

                    <p className="room-desc">
                      {room.description}
                    </p>

                    <div className="room-equipment-box">
                      <div className="room-eq-title">
                        <Sparkles size={12} color="var(--primary)" />
                        <span>Co znajduje się w tej sali:</span>
                      </div>
                      <div className="room-eq-chips">
                        {room.equipment.map(item => (
                          <span key={item} className="room-eq-chip">
                            <CheckCircle2 size={11} className="chip-check" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="room-card-actions">
                      <button
                        type="button"
                        className={`room-filter-toggle-btn ${isCurrentSelected ? 'is-active' : ''}`}
                        onClick={() => onSelectRoom(isCurrentSelected ? 'all' : room.id)}
                        title={isCurrentSelected ? "Pokaż wszystkie sale w kalendarzu" : "Pokaż tylko tę salę w kalendarzu"}
                      >
                        <Filter size={13} />
                        <span>{isCurrentSelected ? 'Odznacz filtr' : 'Filtruj kalendarz'}</span>
                      </button>

                      <button
                        type="button"
                        className="room-book-now-btn"
                        style={{ background: room.color }}
                        onClick={() => onBookRoom(room.id)}
                        title={`Zarezerwuj ${room.name}`}
                      >
                        <Calendar size={13} />
                        <span>Zarezerwuj salę</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
