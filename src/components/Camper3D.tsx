import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PLAN } from '../data/camper';
import { buildCamper, type CamperModel, type ViewMode } from '../three/camperModel';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type Preset = 'przod' | 'bok' | 'tyl' | 'gora' | 'wnetrze';

const PRESETS: Record<Preset, { pos: [number, number, number]; target: [number, number, number]; mode?: ViewMode; upper?: boolean; label: string }> = {
  przod: { pos: [12.5, 3.4, 8.2], target: [2.7, 1.25, 0], label: 'Przód ¾', mode: 'zewnatrz' },
  bok: { pos: [2.8, 1.9, 13], target: [2.8, 1.35, 0], label: 'Bok prawy', mode: 'zewnatrz' },
  tyl: { pos: [-8.2, 3.3, -7.2], target: [2.5, 1.3, 0], label: 'Tył ¾', mode: 'zewnatrz' },
  gora: { pos: [2.7, 12.5, 2.0], target: [2.7, 0.8, 0], label: 'Z góry', mode: 'wnetrze', upper: false },
  wnetrze: { pos: [7.6, 6.6, 5.6], target: [2.3, 1.0, 0], label: 'Wnętrze ¾', mode: 'wnetrze', upper: true },
};

const labelOf = (id: string) => PLAN.find((p) => p.id === id)?.label ?? id;

