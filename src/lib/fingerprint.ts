let cached: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cached) return cached;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    navigator.maxTouchPoints || 0,
    getCanvasFingerprint(),
    getWebGLFingerprint(),
  ];

  const raw = components.join('|||');
  const hash = await sha256(raw);
  cached = hash;
  return hash;
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('fingerprint', 4, 17);
    return canvas.toDataURL();
  } catch {
    return '';
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const g = gl as WebGLRenderingContext;
    const debugInfo = g.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    return [
      g.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      g.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    ].join('|');
  } catch {
    return '';
  }
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
