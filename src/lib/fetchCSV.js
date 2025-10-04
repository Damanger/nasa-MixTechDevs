import parseCSV from "./csv.js";

// Use a global cache so multiple Astro islands/bundles share the same data
const g = (typeof globalThis !== "undefined" ? globalThis : {});
if (!g.__EXO_CSV_STORE__) {
  g.__EXO_CSV_STORE__ = { text: new Map(), promise: new Map() };
}
const textCache = g.__EXO_CSV_STORE__.text;
const promiseCache = g.__EXO_CSV_STORE__.promise;

export async function fetchCSV(src, options = {}) {
  const { signal } = options;

  // Return parsed rows from cache if available
  if (textCache.has(src)) {
    try {
      return parseCSV(textCache.get(src));
    } catch {
      // If parsing fails for any reason, fall through to refetch
    }
  }

  // If a request is already in-flight, await it
  if (promiseCache.has(src)) {
    const txt = await promiseCache.get(src);
    return parseCSV(txt);
  }

  // Start a new fetch and cache the promise to dedupe concurrent calls
  const p = (async () => {
    const res = await fetch(src, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txt = await res.text();
    textCache.set(src, txt);
    promiseCache.delete(src);
    return txt;
  })();

  promiseCache.set(src, p);

  try {
    const txt = await p;
    return parseCSV(txt);
  } catch (e) {
    // Ensure we don't hold a rejected promise in cache
    promiseCache.delete(src);
    throw e;
  }
}

export default fetchCSV;
