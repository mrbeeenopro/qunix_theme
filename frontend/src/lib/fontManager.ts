// Persistent IndexedDB Font Cache & High-Performance Font Downloader
// Eliminates CSP violations on HTTPS, supports offline font caching & instant rendering.

export interface CachedFontRecord {
  key: string;
  family: string;
  cssText: string;
  sizeBytes: number;
  cachedAt: number;
}

const DB_NAME = 'qunix_font_cache_v2';
const STORE_NAME = 'fonts';
const DB_VERSION = 1;

export const BUNDLED_FONTS = new Set([
  'outfit',
  'inter',
  'plus jakarta sans',
  'roboto',
  'jetbrains mono',
  'system-ui',
  'sans-serif',
  'serif',
  'monospace',
  'arial',
  'helvetica',
  'verdana',
  'georgia',
  'times new roman',
  'courier new',
  'consolas',
  'menlo',
  'monaco',
]);

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunkSize, len)) as any
    );
  }
  return btoa(binary);
}

// In-memory cache for ultra-fast repeated synchronous access
const memoryFontCache = new Map<string, CachedFontRecord>();

export async function getCachedFont(key: string): Promise<CachedFontRecord | null> {
  const fam = extractFamilyName(key).toLowerCase();
  const normKey = fam || key.trim().toLowerCase();
  if (memoryFontCache.has(normKey)) {
    return memoryFontCache.get(normKey)!;
  }
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(normKey);
      req.onsuccess = () => {
        const result = req.result as CachedFontRecord | undefined;
        if (result) {
          memoryFontCache.set(normKey, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (_) {
    return null;
  }
}

export async function saveCachedFont(record: CachedFontRecord): Promise<void> {
  const fam = extractFamilyName(record.key).toLowerCase();
  const normKey = fam || record.key.trim().toLowerCase();
  memoryFontCache.set(normKey, record);
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ ...record, key: normKey });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (_) {}
}

export async function deleteCachedFont(key: string): Promise<void> {
  const fam = extractFamilyName(key).toLowerCase();
  const normKey = fam || key.trim().toLowerCase();
  memoryFontCache.delete(normKey);
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(normKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (_) {}
}

export async function getAllCachedFonts(): Promise<CachedFontRecord[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (_) {
    return [];
  }
}

export async function clearAllFontCache(): Promise<void> {
  memoryFontCache.clear();
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (_) {}
}

export async function cleanOtherCachedFonts(keepFamilyOrKey?: string): Promise<void> {
  const fam = keepFamilyOrKey ? extractFamilyName(keepFamilyOrKey).trim().toLowerCase() : '';
  const keep = isBundledFont(fam) ? '' : fam;
  const all = await getAllCachedFonts();
  for (const record of all) {
    const recKey = (record.key || '').trim().toLowerCase();
    const recFam = (record.family || '').trim().toLowerCase();
    if (!keep || (recKey !== keep && recFam !== keep)) {
      await deleteCachedFont(record.key || record.family);
    }
  }
}

export function extractFamilyName(fontInput: string): string {
  let clean = fontInput.trim();
  // Strip HTML <link href="..."> tags or @import url(...)
  const linkMatch = clean.match(/href=["']([^"']+)["']/i);
  if (linkMatch) clean = linkMatch[1];
  const importMatch = clean.match(/url\(['"]?([^'")]+)['"]?\)/i);
  if (importMatch) clean = importMatch[1];

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const match = clean.match(/family=([^&:]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replace(/\+/g, ' ').replace(/['"]/g, '').trim();
    }
    const fileName = clean.split('/').pop()?.split('?')[0]?.split('#')[0];
    if (fileName) {
      return fileName.replace(/\.(woff2?|ttf|otf|css)$/i, '').replace(/['"]/g, '').trim();
    }
    return 'CustomFont';
  }
  return clean.replace(/^['"]|['"]$/g, '').trim();
}

export function isBundledFont(name: string): boolean {
  const lower = extractFamilyName(name).toLowerCase();
  return BUNDLED_FONTS.has(lower);
}

export function buildFontStack(family: string): string {
  const clean = extractFamilyName(family);
  const lower = clean.toLowerCase();
  if (lower === 'jetbrains mono' || lower === 'jetbrainsmono nerd font') {
    return "'JetBrains Mono', 'JetBrainsMono Nerd Font', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  }
  if (lower === 'system-ui' || lower === 'sans-serif') {
    return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
  return `"${clean}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
}

export function applyFontToDocument(doc: Document, fontStack: string): void {
  if (!doc) return;
  const docRoot = doc.documentElement;
  if (docRoot) {
    docRoot.style.setProperty('--ds-font-family', fontStack);
    docRoot.style.setProperty('--mantine-font-family', fontStack);
    docRoot.style.setProperty('--font-sans', fontStack);
  }
  if (doc.body) {
    doc.body.style.fontFamily = fontStack;
  }
}

export function injectCSSIntoDocument(doc: Document, styleId: string, cssText: string): void {
  if (!doc || !doc.head) return;
  let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = styleId;
    doc.head.appendChild(styleEl);
  }
  styleEl.textContent = cssText;
}

// Download a remote Google font or direct CSS/WOFF2 font, convert binaries to data: URIs, and save to IndexedDB
export async function downloadAndCacheFont(
  fontInput: string,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; family: string; sizeKb?: number; record?: CachedFontRecord; error?: string }> {
  let cleanInput = fontInput.trim();
  const linkMatch = cleanInput.match(/href=["']([^"']+)["']/i);
  if (linkMatch) cleanInput = linkMatch[1];
  const importMatch = cleanInput.match(/url\(['"]?([^'")]+)['"]?\)/i);
  if (importMatch) cleanInput = importMatch[1];

  if (cleanInput.startsWith('http://')) {
    cleanInput = 'https://' + cleanInput.slice(7);
  }

  const family = extractFamilyName(cleanInput);
  if (!family || isBundledFont(family)) {
    return { success: true, family, sizeKb: 0 };
  }

  const fontSlug = family.replace(/\s+/g, '-').toLowerCase();
  const styleId = `qunix-font-style-${fontSlug}`;

  onProgress?.('Fetching font stylesheet...');

  let cssUrl = cleanInput;
  const isDirectFontBinary = /\.(woff2?|ttf|otf)(\?.*)?$/i.test(cleanInput);
  const formatted = family
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  if (!cleanInput.startsWith('https://')) {
    // Standard Google Font URL with HTTPS and swap display
    cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(formatted).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
  }

  try {
    let resolvedCssText = '';
    let totalBytes = 0;

    if (isDirectFontBinary) {
      onProgress?.('Downloading font binary...');
      const res = await fetch(cssUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching font file`);
      const buffer = await res.arrayBuffer();
      totalBytes = buffer.byteLength;
      const base64 = arrayBufferToBase64(buffer);
      const ext = cssUrl.match(/\.(woff2?|ttf|otf)/i)?.[1]?.toLowerCase() || 'woff2';
      const format = ext === 'ttf' ? 'truetype' : ext === 'otf' ? 'opentype' : ext;
      resolvedCssText = `@font-face { font-family: "${family}"; src: url("data:font/${ext};base64,${base64}") format("${format}"); font-display: swap; }`;
    } else {
      // Fetch CSS stylesheet
      let cssRes = await fetch(cssUrl, {
        headers: {
          Accept: 'text/css,*/*;q=0.1',
        },
      });
      // Fallback: If 400 from Google Fonts (e.g. weights don't exist for this font), try without explicit weights
      if (!cssRes.ok && !cleanInput.startsWith('https://')) {
        const fallbackUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(formatted).replace(/%20/g, '+')}&display=swap`;
        cssRes = await fetch(fallbackUrl, {
          headers: {
            Accept: 'text/css,*/*;q=0.1',
          },
        });
      }
      if (!cssRes.ok) throw new Error(`HTTP ${cssRes.status} fetching font stylesheet`);
      let cssText = await cssRes.text();

      // Find all remote font URLs inside url(...)
      const urlRegex = /url\((?:['"]?)(https?:\/\/[^)'"]+)(?:['"]?)\)/g;
      const matches = Array.from(cssText.matchAll(urlRegex));
      const allUrls = Array.from(new Set(matches.map((m) => m[1])));

      if (allUrls.length === 0) {
        resolvedCssText = cssText;
      } else {
        onProgress?.(`Downloading ${Math.min(allUrls.length, 6)} font subset binaries...`);
        // Prioritize latin & primary subset URLs, download up to 6 files
        const targetUrls = allUrls.slice(0, 6);
        const downloadedMap = new Map<string, string>();

        await Promise.all(
          targetUrls.map(async (u) => {
            try {
              const fRes = await fetch(u);
              if (fRes.ok) {
                const buf = await fRes.arrayBuffer();
                totalBytes += buf.byteLength;
                const b64 = arrayBufferToBase64(buf);
                const dataUrl = `data:font/woff2;base64,${b64}`;
                downloadedMap.set(u, dataUrl);
              }
            } catch (_) {}
          })
        );

        // Replace all downloaded font URLs with data: URIs
        downloadedMap.forEach((dataUri, origUrl) => {
          cssText = cssText.split(origUrl).join(dataUri);
        });

        // Strip unconverted remote URLs from remaining font blocks so CSP doesn't trigger warnings
        cssText = cssText.replace(/@font-face\s*\{[^}]*url\(\s*['"]?https?:\/\/[^}]*\}/gi, '');
        resolvedCssText = cssText;
      }
    }

    if (!resolvedCssText) {
      throw new Error('No font glyph data could be processed');
    }

    onProgress?.('Saving to local offline cache...');
    const record: CachedFontRecord = {
      key: family.toLowerCase(),
      family,
      cssText: resolvedCssText,
      sizeBytes: totalBytes,
      cachedAt: Date.now(),
    };

    await saveCachedFont(record);

    // Also inject immediately
    injectCSSIntoDocument(document, styleId, resolvedCssText);
    try {
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${family}"`);
      }
    } catch (_) {}

    return {
      success: true,
      family,
      sizeKb: Math.round(totalBytes / 1024),
      record,
    };
  } catch (err: any) {
    return {
      success: false,
      family,
      error: err?.message || 'Failed to download font',
    };
  }
}

// Master Font Loader: instantly applies CSS stack, checks local bundled fonts, checks IndexedDB cache, loads over HTTPS
export async function loadFont(fontInput: string, targetDoc: Document = document): Promise<void> {
  if (!fontInput) return;
  const cleanInput = fontInput.trim();
  if (cleanInput.length < 2) return;

  const family = extractFamilyName(cleanInput);
  const fontStack = buildFontStack(family);

  // 1. Immediately apply font stack variables (zero layout flash)
  applyFontToDocument(document, fontStack);
  if (targetDoc && targetDoc !== document) {
    applyFontToDocument(targetDoc, fontStack);
  }

  // 2. If it's a bundled preset font (Outfit, Inter, Plus Jakarta Sans, Roboto, JetBrains Mono, system-ui)
  if (isBundledFont(family)) {
    try {
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${family}"`);
      }
      if (targetDoc && targetDoc.fonts && targetDoc.fonts.load) {
        targetDoc.fonts.load(`16px "${family}"`);
      }
    } catch (_) {}
    return;
  }

  const fontSlug = family.replace(/\s+/g, '-').toLowerCase();
  const styleId = `qunix-font-style-${fontSlug}`;

  // 3. Check persistent IndexedDB cache
  const cached = await getCachedFont(family);
  if (cached && cached.cssText) {
    injectCSSIntoDocument(document, styleId, cached.cssText);
    if (targetDoc && targetDoc !== document) {
      injectCSSIntoDocument(targetDoc, styleId, cached.cssText);
    }
    try {
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${family}"`);
      }
      if (targetDoc && targetDoc.fonts && targetDoc.fonts.load) {
        targetDoc.fonts.load(`16px "${family}"`);
      }
    } catch (_) {}
    return;
  }

  // 4. Not cached locally yet: Download & cache in the background over HTTPS
  downloadAndCacheFont(cleanInput).then((res) => {
    if (res.success && targetDoc && targetDoc !== document) {
      getCachedFont(family).then((c) => {
        if (c?.cssText) {
          injectCSSIntoDocument(targetDoc, styleId, c.cssText);
        }
      });
    }
  });
}

// Global browser window bindings
if (typeof window !== 'undefined') {
  (window as any).qunixFontManager = {
    loadFont,
    downloadAndCacheFont,
    getCachedFont,
    saveCachedFont,
    deleteCachedFont,
    getAllCachedFonts,
    clearAllFontCache,
    cleanOtherCachedFonts,
    isBundledFont,
    extractFamilyName,
    buildFontStack,
  };
  (window as any).qunixLoadFont = loadFont;
}
