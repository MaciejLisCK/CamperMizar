import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notice } from '../components/Badges';
import JournalEntryView from '../components/JournalEntryView';
import MapView from '../components/MapView';
import { currentStay, useStore } from '../data/store';
import type { JournalEntry, Photo } from '../data/types';
import { todayISO, uid } from '../lib/dates';

/** Zmniejsza zdjęcie, aby zmieściło się w pamięci przeglądarki (prototyp nie ma serwera na pliki). */
function resizeImage(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Nie można odczytać obrazu'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function JournalEditorPage() {
  const { data, update } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'edycja' | 'podglad'>('edycja');
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry>(() => ({
    id: uid(),
    date: todayISO(),
    title: '',
    text: '',
    placeName: '',
    lat: null,
    lng: null,
    photos: [],
    demo: false,
  }));
  const [status, setStatus] = useState({ where: data.status.where, plans: data.status.plans, update: false });

  const stay = currentStay(data.stays);

  async function addPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    try {
      const photos: Photo[] = [];
      for (const f of files) photos.push({ src: await resizeImage(f), caption: '', demo: false });
      setEntry((en) => ({ ...en, photos: [...en.photos, ...photos] }));
    } catch {
      setError('Nie udało się wczytać jednego ze zdjęć.');
    }
  }

  function setCaption(i: number, caption: string) {
    setEntry((en) => ({ ...en, photos: en.photos.map((p, j) => (j === i ? { ...p, caption } : p)) }));
  }

  function removePhoto(i: number) {
    setEntry((en) => ({ ...en, photos: en.photos.filter((_, j) => j !== i) }));
  }

  function validate(): boolean {
    if (!entry.title.trim()) {
      setError('Podaj tytuł wpisu.');
      return false;
    }
    setError(null);
    return true;
  }

  function publish(e?: FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    update((d) => ({
      ...d,
      journal: [...d.journal, { ...entry, title: entry.title.trim() }],
      status: status.update ? { where: status.where, plans: status.plans, updatedAt: new Date().toISOString(), demo: false } : d.status,
    }));
    navigate('/');
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Nowy wpis w dzienniku</h1>
        <div className="seg-control" role="group" aria-label="Tryb">
          <button className={mode === 'edycja' ? 'active' : ''} aria-pressed={mode === 'edycja'} onClick={() => setMode('edycja')}>
            ✎ Edycja
          </button>
          <button
            className={mode === 'podglad' ? 'active' : ''}
            aria-pressed={mode === 'podglad'}
            onClick={() => validate() && setMode('podglad')}
          >
            👁 Podgląd
          </button>
        </div>
      </div>

      {mode === 'edycja' ? (
        <form className="card form" onSubmit={(e) => { e.preventDefault(); if (validate()) setMode('podglad'); }}>
          <div className="form-row">
            <label>
              Dzień
              <input type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} />
            </label>
            <label className="grow">
              Tytuł
              <input value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} />
            </label>
          </div>
          <label>
            Opis — odwiedzone miejsca, aktywności
            <textarea rows={6} value={entry.text} onChange={(e) => setEntry({ ...entry, text: e.target.value })} />
          </label>

          <fieldset>
            <legend>Zdjęcia</legend>
            <input type="file" accept="image/*" multiple onChange={addPhotos} />
            <p className="form-hint">Prototyp zmniejsza zdjęcia i trzyma je tylko w tej przeglądarce. Filmy nie są obsługiwane.</p>
            <div className="photo-edit-list">
              {entry.photos.map((p, i) => (
                <div key={i} className="photo-edit">
                  <img src={p.src} alt="" />
                  <input placeholder="Podpis zdjęcia" value={p.caption} onChange={(e) => setCaption(i, e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => removePhoto(i)}>
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Lokalizacja (widoczna dla odbiorców)</legend>
            <div className="form-row">
              <label className="grow">
                Nazwa miejsca
                <input value={entry.placeName} onChange={(e) => setEntry({ ...entry, placeName: e.target.value })} />
              </label>
              {stay && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEntry({ ...entry, lat: stay.lat, lng: stay.lng, placeName: entry.placeName || stay.name })}
                >
                  Użyj obecnego kempingu
                </button>
              )}
              {entry.lat !== null && (
                <button type="button" className="btn btn-ghost" onClick={() => setEntry({ ...entry, lat: null, lng: null })}>
                  Bez lokalizacji
                </button>
              )}
            </div>
            <MapView
              height={260}
              onPick={(lat, lng) => setEntry((en) => ({ ...en, lat, lng }))}
              center={entry.lat === null ? [50, 19.9] : undefined}
              zoom={6}
              markers={entry.lat !== null ? [{ id: 'e', lat: entry.lat, lng: entry.lng!, symbol: '📍', className: 'pin-target', title: 'Lokalizacja wpisu' }] : []}
            />
          </fieldset>

          <fieldset>
            <legend>Aktualne miejsce pobytu i dalsze plany</legend>
            <label className="check">
              <input type="checkbox" checked={status.update} onChange={(e) => setStatus({ ...status, update: e.target.checked })} />
              Zaktualizuj przy publikacji
            </label>
            {status.update && (
              <>
                <label>
                  Gdzie jesteśmy teraz
                  <textarea rows={2} value={status.where} onChange={(e) => setStatus({ ...status, where: e.target.value })} />
                </label>
                <label>
                  Dalsze plany
                  <textarea rows={2} value={status.plans} onChange={(e) => setStatus({ ...status, plans: e.target.value })} />
                </label>
              </>
            )}
          </fieldset>

          {error && <p className="error-text">✗ {error}</p>}
          <button className="btn btn-primary" type="submit">
            Dalej: podgląd →
          </button>
        </form>
      ) : (
        <>
          <Notice kind="warn">
            <strong>Podgląd.</strong> Tak wpis zobaczą odbiorcy — zdjęcia, opis i lokalizacja
            {entry.lat !== null ? ' (zaznaczona na mapie)' : ' (brak lokalizacji)'}. Wpis nie jest jeszcze opublikowany.
          </Notice>
          <div className="card preview-frame">
            <JournalEntryView entry={entry} showMap />
          </div>
          {status.update && (
            <div className="card">
              <h3>Aktualizacja „Gdzie jesteśmy teraz”</h3>
              <p>{status.where}</p>
              <h3>Dalsze plany</h3>
              <p>{status.plans}</p>
            </div>
          )}
          <div className="actions">
            <button className="btn" onClick={() => setMode('edycja')}>
              ← Wróć do edycji
            </button>
            <button className="btn btn-primary" onClick={() => publish()}>
              Opublikuj wpis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
