/* Travel & stay page: builds itself from the Travel tab. Rows are grouped
   by their Category column (Hotels, Sightseeing, Getting there, anything
   you like), in the order each category first appears in the sheet. */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Only plain web links are allowed in the Link column.
function safeUrl(u) {
  u = (u || "").trim();
  return /^https?:\/\//i.test(u) ? u : "";
}

function renderTravelItem(item) {
  const name = (item.Name || "").trim();
  const photo = resolveImageUrl(item.PhotoURL);
  const details = (item.Details || "").trim();
  const description = (item.Description || "").trim();
  const address = (item.Address || "").trim();
  const link = safeUrl(item.Link);
  const linkLabel = (item.LinkLabel || "").trim() || "Visit website";

  const mapUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((name + " " + address).trim())}`
    : "";

  return `
    <div class="travel-item">
      ${photo ? `<img src="${esc(photo)}" alt="${esc(name)}" loading="lazy" onerror="this.style.display='none'">` : ""}
      <div class="travel-body">
        <h3>${esc(name)}</h3>
        ${details ? `<p class="travel-details">${esc(details)}</p>` : ""}
        ${description ? `<p class="travel-desc">${esc(description).replace(/\n/g, "<br>")}</p>` : ""}
        ${address ? `<p class="travel-address">${esc(address)}</p>` : ""}
        <div class="travel-links">
          ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(linkLabel)}</a>` : ""}
          ${mapUrl ? `<a href="${esc(mapUrl)}" target="_blank" rel="noopener">View on map</a>` : ""}
        </div>
      </div>
    </div>
  `;
}

async function loadTravel() {
  const list = document.getElementById("travel-list");
  const settings = await loadSettings();

  const intro = document.getElementById("travel-intro");
  if (intro && settings.TravelIntro) {
    intro.textContent = settings.TravelIntro;
    intro.style.display = "block";
  }

  if (!CONFIG.TRAVEL_CSV_URL || CONFIG.TRAVEL_CSV_URL.startsWith("PASTE_")) {
    list.innerHTML = "<p>Add your Travel tab link to config.js to show suggestions here.</p>";
    return;
  }

  try {
    const res = await fetch(CONFIG.TRAVEL_CSV_URL, { cache: "no-store" });
    const text = await res.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

    // Group by category, keeping the order categories first appear in.
    const order = [];
    const groups = {};
    data.filter((r) => (r.Name || "").trim()).forEach((r) => {
      const cat = (r.Category || "").trim() || "More suggestions";
      if (!groups[cat]) { groups[cat] = []; order.push(cat); }
      groups[cat].push(r);
    });

    if (!order.length) {
      list.innerHTML = "<p>Suggestions will be added here soon.</p>";
      return;
    }

    list.innerHTML = order
      .map((cat) => `
        <section class="travel-section">
          <h2>${esc(cat)}</h2>
          ${groups[cat].map(renderTravelItem).join("")}
        </section>
      `)
      .join("");
  } catch (err) {
    list.innerHTML = "<p>Couldn't load the travel suggestions right now.</p>";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadTravel);
