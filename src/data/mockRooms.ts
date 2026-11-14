import type { Room } from '../types';

export const ROOMS: Room[] = [
  {
    id: 'room-panorama',
    name: "Sala Widokowa 'Olivia Star 34'",
    category: 'conference',
    categoryLabel: 'Sala Konferencyjna',
    capacity: 24,
    hourlyRate: 180,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
    equipment: ['Projektor laserowy 4K', 'System Polycom Video', 'Nagłośnienie sufitowe JBL', 'Szybkie Wi-Fi 6', 'Ekspres do kawy z widokiem na Zatokę', 'Dostęp do tarasu widokowego'],
    description: 'Reprezentacyjna sala na 34. piętrze wieżowca Olivia Star z panoramicznym widokiem na Zatokę Gdańską, Molo w Sopocie i Trójmiejski Park Krajobrazowy. Dedykowana kluczowym prezentacjom i spotkaniom zarządu.',
    floor: 'Olivia Star, Piętro 34 (Al. Grunwaldzka 472, Gdańsk Oliwa)',
    imageUrl: '/rooms/room-panorama.jpg'
  },
  {
    id: 'room-kreatywna',
    name: "Sala Spotkań 'Heweliusz' (Alchemia Argon)",
    category: 'meeting',
    categoryLabel: 'Sala Spotkań',
    capacity: 10,
    hourlyRate: 95,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    equipment: ['Ekran interaktywny 65" Touch', 'Ściana magnetyczna whiteboard', 'Wideobar 4K Logitech MeetUp', 'Zestaw do design thinking', 'Klimatyzacja'],
    description: 'Nowoczesna sala spotkań nazwana na cześć gdańskiego astronoma Jana Heweliusza w kompleksie Alchemia. Perfekcyjna do burz mózgów, warsztatów sprintowych i spotkań zespołów projektowych.',
    floor: 'Alchemia (Budynek Argon), Piętro 2 (Al. Grunwaldzka 415, Gdańsk Oliwa)',
    imageUrl: '/rooms/room-kreatywna.jpg'
  },
  {
    id: 'room-studio',
    name: "Studio Multimedialne 'Stocznia Doki 1980'",
    category: 'studio',
    categoryLabel: 'Studio Audio/Wideo',
    capacity: 5,
    hourlyRate: 140,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
    equipment: ['4x Mikrofony studyjne Rode PodMic', 'Konsola mikserska Rodecaster Pro II', 'Słuchawki Beyerdynamic DT 770 Pro', 'Oświetlenie LED Elgato Key Light', 'Panele akustyczne Vicoustic'],
    description: 'Profesjonalnie wygłuszone studio nagraniowe i podcastowe w industrialnej przestrzeni historycznej Stoczni Gdańskiej. Idealne do nagrywania podcastów, webinarów i wywiadów wideo.',
    floor: 'Budynek Dyrekcji Stoczni Cesarskiej, Parter (ul. Doki 1, Gdańsk Młode Miasto)',
    imageUrl: '/rooms/room-studio.jpg'
  },
  {
    id: 'room-hotdesk',
    name: "Strefa Hot-Desk 'O4 Coworking Oliwa'",
    category: 'desk',
    categoryLabel: 'Biurko Hot-Desk',
    capacity: 1,
    hourlyRate: 35,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
    equipment: ['Biurko regulowane elektrycznie', 'Monitor 27" Dell 4K USB-C', 'Fotel ergonomiczny Herman Miller', 'Ładowarka indukcyjna Qi', 'Dostęp do strefy ciszy i budek telefonicznych'],
    description: 'Komfortowe, ciche stanowisko pracy indywidualnej w prestiżowej społeczności O4 Coworking w Olivia Business Centre z dostępem do nielimitowanej kawy speciality.',
    floor: 'Olivia Four, Piętro 1 (O4 Coworking, Al. Grunwaldzka 472B, Gdańsk Oliwa)',
    imageUrl: '/rooms/room-hotdesk.jpg'
  },
  {
    id: 'room-agora',
    name: "Sala Konferencyjno-Eventowa 'Amber Hall' (GPNT)",
    category: 'workshop',
    categoryLabel: 'Sala Szkoleniowa',
    capacity: 45,
    hourlyRate: 220,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
    equipment: ['Podwójny projektor laserowy 4K', 'Mobilne stoły modułowe', '2x Mikrofony bezprzewodowe Shure', 'Nagłośnienie estradowe JBL Pro', 'Dedykowana strefa cateringowa i szatnia'],
    description: 'Przestronna sala z akcentami gdańskiego bursztynu, zlokalizowana w Gdańskim Parku Naukowo-Technologicznym. Doskonała na hackathony, konferencje technologiczne i spotkania branży morskiej/IT.',
    floor: 'Gdański Park Naukowo-Technologiczny, Budynek B, Parter (ul. Trzy Lipy 3, Gdańsk)',
    imageUrl: '/rooms/room-agora.jpg'
  },
  {
    id: 'room-starter',
    name: "Sala Warsztatowa 'Fahrenheit' (STARTER)",
    category: 'meeting',
    categoryLabel: 'Sala Warsztatowa',
    capacity: 16,
    hourlyRate: 110,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#ec4899',
    equipment: ['Ekran 75" 4K', 'Ściany ze szkła do pisania', 'Wideobar Poly Studio', 'Szybkie Wi-Fi światłowodowe', 'Strefa chillout z ekspresem'],
    description: 'Dynamiczna sala warsztatowa w Gdańskim Inkubatorze Przedsiębiorczości STARTER przy stacji SKM Przymorze. Stworzona z myślą o startupach, warsztatach agile i szkoleniach produktowych.',
    floor: 'Inkubator STARTER, Piętro 1 (ul. Lęborska 3B, Gdańsk Przymorze)',
    imageUrl: '/rooms/room-starter.jpg'
  }
];

export const getRoomById = (id: string): Room | undefined => {
  return ROOMS.find(r => r.id === id);
};
