/* Loads the Settings sheet once per page and caches it, so cover
   image, countdown, and banner images all come from one shared
   lookup instead of being hand-typed into config.js. */

let __settingsCache = null;

async function loadSettings() {
  if (__settingsCache) return __settingsCache;

  if (!CONFIG.SETTINGS_CSV_URL || CONFIG.SETTINGS_CSV_URL.startsWith("PASTE_")) {
    __settingsCache = {};
    return __settingsCache;
  }

  try {
    const res = await fetch(CONFIG.SETTINGS_CSV_URL, { cache: "no-store" });
    const text = await res.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

    const map = {};
    data.forEach((row) => {
      if (row.Key) map[row.Key.trim()] = (row.Value || "").trim();
    });

    __settingsCache = map;
  } catch (err) {
    console.error("Could not load Settings sheet:", err);
    __settingsCache = {};
  }

  return __settingsCache;
}
