// Generates deterministic, sharp 8x8 pixel-art Minecraft-style voxel head SVG data URLs
// Used as an instant zero-latency fallback or when mc-heads.net is unreachable.

export function generateVoxelHeadSvgDataUrl(nickname: string, accentHex = '#ff2a1f'): string {
  const clean = (nickname || 'PULSE').trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }

  const skinTones = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
  const hairColors = ['#181224', '#2c1b18', '#4a2e1b', '#ff2a1f', '#ffb000', '#00e5ff', '#d4ff00'];
  const skin = skinTones[Math.abs(hash) % skinTones.length];
  const hair = hairColors[Math.abs(hash >> 3) % hairColors.length];
  const eyeColor = accentHex || '#ff2a1f';

  // 8x8 symmetric pixel grid
  const rects: string[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const mirrorX = x < 4 ? x : 7 - x;
      let fill = skin;

      // Hair top & temples
      if (y === 0 || (y === 1 && (mirrorX < 2 || (hash & 1) === 0)) || (y === 2 && mirrorX === 0)) {
        fill = hair;
      }
      // Eyes at row 4
      else if (y === 4 && (mirrorX === 1 || mirrorX === 2)) {
        fill = mirrorX === 1 ? '#ffffff' : eyeColor;
      }
      // Visor / cyber markings on row 3
      else if (y === 3 && mirrorX >= 1 && (hash & 2) !== 0) {
        fill = hair;
      }
      // Mouth / chin shadow
      else if (y === 6 && mirrorX >= 2) {
        fill = '#6b3e26';
      }

      rects.push(`<rect x="${x * 16}" y="${y * 16}" width="16" height="16" fill="${fill}" />`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" shape-rendering="crispEdges">${rects.join('')}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
