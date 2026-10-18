import type { JournalEntry } from '../data/types';
import { formatWeekday } from '../lib/dates';
import { DemoBadge } from './Badges';
import MapView from './MapView';

/** Wpis dziennika w postaci widocznej dla odbiorców — używany też w podglądzie przed publikacją. */
export default function JournalEntryView({ entry, showMap = false }: { entry: JournalEntry; showMap?: boolean }) {
  return (
    <article className="entry">
      <div className="entry-date">{formatWeekday(entry.date)}</div>
      <h2>
        {entry.title || <em>(bez tytułu)</em>} {entry.demo && <DemoBadge>WPIS PRZYKŁADOWY</DemoBadge>}
      </h2>
      {entry.placeName && (
        <div className="entry-place">
          <span aria-hidden>📍</span> {entry.placeName}
        </div>
      )}
      {entry.text && (
        <div className="entry-text">
          {entry.text.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {entry.photos.length > 0 && (
        <div className={`entry-photos n${Math.min(entry.photos.length, 3)}`}>
          {entry.photos.map((ph, i) => (
            <figure key={i}>
              <img src={ph.src} alt={ph.caption || 'Zdjęcie z podróży'} loading="lazy" />
              {ph.caption && <figcaption>{ph.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {showMap && entry.lat !== null && entry.lng !== null && (
        <MapView height={200} markers={[{ id: entry.id, lat: entry.lat, lng: entry.lng, symbol: '📍', className: 'pin-target', title: entry.placeName || 'Lokalizacja wpisu' }]} />
      )}
    </article>
  );
}
