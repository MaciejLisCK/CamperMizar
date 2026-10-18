import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PLAN } from '../data/camper';
import {
  checkFabricTexture,
  floorTexture,
  louverTexture,
  questionSpriteTexture,
  rearLiveryTexture,
  sideLiveryTexture,
  solarTexture,
  upholsteryTexture,
  woodTexture,
} from './textures';

/*
 * Model 3D kampera CI Mizar 140 na Fiacie Ducato (1996).
 *
 * Układ osi: X — wzdłuż pojazdu (przód = +X), Y — w górę, Z — w prawo patrząc w kierunku jazdy.
 * Wymiary są POGLĄDOWE (rzeczywiste wymiary pojazdu do uzupełnienia). Układ wnętrza wynika
 * z opisu właściciela (ten sam co rzut 2D), a wygląd zewnętrzny wzorowany jest na zdjęciach
 * egzemplarza z ogłoszenia — szczegóły mogą różnić się od pojazdu właściciela.
 */

// --- wymiary poglądowe (m) ---
const BOX_LEN = 4.0; // zabudowa: od tyłu (x=0) do tylnej ściany kabiny
const BOX_W = 2.3;
const CAB_W = 2.0;
const FRONT_X = 5.9;
const ROOF_Y = 2.75;
const FLOOR_Y = 0.62;
const CEIL_Y = 2.66;
const WHEEL_R = 0.34;
const REAR_AXLE_X = 1.75;
const FRONT_AXLE_X = 5.12;
const WALL = 0.045;

/** Zamiana współrzędnych rzutu 2D (viewBox 0 0 300 800) na współrzędne 3D. */
const FX = (y: number) => (y >= 190 ? ((760 - y) * BOX_LEN) / 570 : BOX_LEN + ((190 - y) * 1.4) / 150);
const FZ = (x: number) => ((x - 150) * BOX_W) / 260;

function planRect(id: string) {
  const p = PLAN.find((e) => e.id === id)!;
  return { x0: FX(p.y + p.h), x1: FX(p.y), z0: FZ(p.x), z1: FZ(p.x + p.w) };
}

export type ViewMode = 'zewnatrz' | 'wnetrze';

export interface CamperModel {
  root: THREE.Group;
  pickables: THREE.Object3D[];
  setMode: (mode: ViewMode) => void;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  setShowBikes: (v: boolean) => void;
  setShowMarkers: (v: boolean) => void;
  /** Alkowa i szafki górne — można ukryć w trybie wnętrza, by zajrzeć niżej */
  setShowUpper: (v: boolean) => void;
  /** Gdzie element jest widoczny — pozwala przełączyć tryb przy wyborze z listy */
  visibilityOf: (id: string) => 'zewnatrz' | 'wnetrze' | 'oba';
  centerOf: (id: string) => THREE.Vector3 | null;
  dispose: () => void;
}

