import * as THREE from 'three';

export type BlockTextureId =
  | 'grass_top'
  | 'grass_side'
  | 'dirt'
  | 'stone'
  | 'cobblestone'
  | 'oak_planks'
  | 'obsidian'
  | 'crying_obsidian'
  | 'gold_block'
  | 'emerald_block'
  | 'amethyst_block'
  | 'sapphire_block'
  | 'ruby_block'
  | 'command_block'
  | 'glass'
  | 'chest'
  | 'nether_bricks'
  | 'end_stone'
  | 'prismarine';

const dataUrlCache = new Map<string, string>();
const threeTextureCache = new Map<string, THREE.CanvasTexture>();

// Deterministic PRNG for procedural pixel textures
function hash2D(x: number, y: number, seed: number): number {
  let n = x * 374761393 + y * 668265263 + seed * 1442695041;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function drawBlockPixels(ctx: CanvasRenderingContext2D, id: BlockTextureId) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = hash2D(x, y, id.length * 17);
      let color = '#808080';

      switch (id) {
        case 'dirt': {
          const shades = ['#593d29', '#6b4930', '#4d3321', '#785237'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
        case 'grass_top': {
          const shades = ['#4b912d', '#58a636', '#3f7d24', '#63b53e'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
        case 'grass_side': {
          const grassDepth = 2 + Math.floor(hash2D(x, 0, 99) * 3);
          if (y < grassDepth) {
            const gShades = ['#4b912d', '#58a636', '#3f7d24'];
            color = gShades[Math.floor(r * gShades.length)];
          } else {
            const dShades = ['#593d29', '#6b4930', '#4d3321', '#785237'];
            color = dShades[Math.floor(r * dShades.length)];
          }
          break;
        }
        case 'stone': {
          const shades = ['#737373', '#808080', '#666666', '#8a8a8a'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
        case 'cobblestone': {
          const isEdge = (x + y * 3) % 5 === 0 || (x * 2 - y) % 6 === 0;
          color = isEdge
            ? '#3b3b3b'
            : r > 0.6
            ? '#8c8c8c'
            : r > 0.25
            ? '#6e6e6e'
            : '#545454';
          break;
        }
        case 'oak_planks': {
          const plankRow = y % 4 === 0;
          const vertJoint = (x === 7 && y < 8) || (x === 13 && y >= 8);
          if (plankRow || vertJoint) {
            color = '#6e502b';
          } else {
            color = r > 0.5 ? '#a87e49' : '#966f3e';
          }
          break;
        }
        case 'obsidian': {
          const shades = ['#100c1c', '#18122b', '#0a0712', '#261c42'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
        case 'crying_obsidian': {
          const isCryingVein = r > 0.78;
          if (isCryingVein) {
            color = r > 0.9 ? '#d870ff' : '#8c25ff';
          } else {
            const shades = ['#100c1c', '#18122b', '#090612', '#23183d'];
            color = shades[Math.floor(r * shades.length)];
          }
          break;
        }
        case 'gold_block': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const innerHighlight = x === 1 || y === 1;
          const diag = (x + y) % 6 === 0;
          color = border
            ? '#b87700'
            : innerHighlight || diag
            ? '#fff066'
            : r > 0.4
            ? '#ffcc00'
            : '#e6ac00';
          break;
        }
        case 'emerald_block': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const bevel = x === 2 || y === 2 || x === 13 || y === 13;
          color = border
            ? '#0c7a27'
            : bevel
            ? '#6bff8f'
            : r > 0.45
            ? '#25FF57'
            : '#14c93e';
          break;
        }
        case 'amethyst_block': {
          const crystal = (x * 3 + y * 2) % 7 === 0;
          color = crystal
            ? '#d1bdff'
            : r > 0.65
            ? '#a385ff'
            : r > 0.3
            ? '#8C6CFF'
            : '#5c3dc4';
          break;
        }
        case 'sapphire_block': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const shine = (x + y) % 7 === 0;
          color = border
            ? '#004899'
            : shine
            ? '#6ec2ff'
            : r > 0.45
            ? '#008DFF'
            : '#006bd6';
          break;
        }
        case 'ruby_block': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const shine = (x - y + 16) % 6 === 0;
          color = border
            ? '#800000'
            : shine
            ? '#ff7373'
            : r > 0.45
            ? '#FF0000'
            : '#cc0000';
          break;
        }
        case 'command_block': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const centerPanel = x >= 4 && x <= 11 && y >= 4 && y <= 11;
          const coreLight = x >= 6 && x <= 9 && y >= 6 && y <= 9;
          if (coreLight) {
            color = (x + y) % 2 === 0 ? '#70ff94' : '#ff9d5c';
          } else if (centerPanel) {
            color = '#525966';
          } else if (border) {
            color = '#7a4528';
          } else {
            color = r > 0.5 ? '#c77c52' : '#ab6641';
          }
          break;
        }
        case 'glass': {
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          const streak = (x === 3 && y >= 3 && y <= 6) || (x >= 3 && x <= 6 && y === 3);
          if (border || streak) {
            ctx.fillStyle = '#d4f6ff';
            ctx.fillRect(x, y, 1, 1);
          } else {
            ctx.fillStyle = 'rgba(180, 235, 255, 0.14)';
            ctx.fillRect(x, y, 1, 1);
          }
          continue;
        }
        case 'chest': {
          const rim = y === 5;
          const latch = x >= 7 && x <= 8 && y >= 4 && y <= 7;
          const border = x === 0 || y === 0 || x === 15 || y === 15;
          if (latch) color = '#ffd83d';
          else if (rim || border) color = '#2b1b0e';
          else color = r > 0.5 ? '#a66d29' : '#8f5b1e';
          break;
        }
        case 'nether_bricks': {
          const mortar = y % 4 === 0 || (x + (Math.floor(y / 4) % 2) * 4) % 8 === 0;
          color = mortar ? '#1c0b10' : r > 0.5 ? '#3d1822' : '#2e1119';
          break;
        }
        case 'end_stone': {
          const shades = ['#d9de9e', '#c5cb8a', '#e5eab0', '#aeb574'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
        case 'prismarine': {
          const shades = ['#478c7b', '#5bb09c', '#367062', '#70c4b0'];
          color = shades[Math.floor(r * shades.length)];
          break;
        }
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function getBlockTextureDataUrl(id: BlockTextureId): string {
  if (dataUrlCache.has(id)) return dataUrlCache.get(id)!;
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawBlockPixels(ctx, id);
  }
  const url = canvas.toDataURL('image/png');
  dataUrlCache.set(id, url);
  return url;
}

export function getBlockThreeTexture(id: BlockTextureId): THREE.CanvasTexture {
  if (threeTextureCache.has(id)) return threeTextureCache.get(id)!;
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawBlockPixels(ctx, id);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  threeTextureCache.set(id, tex);
  return tex;
}

// Crack Stage Overlay (0-9) for OneBlock mining interaction
export function getCrackStageDataUrl(stage: number): string {
  const clamped = Math.max(0, Math.min(9, Math.floor(stage)));
  const key = `crack_${clamped}`;
  if (dataUrlCache.has(key)) return dataUrlCache.get(key)!;
  if (typeof document === 'undefined' || clamped === 0) return '';

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    const branches = clamped + 2;
    for (let b = 0; b < branches; b++) {
      let cx = 8;
      let cy = 8;
      const angle = (b / branches) * Math.PI * 2 + 0.4;
      const len = Math.min(8, Math.ceil((clamped / 9) * 9));
      for (let step = 0; step < len; step++) {
        cx += Math.round(Math.cos(angle + (step % 2) * 0.4));
        cy += Math.round(Math.sin(angle - (step % 2) * 0.4));
        if (cx >= 0 && cx < 16 && cy >= 0 && cy < 16) {
          ctx.fillRect(cx, cy, 1, 1);
        }
      }
    }
  }
  const url = canvas.toDataURL('image/png');
  dataUrlCache.set(key, url);
  return url;
}

// 64x64 Procedural Server-List Icon
export function getServerIconDataUrl(): string {
  const key = 'server_icon_64';
  if (dataUrlCache.has(key)) return dataUrlCache.get(key)!;
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawBlockPixels(ctx, 'obsidian');
    // Draw emerald + ruby pixel lightning bolt & heart crest
    ctx.fillStyle = '#25FF57';
    ctx.fillRect(1, 1, 14, 1);
    ctx.fillRect(1, 14, 14, 1);
    ctx.fillRect(1, 1, 1, 14);
    ctx.fillRect(14, 1, 1, 14);

    // Pixel heart / bolt in center
    const heart = [
      '0011001100',
      '0122112210',
      '1222222221',
      '1222332221',
      '0123332210',
      '0012322100',
      '0001221000',
      '0000110000',
    ];
    for (let y = 0; y < heart.length; y++) {
      for (let x = 0; x < heart[y].length; x++) {
        const ch = heart[y][x];
        if (ch === '1') ctx.fillStyle = '#990000';
        else if (ch === '2') ctx.fillStyle = '#FF0000';
        else if (ch === '3') ctx.fillStyle = '#FFFF55';
        else continue;
        ctx.fillRect(x + 3, y + 4, 1, 1);
      }
    }
  }
  const url = canvas.toDataURL('image/png');
  dataUrlCache.set(key, url);
  return url;
}

export const getBlockDataUrl = getBlockTextureDataUrl;
export const generateServerIconDataUrl = getServerIconDataUrl;

