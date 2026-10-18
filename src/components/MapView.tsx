import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, type ReactNode } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Krótki symbol/tekst wewnątrz znacznika (nie polegamy na kolorze) */
  symbol: string;
  className?: string;
  title: string;
  popup?: ReactNode;
  permanentLabel?: boolean;
}

export interface MapLine {
  id: string;
  points: [number, number][];
  dashed?: boolean;
  className?: string;
  label?: string;
}

interface Props {
  markers?: MapMarker[];
  lines?: MapLine[];
  height?: number | string;
  onPick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

function PickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapView({ markers = [], lines = [], height = 360, onPick, center, zoom }: Props) {
  const points = useMemo<[number, number][]>(
    () => [...markers.map((m) => [m.lat, m.lng] as [number, number]), ...lines.flatMap((l) => l.points)],
    [markers, lines],
  );

  return (
    <div className={`map-wrap${onPick ? ' map-pick' : ''}`} style={{ height }}>
      <MapContainer center={center ?? [50.5, 20]} zoom={zoom ?? 6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!center && <FitBounds points={points} />}
        {onPick && <PickHandler onPick={onPick} />}
        {lines.map((l) => (
          <Polyline
            key={l.id}
            positions={l.points}
            pathOptions={{ className: l.className ?? 'route-line', dashArray: l.dashed ? '8 8' : undefined, weight: 4 }}
          >
            {l.label && <Tooltip sticky>{l.label}</Tooltip>}
          </Polyline>
        ))}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            title={m.title}
            icon={L.divIcon({
              className: '',
              html: `<div class="map-pin ${m.className ?? ''}" aria-label="${m.title}">${m.symbol}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
          >
            {m.permanentLabel && (
              <Tooltip permanent direction="right" offset={[14, 0]} className="map-label">
                {m.title}
              </Tooltip>
            )}
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
