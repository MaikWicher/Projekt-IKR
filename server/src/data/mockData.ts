export interface MockRoom {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  capacity: number;
  hourlyRate: number;
  color: string;
  bgColor: string;
  borderColor: string;
  equipment: string[];
  description: string;
  floor: string;
  imageUrl: string;
}

export interface MockBooking {
  id: string;
  code: string;
  title: string;
  roomId: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string | null;
  start: Date;
  end: Date;
  attendeesCount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  notes: string | null;
  adminNotes: string | null;
  selectedEquipment: string[];
  totalCost: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  transactionId?: string | null;
  room?: MockRoom;
}

export const MOCK_ROOMS: MockRoom[] = [
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
    equipment: [
      'Projektor laserowy 4K',
      'System Polycom Video',
      'Nagłośnienie sufitowe JBL',
      'Szybkie Wi-Fi 6',
      'Ekspres do kawy z widokiem na Zatokę',
      'Dostęp do tarasu widokowego'
    ],
    description: 'Reprezentacyjna sala na 34. piętrze wieżowca Olivia Star z panoramicznym widokiem na Zatokę Gdańską, Molo w Sopocie i Trójmiejski Park Krajobrazowy.',
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
    equipment: [
      'Ekran interaktywny 65" Touch',
      'Ściana magnetyczna whiteboard',
      'Wideobar 4K Logitech MeetUp',
      'Zestaw do design thinking',
      'Klimatyzacja'
    ],
    description: 'Nowoczesna sala spotkań nazwana na cześć gdańskiego astronoma Jana Heweliusza w kompleksie Alchemia.',
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
    equipment: [
      '4x Mikrofony studyjne Rode PodMic',
      'Konsola mikserska Rodecaster Pro II',
      'Słuchawki Beyerdynamic DT 770 Pro',
      'Oświetlenie LED Elgato Key Light',
      'Panele akustyczne Vicoustic'
    ],
    description: 'Profesjonalnie wygłuszone studio nagraniowe i podcastowe w industrialnej przestrzeni historycznej Stoczni Gdańskiej.',
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
    equipment: [
      'Biurko regulowane elektrycznie',
      'Monitor 27" Dell 4K USB-C',
      'Fotel ergonomiczny Herman Miller',
      'Ładowarka indukcyjna Qi',
      'Dostęp do strefy ciszy i budek telefonicznych'
    ],
    description: 'Komfortowe, ciche stanowisko pracy indywidualnej w prestiżowej społeczności O4 Coworking w Olivia Business Centre.',
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
    equipment: [
      'Podwójny projektor laserowy 4K',
      'Mobilne stoły modułowe',
      '2x Mikrofony bezprzewodowe Shure',
      'Nagłośnienie estradowe JBL Pro',
      'Dedykowana strefa cateringowa i szatnia'
    ],
    description: 'Przestronna sala z akcentami gdańskiego bursztynu, zlokalizowana w Gdańskim Parku Naukowo-Technologicznym.',
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
    equipment: [
      'Ekran 75" 4K',
      'Ściany ze szkła do pisania',
      'Wideobar Poly Studio',
      'Szybkie Wi-Fi światłowodowe',
      'Strefa chillout z ekspresem'
    ],
    description: 'Dynamiczna sala warsztatowa w Gdańskim Inkubatorze Przedsiębiorczości STARTER przy stacji SKM Przymorze.',
    floor: 'Inkubator STARTER, Piętro 1 (ul. Lęborska 3B, Gdańsk Przymorze)',
    imageUrl: '/rooms/room-starter.jpg'
  }
];

const createDate = (dayOffset: number, hour: number, minute: number = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: 'book-1',
    code: 'RES-1042',
    title: 'Spotkanie Strategiczne Zarządu: Ekspansja Bałtycka',
    roomId: 'room-panorama',
    customerName: 'Aleksandra Wiśniewska',
    customerEmail: 'a.wisniewska@blackpearls.vc',
    customerPhone: '+48 58 555 42 10',
    companyName: 'Black Pearls VC (Olivia Star)',
    start: createDate(0, 10, 0),
    end: createDate(0, 13, 0),
    attendeesCount: 16,
    status: 'CONFIRMED',
    notes: 'Prośba o przygotowanie systemu Polycom do wideokonferencji z partnerami z Kopenhagi.',
    adminNotes: 'Sprawdzono sprzęt AV na 34. piętrze, catering powitalny przygotowany.',
    selectedEquipment: ['System Polycom Video', 'Projektor laserowy 4K'],
    totalCost: 540,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    transactionId: 'PAY-842109'
  },
  {
    id: 'book-2',
    code: 'RES-1043',
    title: 'Nagranie podcastu: "Trójmiasto Tech & Stocznia Doki"',
    roomId: 'room-studio',
    customerName: 'Michał Kowalski',
    customerEmail: 'redakcja@dokimedia.pl',
    customerPhone: '+48 58 340 88 12',
    companyName: 'Doki Media & Creative Lab',
    start: createDate(0, 14, 0),
    end: createDate(0, 16, 30),
    attendeesCount: 3,
    status: 'CONFIRMED',
    notes: 'Nagrywamy rozmowę z inżynierem morskich farm wiatrowych Baltic Power.',
    adminNotes: 'Konsola Rodecaster przetestowana, karta SD w slocie.',
    selectedEquipment: ['4x Mikrofony studyjne Rode PodMic', 'Konsola mikserska Rodecaster Pro II'],
    totalCost: 350,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    transactionId: 'PAY-194021'
  },
  {
    id: 'book-3',
    code: 'RES-1044',
    title: 'Warsztat Design Sprint: Aplikacja dla Portu Gdańsk',
    roomId: 'room-kreatywna',
    customerName: 'Katarzyna Lewandowska',
    customerEmail: 'k.lewandowska@uxgdansk.io',
    customerPhone: '+48 601 234 567',
    companyName: 'UX Gdańsk Collective',
    start: createDate(1, 9, 0),
    end: createDate(1, 14, 0),
    attendeesCount: 8,
    status: 'CONFIRMED',
    notes: 'Potrzebne dodatkowe markery suchościeralne i flipchart.',
    adminNotes: 'Materiały papiernicze uzupełnione.',
    selectedEquipment: ['Ekran interaktywny 65" Touch', 'Ściana magnetyczna whiteboard'],
    totalCost: 475,
    paymentMethod: 'blik',
    paymentStatus: 'paid',
    transactionId: 'PAY-601943'
  },
  {
    id: 'book-4',
    code: 'RES-1045',
    title: 'Projekt Kowalski Dev: Architektura Cloud',
    roomId: 'room-hotdesk',
    userId: 'usr-client-default',
    customerName: 'Jan Kowalski',
    customerEmail: 'klient@gdanskhub.pl',
    customerPhone: '+48 600 123 456',
    companyName: 'Kowalski Dev Studio',
    start: createDate(0, 16, 0),
    end: createDate(0, 18, 0),
    attendeesCount: 1,
    status: 'CONFIRMED',
    notes: 'Praca na stanowisku hotdesk z monitorem 4K.',
    adminNotes: null,
    selectedEquipment: ['Monitor 27" Dell 4K USB-C'],
    totalCost: 70,
    paymentMethod: 'invoice_b2b',
    paymentStatus: 'invoice_b2b',
    transactionId: 'INV-2026/042'
  }
];