export default function Camper3D({ selectedId, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<CamperModel | null>(null);
  const flyRef = useRef<(p: Preset) => void>(() => {});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [mode, setMode] = useState<ViewMode>('zewnatrz');
  const [bikesOn, setBikesOn] = useState(true);
  const [markersOn, setMarkersOn] = useState(true);
  const [upperOn, setUpperOn] = useState(true);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      setError('Ta przeglądarka nie obsługuje WebGL — widok 3D jest niedostępny. Użyj rzutu 2D.');
      return;
    }
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = new THREE.Color(dark ? '#23282d' : '#dfe6ec');
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 22, 45);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
    camera.position.set(...PRESETS.przod.pos);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...PRESETS.przod.target);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 2;
    controls.maxDistance = 22;

    // światło
    scene.add(new THREE.HemisphereLight('#ffffff', '#8a8070', 0.55));
    const sun = new THREE.DirectionalLight('#fff4e0', 2.4);
    sun.position.set(6, 10, 7);
    sun.target.position.set(2.6, 0, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);

    // podłoże
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({ color: dark ? '#3a3e42' : '#c9c6bd', roughness: 0.95 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(5.2, 64), new THREE.MeshStandardMaterial({ color: dark ? '#44484c' : '#b9b5aa', roughness: 0.9 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(2.8, 0.002, 0);
    pad.receiveShadow = true;
    scene.add(pad);

    const model = buildCamper();
    modelRef.current = model;
    scene.add(model.root);

    // dopasowanie rozmiaru
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // animacja kamery do ustawień
    let fly: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number } | null = null;
    flyRef.current = (p: Preset) => {
      const pr = PRESETS[p];
      fly = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...pr.pos),
        tFrom: controls.target.clone(),
        tTo: new THREE.Vector3(...pr.target),
        t: 0,
      };
      if (pr.mode) setMode(pr.mode);
      if (pr.upper !== undefined) setUpperOn(pr.upper);
    };

    // wybór elementów
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (ev: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(model.pickables, true);
      for (const h of hits) {
        let o: THREE.Object3D | null = h.object;
        if (!o.visible) continue;
        let visible = true;
        for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) visible = false;
        if (!visible) continue;
        const mat = (h.object as THREE.Mesh).material as THREE.Material;
        if (mat && mat.transparent && mat.opacity < 0.5 && !mat.depthWrite) continue; // pomijamy półprzezroczyste ściany
        while (o && !o.userData.elId) o = o.parent;
        if (o) return o.userData.elId as string;
      }
      return null;
    };
    let downAt: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5) {
        const id = pick(e);
        if (id) onSelectRef.current(id);
      }
      downAt = null;
    };
    let hoverId: string | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return;
      const id = pick(e);
      if (id !== hoverId) {
        hoverId = id;
        model.setHovered(id);
        renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      }
      const rect = renderer.domElement.getBoundingClientRect();
      setHover(id ? { id, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
    };
    const onLeave = () => {
      hoverId = null;
      model.setHovered(null);
      setHover(null);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.style.cursor = 'grab';

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (fly) {
        fly.t = Math.min(1, fly.t + 0.035);
        const k = 1 - Math.pow(1 - fly.t, 3);
        camera.position.lerpVectors(fly.from, fly.to, k);
        controls.target.lerpVectors(fly.tFrom, fly.tTo, k);
        if (fly.t >= 1) fly = null;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      model.dispose();
      envTex.dispose();
      pmrem.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      pad.geometry.dispose();
      (pad.material as THREE.Material).dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      modelRef.current = null;
    };
  }, []);

  useEffect(() => modelRef.current?.setMode(mode), [mode]);
  useEffect(() => modelRef.current?.setShowBikes(bikesOn), [bikesOn]);
  useEffect(() => modelRef.current?.setShowMarkers(markersOn), [markersOn]);
  useEffect(() => modelRef.current?.setShowUpper(upperOn), [upperOn]);
  const prevSelected = useRef(selectedId);
  useEffect(() => {
    const m = modelRef.current;
    if (!m) return;
    m.setSelected(selectedId);
    if (prevSelected.current === selectedId || !selectedId) return;
    prevSelected.current = selectedId;
    // wybór z listy — przełącz tryb, aby element był widoczny
    if (PLAN.find((p) => p.id === selectedId)?.layer === 'gora') setUpperOn(true);
    const vis = m.visibilityOf(selectedId);
    if (vis !== 'oba' && vis !== mode) setMode(vis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (error) return <div className="notice notice-warn">⚠ {error}</div>;

  return (
    <div className="camper3d">
      <div className="camper3d-toolbar">
        <div className="seg-control" role="group" aria-label="Tryb widoku 3D">
          <button className={mode === 'zewnatrz' ? 'active' : ''} aria-pressed={mode === 'zewnatrz'} onClick={() => setMode('zewnatrz')}>
            Z zewnątrz
          </button>
          <button className={mode === 'wnetrze' ? 'active' : ''} aria-pressed={mode === 'wnetrze'} onClick={() => setMode('wnetrze')}>
            Wnętrze (przekrój)
          </button>
        </div>
        <div className="camper3d-presets" role="group" aria-label="Ustawienie kamery">
          {(Object.keys(PRESETS) as Preset[]).map((p) => (
            <button key={p} className="btn btn-small" onClick={() => flyRef.current(p)}>
              {PRESETS[p].label}
            </button>
          ))}
        </div>
      </div>
      <div className="camper3d-canvas" ref={hostRef}>
        {hover && (
          <div className="camper3d-tip" style={{ left: hover.x + 14, top: hover.y + 10 }}>
            {labelOf(hover.id)}
          </div>
        )}
      </div>
      <div className="camper3d-options">
        {mode === 'wnetrze' && (
          <label className="check">
            <input type="checkbox" checked={upperOn} onChange={(e) => setUpperOn(e.target.checked)} />
            Alkowa i szafki górne
          </label>
        )}
        <label className="check">
          <input type="checkbox" checked={markersOn} onChange={(e) => setMarkersOn(e.target.checked)} />
          Pokaż znaczniki <span className="q-dot">?</span> przy elementach niepotwierdzonych
        </label>
        <label className="check">
          <input type="checkbox" checked={bikesOn} onChange={(e) => setBikesOn(e.target.checked)} />
          Rowery na bagażniku (poglądowo)
        </label>
      </div>
      <p className="form-hint">
        Obracaj: przeciągnij · Przybliżaj: kółko myszy / dwa palce · Przesuwaj: prawy przycisk · Kliknij element, aby
        zobaczyć informacje.
      </p>
    </div>
  );
}
