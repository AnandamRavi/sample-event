/* Fills in the small banner image at the top of a secondary page,
   using whichever CONFIG key the page's banner div points to.
   If no URL is set for that page, the banner is hidden. */

document.addEventListener("DOMContentLoaded", function () {
  var banner = document.getElementById("page-banner");
  if (!banner) return;

  var key = banner.getAttribute("data-config-key");
  var url = (CONFIG[key] || "").trim();

  if (url) {
    banner.querySelector("img").src = url;
  } else {
    banner.style.display = "none";
  }
});
