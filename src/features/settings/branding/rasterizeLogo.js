// Turns a user-selected image into a small data URL accepted by PUT /api/branding/logo:
// fitted within 256x256 (aspect kept, transparent background), WebP when the browser
// can encode it, PNG otherwise. SVG files are rasterized too; raw SVG is never stored.

export const LOGO_MAX_DIMENSION = 256;
export const LOGO_MAX_BYTES = 46 * 1024; // Backend limit (fits the TEXT column).
export const LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const WEBP_QUALITIES = [0.92, 0.82, 0.7, 0.55];
const MIN_DIMENSION = 64;

function logoError(message) {
  const error = new Error(message);
  error.isLogoError = true;
  return error;
}

const EXTENSION_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };

// Some systems report an empty MIME type (notably for SVG); fall back to the extension.
function fileType(file) {
  if (file.type) return file.type;
  const extension = String(file.name || '').split('.').pop().toLowerCase();
  return EXTENSION_TYPES[extension] || '';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(logoError('No fue posible leer la imagen. Verifica que el archivo no esté dañado.'));
    };
    image.src = url;
  });
}

function decodedBytes(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function sourceSize(image, isSvg) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  // SVG without intrinsic size: render it as a square.
  if (!width || !height) {
    if (isSvg) return { width: LOGO_MAX_DIMENSION, height: LOGO_MAX_DIMENSION };
    throw logoError('La imagen no tiene dimensiones válidas.');
  }
  return { width, height };
}

function render(image, source, maxDimension, allowUpscale) {
  const ratio = Math.min(maxDimension / source.width, maxDimension / source.height);
  const scale = allowUpscale ? ratio : Math.min(1, ratio);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw logoError('Este navegador no permite procesar imágenes.');
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function encode(canvas, quality) {
  try {
    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/png');
  } catch {
    // Tainted canvas (e.g. an SVG referencing external resources).
    throw logoError('No fue posible procesar la imagen. Si es un SVG, exporta el logo como PNG e inténtalo de nuevo.');
  }
}

export async function rasterizeLogo(file) {
  if (!file) throw logoError('Selecciona una imagen.');
  const type = fileType(file);
  if (!LOGO_ACCEPTED_TYPES.includes(type)) {
    throw logoError('Formato no admitido. Usa PNG, JPEG, WebP o SVG.');
  }
  if (file.size > MAX_SOURCE_BYTES) throw logoError('La imagen supera los 10 MB.');

  const isSvg = type === 'image/svg+xml';
  // An SVG blob without its MIME type does not decode as an image.
  const image = await loadImage(file.type ? file : new Blob([file], { type }));
  const source = sourceSize(image, isSvg);

  for (let dimension = LOGO_MAX_DIMENSION; dimension >= MIN_DIMENSION; dimension = Math.floor(dimension * 0.8)) {
    const canvas = render(image, source, dimension, isSvg);
    for (const quality of WEBP_QUALITIES) {
      const dataUrl = encode(canvas, quality);
      if (decodedBytes(dataUrl) <= LOGO_MAX_BYTES) return dataUrl;
      // PNG ignores quality: only a smaller size can help.
      if (!dataUrl.startsWith('data:image/webp')) break;
    }
  }
  throw logoError('No fue posible reducir la imagen por debajo de 46 KB. Usa un logo más simple.');
}
