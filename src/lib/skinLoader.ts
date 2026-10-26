// Live Minecraft Skin Loader by Username with Ordered Proxy Chain, 24h Cache,
// Legacy 64x32 -> 64x64 Upgrade, and Slim (Alex) vs Classic (Steve) Arm Detection.

export interface LoadedSkinResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  isSlim: boolean;
  isFallback: boolean;
  sourceUrl: string;
}

const SKIN_CACHE_PREFIX = 'adrenalinee_skin_v2_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const SKIN_PROXY_CHAIN: Array<(username: string) => string> = [
  (name) => `https://mc-heads.net/skin/${encodeURIComponent(name)}`,
  (name) => `https://minotar.net/skin/${encodeURIComponent(name)}`,
  (name) => `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(name)}`,
];

// Deterministic procedural 64x64 Minecraft skin generator if all network proxies fail
export function createFallbackSkinCanvas(username: string, accentHex = '#25FF57'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const skinColors = ['#f1c27d', '#e0ac69', '#c68642', '#ffdbac'];
  const skin = skinColors[Math.abs(hash) % skinColors.length];
  const hair = (hash & 1) === 0 ? '#181224' : '#362312';
  const outfit = '#151224';
  const pants = '#0d0b18';

  // Head base (0,0 to 32,16)
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, 32, 16);
  // Hair on head top & back & sides
  ctx.fillStyle = hair;
  ctx.fillRect(8, 0, 8, 8); // top
  ctx.fillRect(24, 0, 8, 8); // back
  ctx.fillRect(0, 8, 8, 5); // right
  ctx.fillRect(16, 8, 8, 5); // left
  ctx.fillRect(8, 8, 8, 2); // forehead fringe

  // Eyes on front face (8..15, 8..15)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(9, 12, 1, 1);
  ctx.fillRect(14, 12, 1, 1);
  ctx.fillStyle = accentHex;
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(13, 12, 1, 1);

  // Head overlay layer (hat/headphones at 32,0 to 64,16)
  ctx.fillStyle = accentHex;
  ctx.fillRect(32 + 8, 10, 1, 3);
  ctx.fillRect(32 + 15, 10, 1, 3);

  // Torso (16,16 to 40,32)
  ctx.fillStyle = outfit;
  ctx.fillRect(16, 16, 24, 16);
  // Glowing chest emblem
  ctx.fillStyle = accentHex;
  ctx.fillRect(22, 22, 4, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(23, 23, 2, 2);

  // Right Arm (40,16 to 56,32) & Left Arm (32,48 to 48,64)
  ctx.fillStyle = outfit;
  ctx.fillRect(40, 16, 16, 12);
  ctx.fillRect(32, 48, 16, 12);
  ctx.fillStyle = skin;
  ctx.fillRect(40, 28, 16, 4);
  ctx.fillRect(32, 60, 16, 4);
  // Accent cuffs
  ctx.fillStyle = accentHex;
  ctx.fillRect(40, 27, 16, 1);
  ctx.fillRect(32, 59, 16, 1);

  // Right Leg (0,16 to 16,32) & Left Leg (16,48 to 32,64)
  ctx.fillStyle = pants;
  ctx.fillRect(0, 16, 16, 16);
  ctx.fillRect(16, 48, 16, 16);
  // Boots trim
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 30, 16, 2);
  ctx.fillRect(16, 62, 16, 2);

  return canvas;
}

// Convert legacy 64x32 skin to modern 64x64 layout and detect slim arms
function normalizeSkinTo64x64(img: HTMLImageElement | HTMLCanvasElement): {
  canvas: HTMLCanvasElement;
  isSlim: boolean;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(img, 0, 0);

  // If legacy 64x32 skin, copy right leg to left leg and right arm to left arm
  if (img.height === 32) {
    // Copy Right Leg (0,16,16,16) -> Left Leg (16,48,16,16)
    ctx.drawImage(img, 0, 16, 16, 16, 16, 48, 16, 16);
    // Copy Right Arm (40,16,16,16) -> Left Arm (32,48,16,16)
    ctx.drawImage(img, 40, 16, 16, 16, 32, 48, 16, 16);
  }

  // Auto-detect slim (Alex 3px) vs classic (Steve 4px) arms:
  // In 64x64 skins, pixel (54, 20) is transparent on slim skins and opaque on 4px classic skins.
  const pixel = ctx.getImageData(54, 20, 1, 1).data;
  const isSlim = pixel[3] === 0;

  return { canvas, isSlim };
}

