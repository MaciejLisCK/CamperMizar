/** Dane pojazdu. Wartości bez potwierdzenia mają `null` i są oznaczane w interfejsie. */
export const VEHICLE = {
  name: 'CI Mizar 140',
  year: 1996,
  base: 'Fiat Ducato',
  heightM: null as number | null,
  widthM: null as number | null,
  lengthM: null as number | null,
  massKg: null as number | null,
};

/** Zatwierdzona kolejność preferencji dróg (wymagania, rozdz. 4). */
export const ROAD_PREFERENCES = [
  { rank: 1, label: 'Drogi ekspresowe' },
  { rank: 2, label: 'Autostrady (dopuszczalne)' },
  { rank: 3, label: 'Dobre drogi lokalne odpowiednie dla kampera' },
];

export const ROAD_AVOID = ['Bardzo wąskie, trudne drogi', 'Progi zwalniające'];

export type InstructionId =
  | 'woda'
  | 'swiatlo'
  | 'generator'
  | 'fotowoltaika'
  | 'akumulator'
  | 'ogrzewanie'
  | 'ciepla-woda'
  | 'wentylator';

export interface InstructionDef {
  id: InstructionId;
  title: string;
  icon: string;
  /** Element rzutu kampera, przy którym instrukcja jest dostępna */
  elementIds: string[];
}

export const INSTRUCTIONS: InstructionDef[] = [
  { id: 'woda', title: 'Uruchamianie wody', icon: '💧', elementIds: ['dinette-front', 'kitchen-sink', 'bath-sink'] },
  { id: 'swiatlo', title: 'Włączanie światła w konkretnych miejscach', icon: '💡', elementIds: ['lounger', 'dinette-table', 'kitchen', 'bathroom', 'alcove-bed'] },
  { id: 'generator', title: 'Uruchamianie generatora prądu', icon: '⚡', elementIds: [] },
  { id: 'fotowoltaika', title: 'Instalacja fotowoltaiczna — obsługa, włączanie, wyłączanie', icon: '☀', elementIds: ['pv'] },
  { id: 'akumulator', title: 'Obsługa akumulatora', icon: '🔋', elementIds: [] },
  { id: 'ogrzewanie', title: 'Uruchamianie ogrzewania', icon: '🔥', elementIds: ['heater'] },
  { id: 'ciepla-woda', title: 'Podgrzewanie wody', icon: '♨', elementIds: ['bath-shower', 'bath-sink'] },
  { id: 'wentylator', title: 'Uruchamianie wentylatora', icon: '🌀', elementIds: ['roof-fan'] },
];

export type Layer = 'dol' | 'gora';

export interface PlanElement {
  id: string;
  label: string;
  layer: Layer;
  /** Prostokąt w układzie rzutu (viewBox 0 0 300 800), przód u góry */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'cab' | 'seat' | 'furniture' | 'bed' | 'wet' | 'kitchen' | 'door' | 'window' | 'device' | 'exterior';
  confirmed: boolean;
  description: string;
  unconfirmedNote?: string;
  instructions?: InstructionId[];
}

const OWNER = 'Opis potwierdzony przez właściciela.';

/**
 * Rzut z góry — przód kampera u góry rysunku, więc strona lewa/prawa na ekranie
 * odpowiada lewej/prawej patrząc w kierunku jazdy.
 * Proporcje i wymiary są poglądowe — rzeczywiste wymiary do uzupełnienia.
 */
