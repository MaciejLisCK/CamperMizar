import * as THREE from 'three';

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Deterministyczny generator liczb pseudolosowych — tekstury wyglądają tak samo przy każdym renderze. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const LIVERY_RANGE = { x0: -0.1, x1: 5.2, y0: 0, y1: 2.9 };

/**
 * Oklejenie boku zabudowy wg zdjęć egzemplarza z ogłoszenia: kremowy kolor,
 * dolny pas w odcieniach brązu z poziomym przetłoczeniem, cienki pas pod dachem.
 * Współrzędne płótna odpowiadają współrzędnym profilu (metry).
 */
export function sideLiveryTexture(): THREE.CanvasTexture {
  const { x0, x1, y0, y1 } = LIVERY_RANGE;
  const W = 2048;
  const H = Math.round((W * (y1 - y0)) / (x1 - x0));
  const t = canvasTexture(W, H, (ctx) => {
    const row = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
    ctx.fillStyle = '#e4d8bb';
    ctx.fillRect(0, 0, W, H);
    // dolny pas — przetłaczana blacha w kolorze brązowym
    const band = (ya: number, yb: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, row(yb), W, row(ya) - row(yb));
    };
    band(0.3, 1.1, '#9a805f');
    band(0.3, 0.62, '#6e5843');
    band(1.1, 1.16, '#c2a982');
    band(1.18, 1.2, '#9a805f');
    // przetłoczenia
    ctx.globalAlpha = 0.18;
    for (let y = 0.32; y < 1.1; y += 0.035) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, row(y), W, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, row(y) + 2, W, 1);
    }
    ctx.globalAlpha = 1;
    // pas pod dachem
    band(2.6, 2.64, '#b59a75');
    band(2.66, 2.67, '#8d7457');
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1 / (x1 - x0), 1 / (y1 - y0));
  t.offset.set(-x0 / (x1 - x0), -y0 / (y1 - y0));
  return t;
}

/** Tylna ściana: kolorystyka i napis jak na zdjęciach egzemplarza referencyjnego. */
export function rearLiveryTexture(): THREE.CanvasTexture {
  return canvasTexture(1024, 1024, (ctx, W, H) => {
    // płaszczyzna: szerokość 2.3 m, wysokość od 0.3 do 2.75 m
    const row = (y: number) => H - ((y - 0.3) / 2.45) * H;
    ctx.fillStyle = '#e4d8bb';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#9a805f';
    ctx.fillRect(0, row(1.1), W, row(0.3) - row(1.1));
    ctx.fillStyle = '#6e5843';
    ctx.fillRect(0, row(0.6), W, row(0.3) - row(0.6));
    ctx.globalAlpha = 0.18;
    for (let y = 0.32; y < 1.1; y += 0.035) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, row(y), W, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#c2a982';
    ctx.fillRect(0, row(1.16), W, row(1.1) - row(1.16));
    // napis
    ctx.fillStyle = '#1f7f86';
    ctx.font = 'italic bold 78px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mizar', W / 2 + 30, row(2.48));
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('140', W / 2 + 230, row(2.55));
    ctx.font = 'italic 40px Georgia, serif';
    ctx.fillStyle = '#2b2b2b';
    ctx.fillText('Gabbiano', W / 2 + 60, row(2.6));
    // pasek kolorowy przy napisie
    ['#e0a43a', '#3aa0a8', '#c86a3a'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(W / 2 - 300 + i * 26, row(2.62), 16, 70);
    });
    // kratki wentylacyjne
    ctx.fillStyle = '#d8ceb6';
    ctx.fillRect(W / 2 - 60, row(1.5), 140, 50);
    ctx.fillRect(W / 2 - 60, row(0.86), 140, 50);
    ctx.fillStyle = '#9d927c';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(W / 2 - 54, row(1.5) + 6 + i * 7, 128, 3);
      ctx.fillRect(W / 2 - 54, row(0.86) + 6 + i * 7, 128, 3);
    }
  });
}

export function woodTexture(base = '#c99c62', seed = 7): THREE.CanvasTexture {
  const r = rng(seed);
  return canvasTexture(512, 512, (ctx, W, H) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      const y = r() * H;
      ctx.strokeStyle = `rgba(110, 70, 30, ${0.05 + r() * 0.12})`;
      ctx.lineWidth = 1 + r() * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) ctx.lineTo(x, y + Math.sin(x / 60 + i) * 4 + (r() - 0.5) * 3);
      ctx.stroke();
    }
  });
}

/** Drzwiczki z żaluzjami — jak na zdjęciach wnętrza egzemplarza referencyjnego. */
export function louverTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 512, (ctx, W, H) => {
    ctx.fillStyle = '#c99c62';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a77a45';
    ctx.fillRect(0, 0, W, 18);
    ctx.fillRect(0, H - 18, W, 18);
    ctx.fillRect(0, 0, 18, H);
    ctx.fillRect(W - 18, 0, 18, H);
    for (let y = 30; y < H - 24; y += 14) {
      ctx.fillStyle = 'rgba(80, 50, 20, 0.45)';
      ctx.fillRect(24, y, W - 48, 4);
      ctx.fillStyle = 'rgba(255, 230, 190, 0.35)';
      ctx.fillRect(24, y + 4, W - 48, 2);
    }
  });
}

/** Tapicerka: niebiesko-beżowy wzór kwiatowy (wg zdjęć egzemplarza referencyjnego). */
export function upholsteryTexture(): THREE.CanvasTexture {
  const r = rng(42);
  const t = canvasTexture(512, 512, (ctx, W, H) => {
    ctx.fillStyle = '#d9c7a3';
    ctx.fillRect(0, 0, W, H);
    const colors = ['#2c4c86', '#3b6aa8', '#1f3563', '#b2643a', '#e8dcc2', '#5b86b8'];
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = colors[Math.floor(r() * colors.length)];
      ctx.globalAlpha = 0.55 + r() * 0.45;
      ctx.beginPath();
      const x = r() * W;
      const y = r() * H;
      const rad = 6 + r() * 26;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r();
        ctx.ellipse(x + Math.cos(a) * rad * 0.6, y + Math.sin(a) * rad * 0.6, rad * 0.55, rad * 0.3, a, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

export function checkFabricTexture(): THREE.CanvasTexture {
  const t = canvasTexture(256, 256, (ctx, W, H) => {
    ctx.fillStyle = '#6a6c70';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < W; i += 16) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(i, 0, 6, H);
      ctx.fillRect(0, i, W, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(i + 8, 0, 2, H);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export function solarTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 512, (ctx, W, H) => {
    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200, 215, 240, 0.35)';
    ctx.lineWidth = 3;
    const n = 6;
    for (let i = 1; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo((i * W) / n, 0);
      ctx.lineTo((i * W) / n, H);
      ctx.moveTo(0, (i * H) / (n * 1.6));
      ctx.lineTo(W, (i * H) / (n * 1.6));
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200, 215, 240, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  });
}

export function floorTexture(): THREE.CanvasTexture {
  const r = rng(3);
  const t = canvasTexture(512, 512, (ctx, W, H) => {
    ctx.fillStyle = '#b7a587';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(90, 70, 40, ${0.05 + r() * 0.08})`;
      ctx.fillRect(0, (i * H) / 8, W, H / 8 - 3);
      ctx.fillStyle = 'rgba(60,40,20,0.3)';
      ctx.fillRect(0, (i * H) / 8 - 2, W, 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

export function questionSpriteTexture(): THREE.CanvasTexture {
  return canvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = '#e69f00';
    ctx.strokeStyle = '#1d1d1b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1d1d1b';
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 64, 70);
  });
}