function loadImageFromUrl(url: string, timeoutMs = 4500): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('Image load timeout'));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      if (img.width >= 64 && (img.height === 64 || img.height === 32)) {
        resolve(img);
      } else {
        reject(new Error('Invalid skin dimensions'));
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Image load error'));
    };
    img.src = url;
  });
}

export async function loadMinecraftSkin(
  username: string,
  options?: {
    customSkinUrl?: string;
    slimOverride?: 'auto' | 'slim' | 'classic';
    accentColor?: string;
  }
): Promise<LoadedSkinResult> {
  const cleanName = (username || 'Player').trim();
  const cacheKey = `${SKIN_CACHE_PREFIX}${cleanName.toLowerCase()}`;

  // 1. If admin provided a custom skin URL or uploaded PNG data URL, try that first
  if (options?.customSkinUrl && options.customSkinUrl.trim()) {
    try {
      const img = await loadImageFromUrl(options.customSkinUrl.trim(), 5000);
      const { canvas, isSlim } = normalizeSkinTo64x64(img);
      const finalSlim =
        options.slimOverride === 'slim'
          ? true
          : options.slimOverride === 'classic'
          ? false
          : isSlim;
      return {
        canvas,
        dataUrl: canvas.toDataURL('image/png'),
        isSlim: finalSlim,
        isFallback: false,
        sourceUrl: options.customSkinUrl,
      };
    } catch {
      // fall through to proxy chain
    }
  }

  // 2. Check 24h localStorage cache
  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw) as {
        dataUrl: string;
        isSlim: boolean;
        timestamp: number;
      };
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.dataUrl) {
        const img = await loadImageFromUrl(parsed.dataUrl, 1500);
        const { canvas } = normalizeSkinTo64x64(img);
        const finalSlim =
          options?.slimOverride === 'slim'
            ? true
            : options?.slimOverride === 'classic'
            ? false
            : parsed.isSlim;
        return {
          canvas,
          dataUrl: parsed.dataUrl,
          isSlim: finalSlim,
          isFallback: false,
          sourceUrl: 'cache',
        };
      }
    }
  } catch {
    // ignore cache errors
  }

  // 3. Try Ordered Proxy Chain: 1) mc-heads.net, 2) minotar.net, 3) api.ashcon.app
  for (const buildUrl of SKIN_PROXY_CHAIN) {
    const targetUrl = buildUrl(cleanName);
    try {
      let skinImageUrl = targetUrl;

      // Ashcon returns JSON with textures.skin.url / data
      if (targetUrl.includes('api.ashcon.app')) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) continue;
        const json = await res.json();
        const rawData = json?.textures?.skin?.data;
        const rawUrl = json?.textures?.skin?.url;
        if (rawData) {
          skinImageUrl = `data:image/png;base64,${rawData}`;
        } else if (rawUrl) {
          skinImageUrl = rawUrl;
        } else {
          continue;
        }
      }

      const img = await loadImageFromUrl(skinImageUrl, 4500);
      const { canvas, isSlim } = normalizeSkinTo64x64(img);
      const dataUrl = canvas.toDataURL('image/png');

      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ dataUrl, isSlim, timestamp: Date.now() })
        );
      } catch {
        // ignore quota
      }

      const finalSlim =
        options?.slimOverride === 'slim'
          ? true
          : options?.slimOverride === 'classic'
          ? false
          : isSlim;

      return {
        canvas,
        dataUrl,
        isSlim: finalSlim,
        isFallback: false,
        sourceUrl: targetUrl,
      };
    } catch {
      // continue to next proxy in fallback chain
    }
  }

  // 4. Graceful procedural Steve/Alex fallback if offline or proxies blocked
  const fallbackCanvas = createFallbackSkinCanvas(
    cleanName,
    options?.accentColor || '#25FF57'
  );
  const finalSlim = options?.slimOverride === 'slim';
  return {
    canvas: fallbackCanvas,
    dataUrl: fallbackCanvas.toDataURL('image/png'),
    isSlim: finalSlim,
    isFallback: true,
    sourceUrl: 'fallback',
  };
}

export async function loadStaffSkin(
  username: string,
  customSkinUrl?: string,
  slimOverride?: 'auto' | 'classic' | 'slim'
): Promise<LoadedSkinResult> {
  return loadMinecraftSkin(username, { customSkinUrl, slimOverride });
}

