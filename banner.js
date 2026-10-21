/* Fills in the small banner image at the top of a secondary page.

   The image link lives in the page's own tab, in a column named
   BannerImage (fill in one cell, on any row). The RSVP Questions tab is
   a Key/Value list instead, so there it's a row with the key BannerImage.
   If the tab has no value, the old Settings row named in
   data-settings-key is used as a fallback. If neither has a value, the
   banner stays hidden. */

async function findTabBanner(banner) {
  const tabKey = banner.getAttribute("data-tab");
  const tabUrl = tabKey && CONFIG[tabKey];
  if (!tabUrl || tabUrl.startsWith("PASTE_")) return "";

  try {
    const res = await fetch(tabUrl, { cache: "no-store" });
    const { data } = Papa.parse(await res.text(), { header: true, skipEmptyLines: true });
    for (const r of data) {
      const fromColumn = (r.BannerImage || "").trim();
      if (fromColumn) return fromColumn;
      if ((r.Key || "").trim() === "BannerImage" && (r.Value || "").trim()) return r.Value.trim();
    }
  } catch (err) {
    console.error("Could not read banner from tab:", err);
  }
  return "";
}

document.addEventListener("DOMContentLoaded", async function () {
  const banner = document.getElementById("page-banner");
  if (!banner) return;

  let url = resolveImageUrl(await findTabBanner(banner));
  if (!url) {
    const settings = await loadSettings();
    url = resolveImageUrl(settings[banner.getAttribute("data-settings-key")]);
  }

  if (url) {
    banner.querySelector("img").src = url;
  } else {
    banner.style.display = "none";
  }
});
