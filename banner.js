/* Fills in the small banner image at the top of a secondary page,
   using whichever Settings row the page's banner div points to.
   If no value is set for that key, the banner stays hidden. */

document.addEventListener("DOMContentLoaded", async function () {
  const banner = document.getElementById("page-banner");
  if (!banner) return;

  const key = banner.getAttribute("data-settings-key");
  const settings = await loadSettings();
  const url = (settings[key] || "").trim();

  if (url) {
    banner.querySelector("img").src = url;
  } else {
    banner.style.display = "none";
  }
});