export const PLAN: PlanElement[] = [
  // Kabina
  { id: 'driver', label: 'Fotel kierowcy', layer: 'dol', x: 40, y: 95, w: 90, h: 80, kind: 'seat', confirmed: true, description: `Kabina Fiata Ducato, kierowca po lewej. ${OWNER}` },
  { id: 'passenger', label: 'Fotel pasażera', layer: 'dol', x: 170, y: 95, w: 90, h: 80, kind: 'seat', confirmed: true, description: `Pasażer po prawej. ${OWNER}` },
  { id: 'driver-door', label: 'Drzwi kierowcy', layer: 'dol', x: 14, y: 100, w: 12, h: 70, kind: 'door', confirmed: true, description: `Osobne wejście/wyjście przy miejscu kierowcy. ${OWNER}` },
  // Część wypoczynkowa
  { id: 'lounger', label: 'Wąska leżanka', layer: 'dol', x: 32, y: 205, w: 78, h: 175, kind: 'furniture', confirmed: true, description: `Za kabiną po lewej wąska leżanka. ${OWNER}`, instructions: ['swiatlo'] },
  { id: 'dinette-front', label: 'Kanapa przednia (zbiornik wody)', layer: 'dol', x: 178, y: 205, w: 90, h: 50, kind: 'furniture', confirmed: true, description: `Kanapa bliżej przodu. Pod nią znajduje się zbiornik wody. ${OWNER}`, unconfirmedNote: 'Pojemność zbiornika i sposób napełniania — do uzupełnienia.', instructions: ['woda'] },
  { id: 'dinette-table', label: 'Stół', layer: 'dol', x: 185, y: 262, w: 76, h: 60, kind: 'furniture', confirmed: true, description: `Dwie kanapy ze stołem — miejsce dla czterech osób. ${OWNER}`, instructions: ['swiatlo'] },
  { id: 'dinette-rear', label: 'Kanapa tylna', layer: 'dol', x: 178, y: 330, w: 90, h: 50, kind: 'furniture', confirmed: true, description: `Druga kanapa części wypoczynkowej. ${OWNER}` },
  { id: 'window-left', label: 'Duże okno (lewe)', layer: 'dol', x: 14, y: 220, w: 10, h: 140, kind: 'window', confirmed: true, description: `Duże okno po lewej stronie części wypoczynkowej. ${OWNER}`, unconfirmedNote: 'Dokładny rozmiar i położenie okna do sprawdzenia z materiałami.' },
  { id: 'window-right', label: 'Duże okno (prawe)', layer: 'dol', x: 276, y: 220, w: 10, h: 140, kind: 'window', confirmed: true, description: `Duże okno po prawej stronie części wypoczynkowej. ${OWNER}`, unconfirmedNote: 'Dokładny rozmiar i położenie okna do sprawdzenia z materiałami.' },
  // Środek
  { id: 'wardrobe', label: 'Wysoka szafa', layer: 'dol', x: 32, y: 390, w: 78, h: 80, kind: 'furniture', confirmed: true, description: `Za leżanką po lewej wysoka szafa. ${OWNER}` },
  { id: 'heater', label: 'Ogrzewacz (pod szafą)', layer: 'dol', x: 40, y: 475, w: 62, h: 34, kind: 'device', confirmed: true, description: `Pod wysoką szafą znajduje się ogrzewacz. ${OWNER}`, unconfirmedNote: 'Model ogrzewacza i panel sterowania — do uzupełnienia.', instructions: ['ogrzewanie'] },
  { id: 'small-cabinet', label: 'Mała szafka', layer: 'dol', x: 190, y: 390, w: 78, h: 40, kind: 'furniture', confirmed: true, description: `Po prawej mała szafka. ${OWNER}` },
  { id: 'worktop', label: 'Podnoszony blat ze schowkiem', layer: 'dol', x: 190, y: 436, w: 78, h: 74, kind: 'furniture', confirmed: true, description: `Podnoszony blat, pod spodem schowek. ${OWNER}` },
  { id: 'entry-door', label: 'Drzwi wejściowe (prawa ściana)', layer: 'dol', x: 276, y: 520, w: 12, h: 60, kind: 'door', confirmed: true, description: `Wejście do części mieszkalnej w prawej ścianie bocznej przy kuchni — nie w tylnej ścianie. ${OWNER}`, unconfirmedNote: 'Dokładne położenie drzwi względem kuchni do sprawdzenia.' },
  // Łazienka
  { id: 'bathroom', label: 'Łazienka', layer: 'dol', x: 30, y: 590, w: 120, h: 160, kind: 'wet', confirmed: true, description: `Lewy tylny narożnik: toaleta, umywalka, prysznic. ${OWNER}`, instructions: ['swiatlo'] },
  { id: 'bath-shower', label: 'Prysznic', layer: 'dol', x: 36, y: 596, w: 52, h: 60, kind: 'wet', confirmed: false, description: 'Właściciel określił pozycję prysznica jako lewą przednią część łazienki.', unconfirmedNote: 'Położenie prysznica do sprawdzenia przy odwzorowaniu.', instructions: ['ciepla-woda'] },
  { id: 'bath-toilet', label: 'Toaleta', layer: 'dol', x: 95, y: 680, w: 46, h: 50, kind: 'wet', confirmed: false, description: 'Toaleta w łazience.', unconfirmedNote: 'Dokładne położenie w łazience niepotwierdzone.' },
  { id: 'bath-sink', label: 'Umywalka', layer: 'dol', x: 36, y: 690, w: 50, h: 44, kind: 'wet', confirmed: false, description: 'Umywalka w łazience.', unconfirmedNote: 'Dokładne położenie w łazience niepotwierdzone.', instructions: ['woda', 'ciepla-woda'] },
  // Kuchnia
  { id: 'kitchen', label: 'Kuchnia', layer: 'dol', x: 190, y: 590, w: 80, h: 160, kind: 'kitchen', confirmed: true, description: `Z tyłu po prawej kuchnia: palniki, lodówka pod palnikami, zlew. ${OWNER}`, unconfirmedNote: 'Dokładne wzajemne położenie palników i zlewu do zweryfikowania z materiałami.', instructions: ['swiatlo'] },
  { id: 'kitchen-burners', label: 'Palniki (lodówka pod spodem)', layer: 'dol', x: 198, y: 598, w: 64, h: 66, kind: 'kitchen', confirmed: false, description: `Palniki gazowe, pod nimi lodówka. ${OWNER}`, unconfirmedNote: 'Kolejność palników i zlewu niepotwierdzona — rysunek poglądowy.' },
  { id: 'kitchen-sink', label: 'Zlew', layer: 'dol', x: 198, y: 676, w: 64, h: 66, kind: 'kitchen', confirmed: false, description: 'Zlew kuchenny.', unconfirmedNote: 'Położenie względem palników niepotwierdzone.', instructions: ['woda'] },
  // Na zewnątrz
  { id: 'bike-rack', label: 'Bagażnik na rowery', layer: 'dol', x: 60, y: 766, w: 180, h: 18, kind: 'exterior', confirmed: true, description: `Na zewnątrz z tyłu bagażnik na rowery. ${OWNER}` },

  // Poziom górny
  { id: 'alcove-bed', label: 'Alkowa z łóżkiem (nad kabiną)', layer: 'gora', x: 30, y: 20, w: 240, h: 160, kind: 'bed', confirmed: true, description: `Nad kabiną wspólna alkowa z łóżkiem. ${OWNER}`, unconfirmedNote: 'Wymiary materaca — do uzupełnienia.', instructions: ['swiatlo'] },
  { id: 'upper-left', label: 'Szafki górne (lewe)', layer: 'gora', x: 30, y: 210, w: 60, h: 170, kind: 'furniture', confirmed: true, description: `Szafki u góry nad częścią wypoczynkową. ${OWNER}` },
  { id: 'upper-right', label: 'Szafki górne (prawe)', layer: 'gora', x: 210, y: 210, w: 60, h: 170, kind: 'furniture', confirmed: true, description: `Szafki u góry nad częścią wypoczynkową. ${OWNER}` },
  { id: 'upper-kitchen', label: 'Szafki nad palnikami i zlewem', layer: 'gora', x: 210, y: 590, w: 60, h: 160, kind: 'kitchen', confirmed: true, description: `Szafki nad palnikami i zlewem. ${OWNER}` },
  { id: 'pv', label: 'Panele fotowoltaiczne (dach)', layer: 'gora', x: 100, y: 400, w: 100, h: 150, kind: 'device', confirmed: true, description: `Kamper ma instalację fotowoltaiczną. ${OWNER}`, unconfirmedNote: 'Liczba, moc i położenie paneli na dachu niepotwierdzone — rysunek poglądowy.', instructions: ['fotowoltaika', 'akumulator'] },
  { id: 'roof-fan', label: 'Wentylator / wywietrznik', layer: 'gora', x: 120, y: 250, w: 60, h: 60, kind: 'device', confirmed: false, description: 'Wentylator wymieniony w zakresie instrukcji.', unconfirmedNote: 'Położenie i typ wentylatora nieznane — umieszczenie poglądowe.', instructions: ['wentylator'] },
];

/** Urządzenia o nieustalonym położeniu w kamperze. */
export const UNPLACED_DEVICES: { label: string; instruction: InstructionId }[] = [
  { label: 'Generator prądu', instruction: 'generator' },
  { label: 'Akumulator', instruction: 'akumulator' },
  { label: 'Podgrzewacz wody', instruction: 'ciepla-woda' },
];
