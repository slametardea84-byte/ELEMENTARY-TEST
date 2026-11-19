import * as THREE from 'three';

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

export function createAsphaltTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 512);
  ctx.fillStyle = '#2b303a';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle aggregate grain
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 36 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Yellow double center dashed lines along V
  ctx.fillStyle = '#facc15';
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(248, y, 6, 36);
    ctx.fillRect(258, y, 6, 36);
  }

  // White edge lines
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(20, 0, 8, 512);
  ctx.fillRect(484, 0, 8, 512);

  return finalizeTexture(canvas, maxAnisotropy, 1, 8);
}

export function createSidewalkTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 256; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  return finalizeTexture(canvas, maxAnisotropy, 6, 24);
}

export function createGrassTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  ctx.fillStyle = '#3f7d3b';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? '#4d9247' : '#356a31';
    ctx.fillRect(x, y, 3, 3);
  }
  return finalizeTexture(canvas, maxAnisotropy, 24, 24);
}

export function createBuildingFacadeTexture(
  accentHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 512);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal trim
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, 512, 48);
  ctx.fillRect(0, 240, 512, 18);

  // Clean glass windows grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const wx = 44 + col * 112;
      const wy = 80 + row * 135;
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx - 4, wy - 4, 88, 92);
      const grad = ctx.createLinearGradient(wx, wy, wx + 80, wy + 84);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad;
      ctx.fillRect(wx, wy, 80, 84);
    }
  }
  return finalizeTexture(canvas, maxAnisotropy, 1, 1);
}

export function createSignboardTexture(
  title: string,
  subtitle: string,
  bgColor: string,
  borderColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(1024, 256);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 1000, 232);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 54px Outfit, sans-serif';
  ctx.fillText(title, 512, 98);

  ctx.fillStyle = '#fde68a';
  ctx.font = '600 32px Plus Jakarta Sans, sans-serif';
  ctx.fillText(subtitle, 512, 174);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createNameplateTexture(
  name: string,
  className: string,
  level: number,
  progressPct: number,
  isTeacher: boolean
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 160);
  ctx.clearRect(0, 0, 512, 160);

  // Rounded backdrop
  ctx.fillStyle = isTeacher ? 'rgba(124, 45, 18, 0.92)' : 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 136, 22);
  ctx.fill();

  ctx.strokeStyle = isTeacher ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '700 36px Outfit, sans-serif';
  const displayName = isTeacher ? `GURU · ${name}` : name;
  ctx.fillText(displayName.slice(0, 22), 256, 62);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`Kelas ${className} · Lv.${level} · ${Math.round(progressPct)}%`, 256, 112);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createInteriorFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 512);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x * 64, y * 64, 64, 64);
      }
    }
  }
  return finalizeTexture(canvas, maxAnisotropy, 4, 4);
}
