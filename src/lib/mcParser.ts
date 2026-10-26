// Robust Minecraft Color & Formatting Code Parser
// Supports &0-&9, &a-&f, &k &l &m &n &o &r, § section codes, &#RRGGBB, and bare #RRGGBB.

export interface ParsedMcSegment {
  text: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underlined: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
}

export const MC_COLOR_MAP: Record<string, string> = {
  '0': '#000000',
  '1': '#0000AA',
  '2': '#00AA00',
  '3': '#00AAAA',
  '4': '#AA0000',
  '5': '#AA00AA',
  '6': '#FFAA00',
  '7': '#AAAAAA',
  '8': '#555555',
  '9': '#5555FF',
  a: '#55FF55',
  b: '#55FFFF',
  c: '#FF5555',
  d: '#FF55FF',
  e: '#FFFF55',
  f: '#FFFFFF',
};

export function parseMinecraftText(
  rawInput: string,
  nicknameReplacement?: string,
  defaultColor = '#FFFFFF'
): ParsedMcSegment[] {
  if (!rawInput) return [];

  const effectiveNick = (nicknameReplacement || '').trim() || 'Yourname';
  const input = rawInput.replace(/Yourname/gi, effectiveNick);

  const segments: ParsedMcSegment[] = [];
  let currentColor = defaultColor;
  let bold = false;
  let italic = false;
  let underlined = false;
  let strikethrough = false;
  let obfuscated = false;
  let buffer = '';

  const flush = () => {
    if (buffer.length > 0) {
      segments.push({
        text: buffer,
        color: currentColor,
        bold,
        italic,
        underlined,
        strikethrough,
        obfuscated,
      });
      buffer = '';
    }
  };

  let i = 0;
  while (i < input.length) {
    // 1. Check for &#RRGGBB or §#RRGGBB
    if (
      (input[i] === '&' || input[i] === '§') &&
      input[i + 1] === '#' &&
      /^[0-9a-fA-F]{6}/.test(input.slice(i + 2, i + 8))
    ) {
      flush();
      currentColor = `#${input.slice(i + 2, i + 8).toUpperCase()}`;
      bold = false;
      italic = false;
      underlined = false;
      strikethrough = false;
      obfuscated = false;
      i += 8;
      continue;
    }

    // 2. Check for bare #RRGGBB
    if (input[i] === '#' && /^[0-9a-fA-F]{6}/.test(input.slice(i + 1, i + 7))) {
      flush();
      currentColor = `#${input.slice(i + 1, i + 7).toUpperCase()}`;
      i += 7;
      // If followed by a single space right after a leading hex tag like "#25FF57 EMERALD", skip that space only if buffer is empty and segments is empty
      if (segments.length === 0 && input[i] === ' ') {
        i += 1;
      }
      continue;
    }

    // 3. Check for standard &x or §x code
    if ((input[i] === '&' || input[i] === '§') && i + 1 < input.length) {
      const code = input[i + 1].toLowerCase();
      if (MC_COLOR_MAP[code]) {
        flush();
        currentColor = MC_COLOR_MAP[code];
        bold = false;
        italic = false;
        underlined = false;
        strikethrough = false;
        obfuscated = false;
        i += 2;
        continue;
      }
      if (code === 'l') {
        flush();
        bold = true;
        i += 2;
        continue;
      }
      if (code === 'o') {
        flush();
        italic = true;
        i += 2;
        continue;
      }
      if (code === 'n') {
        flush();
        underlined = true;
        i += 2;
        continue;
      }
      if (code === 'm') {
        flush();
        strikethrough = true;
        i += 2;
        continue;
      }
      if (code === 'k') {
        flush();
        obfuscated = true;
        i += 2;
        continue;
      }
      if (code === 'r') {
        flush();
        currentColor = defaultColor;
        bold = false;
        italic = false;
        underlined = false;
        strikethrough = false;
        obfuscated = false;
        i += 2;
        continue;
      }
    }

    buffer += input[i];
    i++;
  }

  flush();
  return segments;
}

export function darkenHex(hex: string, factor = 0.25): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#000000';
  const r = Math.max(0, Math.floor(parseInt(clean.slice(0, 2), 16) * factor));
  const g = Math.max(0, Math.floor(parseInt(clean.slice(2, 4), 16) * factor));
  const b = Math.max(0, Math.floor(parseInt(clean.slice(4, 6), 16) * factor));
  return `rgb(${r}, ${g}, ${b})`;
}