export function buildCamper(): CamperModel {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => {
    disposables.push(o);
    return o;
  };

  // ---------- materiały ----------
  const std = (p: THREE.MeshStandardMaterialParameters) => track(new THREE.MeshStandardMaterial(p));
  const side = track(sideLiveryTexture());
  const M = {
    shellSide: std({ map: side, roughness: 0.42, metalness: 0.05 }),
    cream: std({ color: '#e4d8bb', roughness: 0.42, metalness: 0.05 }),
    cabWhite: std({ color: '#ecebe4', roughness: 0.3, metalness: 0.1 }),
    black: std({ color: '#1c1c1c', roughness: 0.75 }),
    darkGrey: std({ color: '#3a3b3d', roughness: 0.6 }),
    steel: std({ color: '#c3c7cc', roughness: 0.3, metalness: 0.85 }),
    rim: std({ color: '#b9bcc0', roughness: 0.35, metalness: 0.7 }),
    tyre: std({ color: '#161616', roughness: 0.92 }),
    glass: track(
      new THREE.MeshPhysicalMaterial({ color: '#1d262d', roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.62, envMapIntensity: 1.6, side: THREE.DoubleSide }),
    ),
    acrylic: track(
      new THREE.MeshPhysicalMaterial({ color: '#2b251e', roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.72, envMapIntensity: 1.4 }),
    ),
    frosted: std({ color: '#e8eef0', roughness: 0.3, transparent: true, opacity: 0.85 }),
    frame: std({ color: '#2a2a2a', roughness: 0.5 }),
    tail: std({ color: '#b51f1a', roughness: 0.25, emissive: '#3a0402' }),
    amber: std({ color: '#e08a12', roughness: 0.25 }),
    headlight: track(new THREE.MeshPhysicalMaterial({ color: '#dfe6ea', roughness: 0.05, metalness: 0.3, clearcoat: 1 })),
    plate: std({ color: '#f4f4f4', roughness: 0.5 }),
    oak: std({ map: track(woodTexture()), roughness: 0.55 }),
    oakDark: std({ map: track(woodTexture('#b0824c', 11)), roughness: 0.55 }),
    louver: std({ map: track(louverTexture()), roughness: 0.6 }),
    fabric: std({ map: track(upholsteryTexture()), roughness: 0.95 }),
    cabFabric: std({ map: track(checkFabricTexture()), roughness: 0.95 }),
    tabletop: std({ color: '#d9d3c5', roughness: 0.4 }),
    laminate: std({ color: '#cfc6b3', roughness: 0.35 }),
    floor: std({ map: track(floorTexture()), roughness: 0.7 }),
    wallIn: std({ color: '#dcd8cf', roughness: 0.8 }),
    sanitary: std({ color: '#f6f6f2', roughness: 0.15 }),
    hob: std({ color: '#141414', roughness: 0.15, metalness: 0.3 }),
    fridge: std({ color: '#b9b7b0', roughness: 0.4, metalness: 0.2 }),
    solar: std({ map: track(solarTexture()), roughness: 0.18, metalness: 0.35 }),
    alu: std({ color: '#a9adb2', roughness: 0.35, metalness: 0.8 }),
    hatch: std({ color: '#f2f2ee', roughness: 0.35, transparent: true, opacity: 0.92 }),
    heater: std({ color: '#e7e2d6', roughness: 0.5 }),
    grille: std({ color: '#2d2d2d', roughness: 0.7 }),
    bikeFrame: std({ color: '#1f5fa8', roughness: 0.35, metalness: 0.4 }),
    bathWall: std({ color: '#efece6', roughness: 0.6, transparent: true, opacity: 1 }),
  };
  const ghost = track(
    new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }),
  );

  // ---------- pomocnicze ----------
  const geo = <T extends THREE.BufferGeometry>(g: T) => track(g);
  function mesh(g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[]) {
    const o = new THREE.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  }
  function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: THREE.Material, r = 0.012) {
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    const d = Math.abs(z1 - z0);
    const rr = Math.min(r, w / 2.01, h / 2.01, d / 2.01);
    const g = rr > 0.001 ? geo(new RoundedBoxGeometry(w, h, d, 2, rr)) : geo(new THREE.BoxGeometry(w, h, d));
    const o = mesh(g, m);
    o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return o;
  }
  function cyl(rTop: number, rBot: number, h: number, m: THREE.Material, seg = 24) {
    return mesh(geo(new THREE.CylinderGeometry(rTop, rBot, h, seg)), m);
  }
  /** Rura między dwoma punktami */
  function tube(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
    const len = a.distanceTo(b);
    const o = cyl(r, r, len, m, 10);
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return o;
  }

  // Grupy elementów klikalnych
  const elements = new Map<string, THREE.Group>();
  const elementVisibility = new Map<string, 'zewnatrz' | 'wnetrze' | 'oba'>();
  function el(id: string, vis: 'zewnatrz' | 'wnetrze' | 'oba' = 'wnetrze') {
    let g = elements.get(id);
    if (!g) {
      g = new THREE.Group();
      g.userData.elId = id;
      g.name = id;
      elements.set(id, g);
      elementVisibility.set(id, vis);
      root.add(g);
    }
    return g;
  }

  const shell = new THREE.Group(); // nadwozie — w trybie wnętrza staje się przezroczyste
  const roofItems = new THREE.Group(); // elementy dachu — ukrywane w trybie wnętrza
  const interiorOnly = new THREE.Group();
  root.add(shell, roofItems, interiorOnly);

  // =====================================================================
  //  NADWOZIE ZABUDOWY (z alkową)
  // =====================================================================
  {
    const s = new THREE.Shape();
    s.moveTo(0, 0.42);
    s.lineTo(REAR_AXLE_X - 0.46, 0.42);
    s.absarc(REAR_AXLE_X, 0.42, 0.46, Math.PI, 0, true);
    s.lineTo(BOX_LEN, 0.42);
    s.lineTo(BOX_LEN, 1.96);
    s.lineTo(4.72, 1.96);
    s.quadraticCurveTo(5.02, 1.98, 5.08, 2.2);
    s.lineTo(5.1, 2.5);
    s.quadraticCurveTo(5.08, ROOF_Y, 4.82, ROOF_Y);
    s.lineTo(0.06, ROOF_Y);
    s.quadraticCurveTo(0, ROOF_Y, 0, ROOF_Y - 0.06);
    s.lineTo(0, 0.42);

    const bevel = 0.06;
    const g = geo(
      new THREE.ExtrudeGeometry(s, {
        depth: BOX_W - 2 * bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelOffset: -bevel,
        bevelSegments: 5,
        curveSegments: 24,
      }),
    );
    g.translate(0, 0, -BOX_W / 2 + bevel);
    const body = mesh(g, [M.shellSide, M.cream]);
    body.userData.shell = true;
    shell.add(body);

    // tylna ściana z oklejeniem
    const rear = mesh(geo(new THREE.PlaneGeometry(BOX_W - 0.1, ROOF_Y - 0.3 - 0.06)), std({ map: track(rearLiveryTexture()), roughness: 0.45 }));
    rear.rotation.y = -Math.PI / 2;
    rear.position.set(-0.004, 0.3 + (ROOF_Y - 0.36) / 2, 0);
    rear.userData.shell = true;
    shell.add(rear);

    // dolny próg / rama i zderzak tylny
    shell.add(box(-0.08, 0.12, 0.3, 0.46, -BOX_W / 2 + 0.05, BOX_W / 2 - 0.05, M.cream, 0.03));
    // listwy narożne
    for (const z of [-BOX_W / 2, BOX_W / 2]) {
      const strip = box(-0.012, 0.03, 0.42, ROOF_Y - 0.04, z - 0.02, z + 0.02, M.cream, 0.01);
      strip.userData.shell = true;
      shell.add(strip);
    }
  }

  // =====================================================================
  //  KABINA FIATA DUCATO (seria 230, lata 1994–2002) — sylwetka poglądowa
  // =====================================================================
  {
    const s = new THREE.Shape();
    s.moveTo(BOX_LEN - 0.05, 0.42);
    s.lineTo(FRONT_AXLE_X - 0.44, 0.42);
    s.absarc(FRONT_AXLE_X, 0.42, 0.44, Math.PI, 0, true);
    s.lineTo(5.78, 0.42);
    s.lineTo(5.86, 0.6);
    s.quadraticCurveTo(5.9, 0.85, 5.84, 1.02);
    s.quadraticCurveTo(5.55, 1.12, 5.2, 1.2);
    s.lineTo(4.74, 1.94);
    s.lineTo(BOX_LEN - 0.05, 1.94);
    s.lineTo(BOX_LEN - 0.05, 0.42);
    const bevel = 0.09;
    const g = geo(
      new THREE.ExtrudeGeometry(s, {
        depth: CAB_W - 2 * bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelOffset: -bevel,
        bevelSegments: 6,
        curveSegments: 20,
      }),
    );
    g.translate(0, 0, -CAB_W / 2 + bevel);
    const cab = mesh(g, M.cabWhite);
    cab.userData.shell = true;
    shell.add(cab);

    // szyba przednia
    const ws = new THREE.Vector3(5.2, 1.2, 0);
    const wt = new THREE.Vector3(4.76, 1.92, 0);
    const wl = ws.distanceTo(wt);
    const windscreen = mesh(geo(new THREE.PlaneGeometry(CAB_W - 0.22, wl - 0.06)), M.glass);
    windscreen.position.copy(ws).add(wt).multiplyScalar(0.5).add(new THREE.Vector3(0.012, 0.008, 0));
    const lean = Math.atan2(ws.x - wt.x, wt.y - ws.y);
    windscreen.quaternion
      .setFromAxisAngle(new THREE.Vector3(0, 0, 1), lean)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
    shell.add(windscreen);

    // wycieraczki
    for (const z of [-0.45, 0.25]) {
      const w = box(5.15, 5.19, 1.21, 1.23, z - 0.3, z + 0.3, M.black, 0.005);
      w.rotation.x = 0.15;
      shell.add(w);
    }

    // zderzak, grill, reflektory
    shell.add(box(5.76, 5.95, 0.34, 0.62, -CAB_W / 2 - 0.03, CAB_W / 2 + 0.03, M.black, 0.06));
    shell.add(box(5.83, 5.89, 0.72, 0.94, -0.52, 0.52, M.grille, 0.02));
    for (let i = 0; i < 4; i++) shell.add(box(5.885, 5.9, 0.75 + i * 0.05, 0.765 + i * 0.05, -0.5, 0.5, M.black, 0));
    const badge = cyl(0.045, 0.045, 0.01, M.steel, 20);
    badge.rotation.z = Math.PI / 2;
    badge.position.set(5.9, 0.83, 0);
    shell.add(badge);
    for (const z of [-0.74, 0.74]) {
      const hl = box(5.8, 5.88, 0.76, 0.93, z - 0.2, z + 0.2, M.headlight, 0.03);
      shell.add(hl);
      shell.add(box(5.8, 5.87, 0.62, 0.68, z - 0.16, z + 0.16, M.amber, 0.015));
    }
    // tablica przednia
    shell.add(box(5.95, 5.96, 0.42, 0.52, -0.26, 0.26, M.plate, 0));

    // listwy boczne, szyby boczne, lusterka
    for (const sgn of [-1, 1]) {
      const z = (sgn * CAB_W) / 2;
      shell.add(box(4.0, 5.7, 0.55, 0.62, z - 0.02, z + 0.02, M.black, 0.01));
      if (sgn === 1) {
        // drzwi pasażera (kabina seryjna, nieopisana przez właściciela)
        shell.add(cabDoor(sgn, M.cabWhite));
      }
      // lusterko
      shell.add(tube(new THREE.Vector3(5.05, 1.45, z), new THREE.Vector3(5.05, 1.45, z + sgn * 0.2), 0.015, M.black));
      shell.add(box(4.98, 5.08, 1.3, 1.62, z + sgn * 0.19, z + sgn * 0.26, M.black, 0.02));
    }
  }

  /** Drzwi kabiny z szybą (trapez) i klamką. */
  function cabDoor(sgn: number, mat: THREE.Material) {
    const g = new THREE.Group();
    const z = (sgn * CAB_W) / 2 + sgn * 0.004;
    const shape = new THREE.Shape();
    shape.moveTo(4.22, 1.25);
    shape.lineTo(5.02, 1.25);
    shape.lineTo(4.62, 1.84);
    shape.lineTo(4.22, 1.84);
    shape.lineTo(4.22, 1.25);
    const gw = geo(new THREE.ShapeGeometry(shape));
    const win = mesh(gw, M.glass);
    win.position.z = z + sgn * 0.002;
    g.add(win);
    // panel drzwi (cienka nakładka z linią podziału)
    const panel = box(4.2, 5.12, 0.5, 1.25, z - 0.006, z + 0.006, mat, 0.004);
    g.add(panel);
    g.add(box(4.19, 4.21, 0.5, 1.86, z - 0.008, z + 0.008, M.darkGrey, 0));
    g.add(box(4.32, 4.44, 1.08, 1.11, z + sgn * 0.006, z + sgn * 0.02, M.black, 0.005));
    return g;
  }

  // drzwi kierowcy — element klikalny
  el('driver-door', 'oba').add(cabDoor(-1, M.cabWhite));

  // =====================================================================
  //  KOŁA I PODWOZIE
  // =====================================================================
  function wheel(x: number, z: number) {
    const g = new THREE.Group();
    const tyreGeo = geo(new THREE.TorusGeometry(WHEEL_R - 0.08, 0.085, 18, 40));
    const t = mesh(tyreGeo, M.tyre);
    g.add(t);
    const disc = cyl(0.21, 0.21, 0.17, M.rim, 32);
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    const hub = cyl(0.07, 0.07, 0.19, M.steel, 20);
    hub.rotation.x = Math.PI / 2;
    g.add(hub);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const hole = cyl(0.025, 0.025, 0.18, M.darkGrey, 10);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0);
      g.add(hole);
    }
    g.position.set(x, WHEEL_R, z);
    return g;
  }
  const trackHalf = 0.84;
  for (const z of [-trackHalf, trackHalf]) {
    shell.add(wheel(FRONT_AXLE_X, z));
    shell.add(wheel(REAR_AXLE_X, z));
  }
  // rama i zbiorniki
  shell.add(box(0.2, 5.6, 0.32, 0.44, -0.55, -0.43, M.black, 0.01));
  shell.add(box(0.2, 5.6, 0.32, 0.44, 0.43, 0.55, M.black, 0.01));
  shell.add(box(2.6, 3.3, 0.24, 0.42, -0.4, 0.2, M.darkGrey, 0.04));
  // stopień przy drzwiach wejściowych
  // (dodawany niżej razem z drzwiami)

  // =====================================================================
  //  OKNA ZABUDOWY
  // =====================================================================
  function habWindow(x0: number, x1: number, y0: number, y1: number, sgn: number, mat: THREE.Material = M.acrylic) {
    const g = new THREE.Group();
    const z = (sgn * BOX_W) / 2;
    g.add(box(x0 - 0.04, x1 + 0.04, y0 - 0.04, y1 + 0.04, z - 0.01, z + sgn * 0.022, M.frame, 0.03));
    g.add(box(x0, x1, y0, y1, z + sgn * 0.018, z + sgn * 0.032, mat, 0.03));
    return g;
  }
  const winL = planRect('window-left');
  const winR = planRect('window-right');
  el('window-left', 'oba').add(habWindow(winL.x0 + 0.05, winL.x1 - 0.05, 1.42, 2.02, -1));
  el('window-right', 'oba').add(habWindow(winR.x0 + 0.05, winR.x1 - 0.05, 1.42, 2.02, 1));
  // okna widoczne na zdjęciach egzemplarza z ogłoszenia (dekoracja, niepotwierdzone)
  shell.add(habWindow(0.3, 0.85, 1.8, 2.12, 1)); // kuchnia
  shell.add(habWindow(0.35, 0.7, 1.82, 2.12, -1, M.frosted)); // łazienka
  shell.add(habWindow(4.25, 4.75, 2.12, 2.5, -1)); // alkowa
  shell.add(habWindow(4.25, 4.75, 2.12, 2.5, 1));
  {
    // okno czołowe alkowy
    const g = new THREE.Group();
    g.add(box(5.07, 5.11, 2.28, 2.52, -0.75, 0.75, M.frame, 0.03));
    g.add(box(5.09, 5.12, 2.31, 2.49, -0.72, 0.72, M.acrylic, 0.02));
    shell.add(g);
    // okno tylne
    shell.add(box(-0.03, 0.0, 1.62, 2.18, -0.42, 0.38, M.frame, 0.03));
    shell.add(box(-0.04, -0.02, 1.65, 2.15, -0.39, 0.35, M.acrylic, 0.02));
    // światła tylne i tablica
    for (const z of [-0.95, 0.95]) {
      shell.add(box(-0.1, -0.07, 0.36, 0.44, z - 0.16, z + 0.16, M.tail, 0.015));
      shell.add(box(-0.1, -0.07, 0.36, 0.44, z - (z > 0 ? 0.2 : -0.16), z - (z > 0 ? 0.16 : -0.2), M.amber, 0.01));
    }
    shell.add(box(-0.1, -0.085, 0.33, 0.45, -0.26, 0.26, M.plate, 0));
  }

  // =====================================================================
  //  DRZWI WEJŚCIOWE (prawa ściana, przy kuchni)
  // =====================================================================
  {
    const g = el('entry-door', 'oba');
    const r = planRect('entry-door');
    const x0 = r.x0 - 0.05;
    const x1 = r.x1 + 0.08;
    const z = BOX_W / 2;
    g.add(box(x0 - 0.03, x1 + 0.03, 0.5, 2.36, z - 0.01, z + 0.012, M.frame, 0.02));
    g.add(box(x0, x1, 0.53, 2.33, z + 0.005, z + 0.022, M.cream, 0.03));
    g.add(box(x0 + 0.07, x1 - 0.07, 1.72, 2.2, z + 0.02, z + 0.03, M.acrylic, 0.03));
    g.add(box(x0 + 0.06, x0 + 0.1, 1.2, 1.36, z + 0.02, z + 0.05, M.steel, 0.01));
    // stopień
    g.add(box(x0, x1, 0.3, 0.36, z - 0.05, z + 0.22, M.alu, 0.01));
  }

  // =====================================================================
  //  BAGAŻNIK ROWEROWY (tył)
  // =====================================================================
  const bikes = new THREE.Group();
  {
    const g = el('bike-rack', 'zewnatrz');
    const xr = -0.22;
    for (const z of [-0.85, 0.85]) {
      g.add(tube(new THREE.Vector3(-0.01, 2.05, z), new THREE.Vector3(xr, 2.0, z), 0.018, M.alu));
      g.add(tube(new THREE.Vector3(-0.01, 0.95, z), new THREE.Vector3(xr, 0.8, z), 0.018, M.alu));
      g.add(tube(new THREE.Vector3(xr, 0.8, z), new THREE.Vector3(xr, 2.0, z), 0.018, M.alu));
    }
    g.add(tube(new THREE.Vector3(xr, 2.0, -0.85), new THREE.Vector3(xr, 2.0, 0.85), 0.018, M.alu));
    // szyny na koła
    for (const dx of [0, -0.17]) {
      g.add(box(xr - 0.06 + dx, xr + 0.02 + dx, 0.78, 0.82, -1.0, 1.0, M.alu, 0.01));
    }
    // rowery (poglądowe)
    function bike(x: number, flip: number) {
      const b = new THREE.Group();
      const wr = 0.33;
      const yw = 0.82 + wr;
      const zA = -0.52 * flip;
      const zB = 0.52 * flip;
      for (const zz of [zA, zB]) {
        const t = mesh(geo(new THREE.TorusGeometry(wr, 0.02, 10, 40)), M.tyre);
        t.position.set(x, yw, zz);
        t.rotation.y = Math.PI / 2;
        b.add(t);
        const hubc = cyl(0.03, 0.03, 0.06, M.alu, 10);
        hubc.rotation.z = Math.PI / 2;
        hubc.position.set(x, yw, zz);
        b.add(hubc);
      }
      const P = (y: number, z: number) => new THREE.Vector3(x, y, z * flip);
      const bb = P(yw - 0.02, 0.0); // suport
      const seat = P(yw + 0.5, -0.12);
      const head = P(yw + 0.48, 0.38);
      b.add(tube(P(yw, -0.52), bb, 0.015, M.bikeFrame));
      b.add(tube(P(yw, -0.52), seat, 0.014, M.bikeFrame));
      b.add(tube(bb, seat, 0.02, M.bikeFrame));
      b.add(tube(bb, head, 0.022, M.bikeFrame));
      b.add(tube(seat, head, 0.02, M.bikeFrame));
      b.add(tube(head, P(yw, 0.52), 0.016, M.alu));
      b.add(tube(head, P(yw + 0.62, 0.34), 0.015, M.alu));
      b.add(tube(P(yw + 0.62, 0.34).add(new THREE.Vector3(0.22, 0, 0)), P(yw + 0.62, 0.34).add(new THREE.Vector3(-0.22, 0, 0)), 0.013, M.black));
      const saddle = box(x - 0.07, x + 0.07, seat.y + 0.06, seat.y + 0.1, seat.z - 0.13, seat.z + 0.06, M.black, 0.02);
      b.add(saddle);
      b.add(tube(seat, seat.clone().add(new THREE.Vector3(0, 0.07, 0)), 0.012, M.alu));
      return b;
    }
    bikes.add(bike(xr - 0.02, 1), bike(xr - 0.19, -1));
    g.add(bikes);
  }

  // =====================================================================
  //  DACH: FOTOWOLTAIKA, WYWIETRZNIK
  // =====================================================================
  {
    const g = el('pv', 'zewnatrz');
    const r = planRect('pv');
    // dwa panele obok siebie (liczba i położenie niepotwierdzone)
    const zMid = (r.z0 + r.z1) / 2;
    for (const off of [-0.36, 0.36]) {
      const z0 = zMid + off - 0.33;
      const z1 = zMid + off + 0.33;
      g.add(box(r.x0, r.x1, ROOF_Y + 0.04, ROOF_Y + 0.075, z0, z1, M.alu, 0.008));
      const panel = mesh(geo(new THREE.PlaneGeometry(r.x1 - r.x0 - 0.05, z1 - z0 - 0.05)), M.solar);
      panel.rotation.x = -Math.PI / 2;
      panel.rotation.z = Math.PI / 2;
      panel.position.set((r.x0 + r.x1) / 2, ROOF_Y + 0.077, (z0 + z1) / 2);
      g.add(panel);
      for (const x of [r.x0 + 0.06, r.x1 - 0.06]) g.add(box(x - 0.03, x + 0.03, ROOF_Y, ROOF_Y + 0.045, z0 + 0.05, z1 - 0.05, M.alu, 0.005));
    }
    roofItems.add(g);
  }
  {
    const g = el('roof-fan', 'zewnatrz');
    const r = planRect('roof-fan');
    g.add(box(r.x0 - 0.05, r.x1 + 0.05, ROOF_Y, ROOF_Y + 0.05, r.z0 - 0.05, r.z1 + 0.05, M.cream, 0.02));
    const lid = box(r.x0, r.x1, ROOF_Y + 0.05, ROOF_Y + 0.11, r.z0, r.z1, M.hatch, 0.025);
    lid.rotation.z = 0.06;
    g.add(lid);
    roofItems.add(g);
  }
  // mniejszy wywietrznik nad łazienką (dekoracja)
  roofItems.add(box(0.5, 0.82, ROOF_Y, ROOF_Y + 0.07, -0.75, -0.43, M.hatch, 0.02));

  // =====================================================================
  //  WNĘTRZE
  // =====================================================================
  const F = FLOOR_Y;
  const zL = -BOX_W / 2 + WALL; // wewnętrzna ściana lewa
  const zR = BOX_W / 2 - WALL;

  // podłoga i ściany wewnętrzne (widoczne w trybie wnętrza)
  interiorOnly.add(box(0.03, BOX_LEN - 0.02, F - 0.02, F, zL, zR, M.floor, 0));
  interiorOnly.add(box(BOX_LEN - 0.02, FRONT_X - 0.6, 0.55, 0.57, -CAB_W / 2 + 0.08, CAB_W / 2 - 0.08, M.darkGrey, 0));

  // --- kabina: fotele, deska rozdzielcza, kierownica
  function seat(id: string) {
    const r = planRect(id);
    const g = el(id, 'wnetrze');
    const x0 = r.x0 + 0.08;
    const x1 = r.x1 - 0.05;
    const z0 = r.z0 + 0.06;
    const z1 = r.z1 - 0.06;
    g.add(box(x0 + 0.05, x1 - 0.05, 0.57, F + 0.3, z0 + 0.05, z1 - 0.05, M.darkGrey, 0.02));
    g.add(box(x0, x1, F + 0.3, F + 0.44, z0, z1, M.cabFabric, 0.05));
    const back = box(x0 - 0.04, x0 + 0.1, F + 0.4, F + 1.08, z0, z1, M.cabFabric, 0.05);
    back.rotation.z = 0.18;
    back.position.x -= 0.04;
    g.add(back);
    const headrest = box(x0 - 0.12, x0 + 0.0, F + 1.1, F + 1.3, z0 + 0.12, z1 - 0.12, M.cabFabric, 0.04);
    g.add(headrest);
    return g;
  }
  seat('driver');
  seat('passenger');
  interiorOnly.add(box(5.0, 5.24, 0.9, 1.22, -CAB_W / 2 + 0.1, CAB_W / 2 - 0.1, M.darkGrey, 0.05));
  {
    const sw = mesh(geo(new THREE.TorusGeometry(0.2, 0.02, 10, 32)), M.black);
    const dr = planRect('driver');
    sw.position.set(4.98, 1.28, (dr.z0 + dr.z1) / 2);
    sw.quaternion
      .setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.45)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
    interiorOnly.add(sw);
    interiorOnly.add(tube(new THREE.Vector3(4.98, 1.28, sw.position.z), new THREE.Vector3(5.12, 1.0, sw.position.z), 0.03, M.black));
  }

  // --- alkowa z łóżkiem
  {
    const g = el('alcove-bed', 'wnetrze');
    g.add(box(BOX_LEN - 0.3, 5.0, 1.96, 2.0, zL, zR, M.oakDark, 0.01));
    g.add(box(BOX_LEN - 0.25, 4.95, 2.0, 2.15, zL + 0.03, zR - 0.03, M.fabric, 0.06));
    g.add(box(4.75, 4.92, 2.15, 2.25, zL + 0.15, -0.1, M.cream, 0.05));
    g.add(box(4.75, 4.92, 2.15, 2.25, 0.1, zR - 0.15, M.cream, 0.05));
  }

  // --- leżanka (lewa)
  {
    const r = planRect('lounger');
    const g = el('lounger');
    g.add(box(r.x0, r.x1, F, F + 0.38, r.z0, r.z1, M.oak, 0.01));
    g.add(box(r.x0 + 0.01, r.x1 - 0.01, F + 0.38, F + 0.5, r.z0 + 0.12, r.z1, M.fabric, 0.04));
    g.add(box(r.x0 + 0.01, r.x1 - 0.01, F + 0.45, F + 0.98, r.z0, r.z0 + 0.13, M.fabric, 0.05));
  }

  // --- dinette: dwie kanapy i stół (prawa)
  function bench(id: string, backAtFront: boolean) {
    const r = planRect(id);
    const g = el(id);
    g.add(box(r.x0, r.x1, F, F + 0.38, r.z0, r.z1, M.oak, 0.01));
    g.add(box(r.x0 + 0.01, r.x1 - 0.01, F + 0.38, F + 0.5, r.z0, r.z1, M.fabric, 0.04));
    const bx0 = backAtFront ? r.x1 - 0.12 : r.x0;
    const bx1 = backAtFront ? r.x1 : r.x0 + 0.12;
    g.add(box(bx0, bx1, F + 0.48, F + 1.05, r.z0, r.z1, M.fabric, 0.05));
    return g;
  }
  bench('dinette-front', true); // pod nią zbiornik wody
  bench('dinette-rear', false);
  {
    const r = planRect('dinette-table');
    const g = el('dinette-table');
    g.add(box(r.x0 - 0.02, r.x1 + 0.02, F + 0.69, F + 0.72, r.z0 - 0.03, r.z1 + 0.03, M.tabletop, 0.012));
    const leg = cyl(0.03, 0.03, 0.69, M.steel, 16);
    leg.position.set((r.x0 + r.x1) / 2, F + 0.345, (r.z0 + r.z1) / 2 - 0.15);
    g.add(leg);
    const foot = cyl(0.14, 0.14, 0.01, M.steel, 24);
    foot.position.set(leg.position.x, F + 0.005, leg.position.z);
    g.add(foot);
  }

  // --- wysoka szafa i ogrzewacz pod nią (lewa)
  {
    const r = planRect('wardrobe');
    const h = planRect('heater');
    const g = el('wardrobe');
    g.add(box(r.x0, r.x1, F, CEIL_Y - 0.02, zL, r.z1, M.oak, 0.01));
    g.add(box(r.x0 + 0.03, r.x1 - 0.03, F + 0.1, CEIL_Y - 0.1, r.z1 - 0.005, r.z1 + 0.012, M.louver, 0.005));
    // część szafy nad ogrzewaczem
    g.add(box(h.x0, r.x0, F + 0.52, CEIL_Y - 0.02, zL, r.z1, M.oak, 0.01));
    g.add(box(h.x0 + 0.03, r.x0 - 0.02, F + 0.6, CEIL_Y - 0.1, r.z1 - 0.005, r.z1 + 0.012, M.louver, 0.005));
    const hg = el('heater');
    hg.add(box(h.x0, r.x0, F, F + 0.5, zL, r.z1, M.heater, 0.02));
    for (let i = 0; i < 6; i++) hg.add(box(h.x0 + 0.04, r.x0 - 0.04, F + 0.08 + i * 0.06, F + 0.1 + i * 0.06, r.z1 - 0.005, r.z1 + 0.01, M.grille, 0));
  }

  // --- mała szafka i podnoszony blat (prawa)
  {
    const r = planRect('small-cabinet');
    const g = el('small-cabinet');
    g.add(box(r.x0, r.x1, F, F + 0.9, r.z0, zR, M.oak, 0.01));
    g.add(box(r.x0 + 0.02, r.x1 - 0.02, F + 0.08, F + 0.84, r.z0 - 0.012, r.z0 + 0.004, M.louver, 0.004));
    const w = planRect('worktop');
    const wg = el('worktop');
    wg.add(box(w.x0, w.x1, F, F + 0.86, w.z0, zR, M.oak, 0.01));
    wg.add(box(w.x0 - 0.01, w.x1 + 0.01, F + 0.86, F + 0.9, w.z0 - 0.02, zR, M.laminate, 0.008));
    wg.add(box(w.x0 + 0.02, w.x1 - 0.02, F + 0.885, F + 0.892, w.z0 + 0.06, w.z0 + 0.07, M.darkGrey, 0)); // linia zawiasu
  }

  // --- łazienka (lewy tylny narożnik)
  const bathWalls: THREE.Mesh[] = [];
  {
    const r = planRect('bathroom');
    const g = el('bathroom');
    const wallFront = box(r.x1 - 0.03, r.x1, F, CEIL_Y, zL, r.z1, M.bathWall, 0);
    const wallAisle = box(r.x0 + 0.02, r.x1, F, CEIL_Y, r.z1 - 0.03, r.z1, M.bathWall, 0);
    bathWalls.push(wallFront, wallAisle);
    g.add(wallFront, wallAisle);
    // drzwi łazienki w ścianie od strony przejścia
    g.add(box(r.x0 + 0.5, r.x1 - 0.08, F + 0.05, F + 1.85, r.z1 - 0.002, r.z1 + 0.01, M.oak, 0.01));
    g.add(box(r.x0 + 0.56, r.x0 + 0.6, F + 0.95, F + 1.0, r.z1 + 0.01, r.z1 + 0.04, M.steel, 0.005));
  }
  {
    const r = planRect('bath-shower');
    const g = el('bath-shower');
    g.add(box(r.x0, r.x1, F, F + 0.07, r.z0, r.z1, M.sanitary, 0.03));
    g.add(tube(new THREE.Vector3(r.x1 - 0.06, F + 0.9, r.z0 + 0.04), new THREE.Vector3(r.x1 - 0.06, F + 1.9, r.z0 + 0.04), 0.012, M.steel));
    const head = cyl(0.05, 0.03, 0.03, M.steel, 16);
    head.position.set(r.x1 - 0.06, F + 1.9, r.z0 + 0.1);
    g.add(head);
  }
  {
    const r = planRect('bath-toilet');
    const g = el('bath-toilet');
    const cx = (r.x0 + r.x1) / 2;
    const cz = (r.z0 + r.z1) / 2;
    g.add(box(r.x0, r.x0 + 0.18, F, F + 0.48, r.z0 + 0.03, r.z1 - 0.03, M.sanitary, 0.03));
    const bowl = cyl(0.17, 0.14, 0.42, M.sanitary, 28);
    bowl.position.set(cx + 0.04, F + 0.21, cz);
    g.add(bowl);
    const lid = cyl(0.18, 0.18, 0.03, M.sanitary, 28);
    lid.position.set(cx + 0.04, F + 0.44, cz);
    g.add(lid);
  }
  {
    const r = planRect('bath-sink');
    const g = el('bath-sink');
    g.add(box(r.x0, r.x1, F, F + 0.78, r.z0, r.z1, M.oak, 0.01));
    const basin = cyl(0.16, 0.12, 0.1, M.sanitary, 28);
    basin.position.set((r.x0 + r.x1) / 2, F + 0.83, (r.z0 + r.z1) / 2);
    g.add(basin);
    g.add(tube(new THREE.Vector3((r.x0 + r.x1) / 2, F + 0.88, r.z0 + 0.03), new THREE.Vector3((r.x0 + r.x1) / 2, F + 0.98, r.z0 + 0.03), 0.01, M.steel));
    g.add(box(r.x0 + 0.03, r.x1 - 0.03, F + 1.1, F + 1.6, zL, zL + 0.01, M.steel, 0.005)); // lustro
  }

  // --- kuchnia (prawy tył)
  {
    const r = planRect('kitchen');
    const g = el('kitchen');
    g.add(box(r.x0, r.x1, F, F + 0.88, r.z0 + 0.05, zR, M.oak, 0.01));
    g.add(box(r.x0, r.x1, F + 0.88, F + 0.92, r.z0, zR, M.laminate, 0.008));
    g.add(box(r.x0 + 0.04, r.x1 - 0.04, F + 0.92, F + 1.3, zR - 0.01, zR, M.laminate, 0)); // ścianka
  }
  {
    const r = planRect('kitchen-burners');
    const g = el('kitchen-burners');
    g.add(box(r.x0 + 0.03, r.x1 - 0.03, F + 0.92, F + 0.935, r.z0 + 0.05, zR - 0.05, M.hob, 0.006));
    const cx = (r.x0 + r.x1) / 2;
    const cz = (r.z0 + r.z1) / 2 + 0.05;
    for (const [dx, dz] of [
      [-0.11, -0.1],
      [0.11, -0.1],
      [0, 0.13],
    ]) {
      const ring = mesh(geo(new THREE.TorusGeometry(0.06, 0.008, 8, 24)), M.steel);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(cx + dx, F + 0.945, cz + dz);
      g.add(ring);
    }
    // lodówka pod palnikami — drzwi od strony przejścia
    g.add(box(r.x0 + 0.03, r.x1 - 0.03, F + 0.08, F + 0.84, r.z0 + 0.035, r.z0 + 0.055, M.fridge, 0.01));
    g.add(box(r.x0 + 0.08, r.x0 + 0.11, F + 0.55, F + 0.75, r.z0 + 0.02, r.z0 + 0.04, M.darkGrey, 0.005));
  }
  {
    const r = planRect('kitchen-sink');
    const g = el('kitchen-sink');
    const cx = (r.x0 + r.x1) / 2;
    const cz = (r.z0 + r.z1) / 2 + 0.05;
    g.add(box(cx - 0.18, cx + 0.18, F + 0.8, F + 0.925, cz - 0.17, cz + 0.17, M.steel, 0.02));
    g.add(box(cx - 0.16, cx + 0.16, F + 0.81, F + 0.93, cz - 0.15, cz + 0.15, M.darkGrey, 0.02));
    g.add(tube(new THREE.Vector3(cx, F + 0.92, zR - 0.06), new THREE.Vector3(cx, F + 1.15, zR - 0.06), 0.012, M.steel));
    g.add(tube(new THREE.Vector3(cx, F + 1.15, zR - 0.06), new THREE.Vector3(cx, F + 1.12, cz + 0.05), 0.012, M.steel));
    g.add(box(r.x0 + 0.03, r.x1 - 0.03, F + 0.08, F + 0.84, r.z0 + 0.035, r.z0 + 0.055, M.louver, 0.004));
  }

  // --- szafki górne
  function upperCabinet(id: string, x0: number, x1: number, sgn: number) {
    const g = el(id);
    const zw = sgn < 0 ? zL : zR;
    const zi = zw - sgn * 0.36;
    const z0 = Math.min(zw, zi);
    const z1 = Math.max(zw, zi);
    g.add(box(x0, x1, CEIL_Y - 0.5, CEIL_Y - 0.02, z0, z1, M.oak, 0.01));
    const doorZ = sgn < 0 ? z1 : z0;
    const n = Math.max(1, Math.round((x1 - x0) / 0.45));
    for (let i = 0; i < n; i++) {
      const a = x0 + ((x1 - x0) * i) / n + 0.015;
      const b = x0 + ((x1 - x0) * (i + 1)) / n - 0.015;
      g.add(box(a, b, CEIL_Y - 0.47, CEIL_Y - 0.05, doorZ - 0.008, doorZ + 0.008, M.louver, 0.004));
    }
    return g;
  }
  {
    const l = planRect('upper-left');
    const r = planRect('upper-right');
    const k = planRect('upper-kitchen');
    upperCabinet('upper-left', l.x0, l.x1, -1);
    upperCabinet('upper-right', r.x0, r.x1, 1);
    upperCabinet('upper-kitchen', k.x0, k.x1, 1);
  }

  // =====================================================================
  //  OZNACZENIA NIEPOTWIERDZONYCH ELEMENTÓW
  // =====================================================================
  const markers = new THREE.Group();
  {
    const tex = track(questionSpriteTexture());
    const mat = track(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    for (const p of PLAN) {
      if (p.confirmed && !p.unconfirmedNote) continue;
      const g = elements.get(p.id);
      if (!g) continue;
      const bb = new THREE.Box3().setFromObject(g);
      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.2, 0.2, 0.2);
      sp.position.set((bb.min.x + bb.max.x) / 2, bb.max.y + 0.16, (bb.min.z + bb.max.z) / 2);
      sp.renderOrder = 10;
      sp.userData.elId = p.id;
      sp.userData.strong = !p.confirmed; // pełne „?” tylko dla elementów niepotwierdzonych
      if (p.confirmed) sp.scale.set(0.13, 0.13, 0.13);
      markers.add(sp);
    }
    root.add(markers);
  }

  // ---------- klonowanie materiałów per element (podświetlenie) ----------
  for (const g of elements.values()) {
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const clone = (mat: THREE.Material) => {
        const c = mat.clone();
        track(c);
        return c;
      };
      m.material = Array.isArray(m.material) ? m.material.map(clone) : clone(m.material);
    });
  }

  // ---------- zapamiętanie materiałów nadwozia ----------
  const shellMeshes: THREE.Mesh[] = [];
  shell.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.userData.solid = m.material;
      shellMeshes.push(m);
    }
  });

  // ---------- API ----------
  let mode: ViewMode = 'zewnatrz';
  let selected: string | null = null;
  let hovered: string | null = null;
  let showMarkers = true;
  let showUpper = true;
  const UPPER = new Set(PLAN.filter((p) => p.layer === 'gora').map((p) => p.id));
  const SEE_THROUGH = new Set(['window-left', 'window-right', 'entry-door', 'driver-door']);

  function paint() {
    for (const [id, g] of elements) {
      const intensity = id === selected ? 0.55 : id === hovered ? 0.25 : 0;
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mat of mats) {
          const s = mat as THREE.MeshStandardMaterial;
          if (!s.emissive) continue;
          s.emissive.set(intensity > 0 ? '#1f78c8' : '#000000');
          s.emissiveIntensity = intensity;
        }
      });
    }
  }

  function applyMode() {
    const inside = mode === 'wnetrze';
    for (const m of shellMeshes) m.material = inside ? ghost : (m.userData.solid as THREE.Material);
    for (const m of shellMeshes) m.castShadow = !inside;
    roofItems.visible = !inside;
    for (const [id, g] of elements) {
      const v = elementVisibility.get(id);
      g.visible = v === 'oba' || v === mode || (v === 'zewnatrz' && !inside);
      if (id === 'pv' || id === 'roof-fan') g.visible = !inside;
      if (inside && !showUpper && UPPER.has(id)) g.visible = false;
      if (SEE_THROUGH.has(id)) {
        g.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          for (const mt of Array.isArray(m.material) ? m.material : [m.material]) {
            if (mt.userData.baseOpacity === undefined) mt.userData.baseOpacity = { o: mt.opacity, t: mt.transparent };
            const base = mt.userData.baseOpacity as { o: number; t: boolean };
            mt.transparent = inside ? true : base.t;
            mt.opacity = inside ? Math.min(base.o, 0.22) : base.o;
            mt.depthWrite = !inside;
            mt.needsUpdate = true;
          }
        });
      }
    }
    for (const w of bathWalls) {
      const mats = Array.isArray(w.material) ? w.material : [w.material];
      for (const mt of mats) {
        mt.opacity = inside ? 0.35 : 1;
        mt.depthWrite = !inside;
      }
    }
    markers.children.forEach((sp) => {
      const id = sp.userData.elId as string;
      const v = elementVisibility.get(id);
      const visibleNow = id === 'pv' || id === 'roof-fan' ? !inside : v === 'oba' || (inside ? v === 'wnetrze' : v === 'zewnatrz');
      sp.visible = showMarkers && visibleNow && !(inside && !showUpper && UPPER.has(id));
    });
  }

  applyMode();

  const pickables: THREE.Object3D[] = [...elements.values()];

  return {
    root,
    pickables,
    setMode(m) {
      mode = m;
      applyMode();
    },
    setSelected(id) {
      selected = id;
      paint();
    },
    setHovered(id) {
      hovered = id;
      paint();
    },
    setShowBikes(v) {
      bikes.visible = v;
    },
    setShowMarkers(v) {
      showMarkers = v;
      applyMode();
    },
    setShowUpper(v) {
      showUpper = v;
      applyMode();
    },
    visibilityOf(id) {
      if (id === 'pv' || id === 'roof-fan') return 'zewnatrz';
      return elementVisibility.get(id) ?? 'oba';
    },
    centerOf(id) {
      const g = elements.get(id);
      if (!g) return null;
      return new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
