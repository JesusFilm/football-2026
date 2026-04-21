/**
 * Visual-only pseudo-QR: produces a deterministic-looking matrix from a URL,
 * with real finder + timing patterns so the output reads as a QR code. For
 * production, swap in a genuine encoder (e.g. qrcode, qr-code-generator).
 * Ported from the handoff prototype's qr.js.
 */

const MATRIX_SIZE = 33;

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed: number): () => number {
  return function rng() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeMatrix(text: string): boolean[][] {
  const size = MATRIX_SIZE;
  const m: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );
  const rand = mulberry(hash(text));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      m[r][c] = rand() > 0.5;
    }
  }

  const finder = (rr: number, cc: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = rr + dr;
        const c = cc + dc;
        if (r < 0 || c < 0 || r >= size || c >= size) continue;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        const quiet = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        m[r][c] = quiet ? false : onBorder || inner;
      }
    }
  };

  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }

  const a = size - 9;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = a + dr;
      const c = a + dc;
      if (r < 0 || c < 0 || r >= size || c >= size) continue;
      const onBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
      const center = dr === 0 && dc === 0;
      m[r][c] = onBorder || center;
    }
  }

  return m;
}

export function renderQrSvg(text: string, size: number): string {
  const m = makeMatrix(text);
  const n = m.length;
  const cell = Math.floor((size - 8) / n);
  const pad = Math.floor((size - cell * n) / 2);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="#fff"/>`;
  svg += `<g fill="#0a0806">`;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (m[r][c]) {
        svg += `<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell}" height="${cell}"/>`;
      }
    }
  }
  svg += `</g></svg>`;
  return svg;
}
