import type { Booking } from '../types';

const STORAGE_KEY = 'gdansk_hub_bookings_v3';

const createRelativeDate = (dayOffset: number, hour: number, minute: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}:00`;
};

export const generateInitialBookings = (): Booking[] => {
  return [
    {
      id: 'book-1',
      code: 'RES-1042',
      title: 'Spotkanie Strategiczne Zarządu: Ekspansja Bałtycka',
      roomId: 'room-panorama',
      customerName: 'Aleksandra Wiśniewska',
      customerEmail: 'a.wisniewska@blackpearls.vc',
      customerPhone: '+48 58 555 42 10',
      companyName: 'Black Pearls VC (Olivia Star)',
      start: createRelativeDate(0, 10, 0),
      end: createRelativeDate(0, 13, 0),
      attendeesCount: 16,
      status: 'confirmed',
      notes: 'Prośba o przygotowanie systemu Polycom do wideokonferencji z partnerami z Kopenhagi i Sztokholmu.',
      adminNotes: 'Sprawdzono sprzęt AV na 34. piętrze, ekspres i catering powitalny przygotowane.',
      selectedEquipment: ['System Polycom Video', 'Projektor laserowy 4K', 'Ekspres do kawy z widokiem na Zatokę'],
      createdAt: createRelativeDate(-2, 11, 20),
      totalCost: 540
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
      start: createRelativeDate(0, 14, 0),
      end: createRelativeDate(0, 16, 30),
      attendeesCount: 3,
      status: 'confirmed',
      notes: 'Nagrywamy rozmowę z inżynierem morskich farm wiatrowych Baltic Power. Potrzebne 3 mikrofony studyjne.',
      adminNotes: 'Konsola Rodecaster przetestowana, karta SD SanDisk Extreme w slocie.',
      selectedEquipment: ['4x Mikrofony studyjne Rode PodMic', 'Konsola mikserska Rodecaster Pro II', 'Oświetlenie LED Elgato Key Light'],
      createdAt: createRelativeDate(-1, 9, 15),
      totalCost: 350
    },
    {
      id: 'book-3',
      code: 'RES-1044',
      title: 'Design Sprint: Nowa Platforma E-Commerce LPP',
      roomId: 'room-kreatywna',
      customerName: 'Karolina Dąbrowska',
      customerEmail: 'k.dabrowska@lpp.com',
      customerPhone: '+48 58 769 30 00',
      companyName: 'LPP S.A. Digital Hub',
      start: createRelativeDate(0, 9, 0),
      end: createRelativeDate(0, 12, 0),
      attendeesCount: 8,
      status: 'confirmed',
      notes: 'Sprint UX dla marek Reserved i Mohito. Prosimy o zestaw markerów i tablice samoprzylepne.',
      adminNotes: 'Zestaw design thinking i interaktywny ekran dotykowy w sali Heweliusz przygotowane.',
      selectedEquipment: ['Ekran interaktywny 65" Touch', 'Ściana magnetyczna whiteboard', 'Zestaw do design thinking'],
      createdAt: createRelativeDate(-3, 14, 0),
      totalCost: 285
    },
    {
      id: 'book-4',
      code: 'RES-1045',
      title: 'Praca głęboka (Focus Sprint): Projekt Intel OneAPI',
      roomId: 'room-hotdesk',
      customerName: 'Tomasz Zieliński',
      customerEmail: 'tomasz.zielinski@intel.com',
      customerPhone: '+48 58 558 70 00',
      companyName: 'Intel Technology Poland R&D',
      start: createRelativeDate(0, 13, 0),
      end: createRelativeDate(0, 18, 0),
      attendeesCount: 1,
      status: 'confirmed',
      notes: 'Potrzebne ciche biurko w O4 Coworking do optymalizacji algorytmów pod procesory Xeon.',
      selectedEquipment: ['Biurko regulowane elektrycznie', 'Monitor 27" Dell 4K USB-C'],
      createdAt: createRelativeDate(-1, 16, 45),
      totalCost: 175
    },
    {
      id: 'book-5',
      code: 'RES-1046',
      title: 'Pomorskie Warsztaty Kubernetes & Cloud Native',
      roomId: 'room-agora',
      customerName: 'Piotr Wójcik',
      customerEmail: 'meetups@trojmiasto-jug.pl',
      customerPhone: '+48 58 555 19 80',
      companyName: 'Trójmiasto Cloud Community (GPNT)',
      start: createRelativeDate(1, 9, 0),
      end: createRelativeDate(1, 15, 0),
      attendeesCount: 38,
      status: 'confirmed',
      notes: 'Ustawienie sali: układ szkoleniowy. Uczestnicy z Dynatrace, Kainos, Nordea i Scalac.',
      adminNotes: 'Nagłośnienie estradowe JBL Pro sprawdzone, strefa cateringowa zarezerwowana.',
      selectedEquipment: ['Podwójny projektor laserowy 4K', 'Mobilne stoły modułowe', '2x Mikrofony bezprzewodowe Shure', 'Nagłośnienie estradowe JBL Pro'],
      createdAt: createRelativeDate(-4, 10, 0),
      totalCost: 1320
    },
    {
      id: 'book-6',
      code: 'RES-1047',
      title: 'Rozmowy rekrutacyjne: Cloud Observability Dev',
      roomId: 'room-kreatywna',
      customerName: 'Zuzanna Kamińska',
      customerEmail: 'zuzanna.kaminska@dynatrace.com',
      customerPhone: '+48 58 765 43 21',
      companyName: 'Dynatrace Poland (Alchemia)',
      start: createRelativeDate(1, 13, 0),
      end: createRelativeDate(1, 17, 0),
      attendeesCount: 4,
      status: 'confirmed',
      notes: 'Rozmowy z inżynierami z Gdańska i Gdyni. Wideobar w sali Heweliusz niezbędny do połączenia z Linzem.',
      selectedEquipment: ['Wideobar 4K Logitech MeetUp', 'Ekran interaktywny 65" Touch'],
      createdAt: createRelativeDate(-1, 18, 10),
      totalCost: 380
    },
    {
      id: 'book-7',
      code: 'RES-1048',
      title: 'Demo Day Inkubatora STARTER: Prezentacje Startupów',
      roomId: 'room-starter',
      customerName: 'Marta Lewandowska',
      customerEmail: 'starter@inkubatorstarter.pl',
      customerPhone: '+48 58 731 65 00',
      companyName: 'Gdańska Fundacja Przedsiębiorczości',
      start: createRelativeDate(1, 11, 0),
      end: createRelativeDate(1, 15, 0),
      attendeesCount: 15,
      status: 'confirmed',
      notes: 'Pitching 6 zespołów przed aniołami biznesu z Pomorza. Sala Fahrenheit przygotowana w układzie teatralnym.',
      adminNotes: 'Ekran 75" podłączony, mikrofony bezprzewodowe przetestowane.',
      selectedEquipment: ['Ekran 75" 4K', 'Ściany ze szkła do pisania', 'Wideobar Poly Studio'],
      createdAt: createRelativeDate(-2, 15, 30),
      totalCost: 440
    },
    {
      id: 'book-8',
      code: 'RES-1049',
      title: 'Sesja fotograficzna & packshoty: Baltic Sea Cosmetics',
      roomId: 'room-studio',
      customerName: 'Ewa Nowicka',
      customerEmail: 'kontakt@ewanowicka.art',
      customerPhone: '+48 509 778 899',
      companyName: 'Ewa Nowicka Studio Sopot',
      start: createRelativeDate(2, 9, 0),
      end: createRelativeDate(2, 12, 0),
      attendeesCount: 2,
      status: 'cancelled',
      notes: 'Klient odwołał z powodu opóźnienia dostawy próbek laboratoryjnych z Gdyni.',
      adminNotes: 'Anulowano zgodnie z regulaminem, zwolniono termin w Stoczni Doki.',
      selectedEquipment: ['Oświetlenie LED Elgato Key Light'],
      createdAt: createRelativeDate(-5, 12, 0),
      totalCost: 420
    },
    {
      id: 'book-9',
      code: 'RES-1050',
      title: 'Nordea Horizon: Przegląd Architektury Bankowości',
      roomId: 'room-panorama',
      customerName: 'Marek Szymański',
      customerEmail: 'marek.szymanski@nordea.com',
      customerPhone: '+48 58 522 90 00',
      companyName: 'Nordea IT Poland (Olivia)',
      start: createRelativeDate(-1, 14, 0),
      end: createRelativeDate(-1, 18, 0),
      attendeesCount: 22,
      status: 'confirmed',
      notes: 'Kwartalne podsumowanie architektury systemów płatniczych w Olivia Star.',
      selectedEquipment: ['Projektor laserowy 4K', 'System Polycom Video', 'Nagłośnienie sufitowe JBL'],
      createdAt: createRelativeDate(-6, 9, 0),
      totalCost: 720
    },
    {
      id: 'book-10',
      code: 'RES-1051',
      title: 'Warsztat Architektury Morskich Farm Wiatrowych (Offshore)',
      roomId: 'room-agora',
      customerName: 'Robert Krawczyk',
      customerEmail: 'r.krawczyk@balticoffshore.pl',
      customerPhone: '+48 58 301 22 33',
      companyName: 'Baltic Offshore Energy Hub',
      start: createRelativeDate(3, 10, 0),
      end: createRelativeDate(3, 15, 0),
      attendeesCount: 30,
      status: 'confirmed',
      notes: 'Spotkanie konsorcjum energetycznego dotyczące infrastruktury portu instalacyjnego w Gdańsku.',
      selectedEquipment: ['Podwójny projektor laserowy 4K', 'Mobilne stoły modułowe', 'Nagłośnienie estradowe JBL Pro'],
      createdAt: createRelativeDate(-1, 12, 0),
      totalCost: 1100
    },
    {
      id: 'book-11',
      code: 'RES-1052',
      title: 'Projekt Kowalski Dev: Architektura Cloud',
      roomId: 'room-hotdesk',
      userId: 'user-client',
      customerName: 'Jan Kowalski',
      customerEmail: 'klient@gdanskhub.pl',
      customerPhone: '+48 600 123 456',
      companyName: 'Kowalski Dev Studio',
      start: createRelativeDate(0, 16, 0),
      end: createRelativeDate(0, 18, 0),
      attendeesCount: 1,
      status: 'confirmed',
      notes: 'Praca na stanowisku hotdesk z monitorem 4K.',
      adminNotes: undefined,
      selectedEquipment: ['Monitor 27" Dell 4K USB-C'],
      createdAt: createRelativeDate(-1, 8, 0),
      totalCost: 70
    }
  ];
};

export const loadStoredBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialBookings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return generateInitialBookings();
    return parsed.map((b: Booking) => ({
      ...b,
      paymentMethod: b.paymentMethod || (b.paymentStatus === 'invoice_b2b' ? 'invoice_b2b' : 'card'),
      paymentStatus: b.paymentStatus || (b.paymentMethod === 'invoice_b2b' ? 'invoice_b2b' : 'paid'),
      transactionId: b.transactionId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`
    }));
  } catch (e) {
    console.error('Failed to load bookings from localStorage:', e);
    return generateInitialBookings();
  }
};

export const saveStoredBookings = (bookings: Booking[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage:', e);
  }
};

export const resetBookingsStorage = (): Booking[] => {
  const initial = generateInitialBookings();
  saveStoredBookings(initial);
  return initial;
};
