/* ==========================================================
   Event site logic
   No build step, no server — everything happens in the
   visitor's browser: fetch the two published sheets, find
   the guest, show only the events tagged for them.
   ========================================================== */

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function normalize(str) {
  return (str || "").toString().trim().toLowerCase();
}

async function fetchCsv(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load sheet: " + res.status);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function splitEventIds(raw) {
  return (raw || "")
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Turns an Events cell (any order, any of ; or , as separators) into a
// consistent key, so "WEDDING;RECEPTION" and "Reception, Wedding" match
// the same Invitations row regardless of how each was typed.
function normalizeEventCombo(raw) {
  return splitEventIds(raw)
    .map((s) => s.toLowerCase())
    .sort()
    .join("|");
}

// Accepts a normal Google Drive share link (or any direct PDF URL) and
// returns both an embeddable preview URL and a plain "open" URL. Drive
// links are auto-converted; anything else is used as-is for both.
function resolveInvitationUrls(raw) {
  const url = (raw || "").trim();
  if (!url) return null;

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const id = match[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      openUrl: `https://drive.google.com/file/d/${id}/view`,
    };
  }

  return { embedUrl: url, openUrl: url };
}

function renderInvitation(invitationUrl) {
  const container = document.getElementById("invitation-embed");
  if (!container) return;

  const urls = resolveInvitationUrls(invitationUrl);
  if (!urls) {
    container.style.display = "none";
    return;
  }

  container.innerHTML = `
    <iframe class="invitation-frame" src="${urls.embedUrl}" loading="lazy"></iframe>
    <a class="invitation-link" href="${urls.openUrl}" target="_blank" rel="noopener">Open full invitation</a>
  `;
  container.style.display = "block";
}

function formatDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d)) return raw; // fall back to whatever text was in the sheet
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderEvents(events) {
  const container = document.getElementById("events");
  const empty = document.getElementById("empty-state");

  if (!events.length) {
    empty.style.display = "block";
    return;
  }

  container.innerHTML = events
    .map((ev) => {
      const dateLine = [formatDate(ev.Date), ev.Time].filter(Boolean).join(" · ");

      const imageUrl = (ev.ImageURL || "").trim();
      const embedUrl = (ev.EmbedURL || "").trim();

      const media = imageUrl
        ? `<img class="event-media" src="${imageUrl}" alt="${ev.Name || ""}" loading="lazy" onerror="this.style.display='none'">`
        : "";

      const embed = embedUrl
        ? `<div class="embed-wrap">
             <iframe class="event-embed" src="${embedUrl}" allow="fullscreen" loading="lazy"></iframe>
           </div>
           <button type="button" class="embed-fullscreen-btn" data-embed-fullscreen>View fullscreen</button>`
        : "";

      return `
        <div class="event">
          ${dateLine ? `<p class="event-date">${dateLine}</p>` : ""}
          <h3>${ev.Name || "Untitled event"}</h3>
          ${ev.Location ? `<p class="location">${ev.Location}</p>` : ""}
          ${ev.Description ? `<p class="description">${ev.Description}</p>` : ""}
          ${media}
          ${embed}
        </div>
      `;
    })
    .join("");

  container.style.display = "block";
  attachFullscreenButtons();
}

function attachFullscreenButtons() {
  document.querySelectorAll("[data-embed-fullscreen]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iframe = btn.previousElementSibling.querySelector("iframe.event-embed");
      if (!iframe) return;
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    });
  });
}

async function showGuest(code) {
  const errorEl = document.getElementById("lookup-error");
  errorEl.style.display = "none";

  let guests, events, invitations;
  try {
    [guests, events, invitations] = await Promise.all([
      fetchCsv(CONFIG.GUESTS_CSV_URL),
      fetchCsv(CONFIG.EVENTS_CSV_URL),
      CONFIG.INVITATIONS_CSV_URL && !CONFIG.INVITATIONS_CSV_URL.startsWith("PASTE_")
        ? fetchCsv(CONFIG.INVITATIONS_CSV_URL)
        : Promise.resolve([]),
    ]);
  } catch (err) {
    errorEl.textContent = "We're having trouble loading the guest list right now — please try again shortly.";
    errorEl.style.display = "block";
    console.error(err);
    return;
  }

  const guest = guests.find((g) => normalize(g.Code) === normalize(code));

  if (!guest) {
    errorEl.textContent = "We couldn't find that code — please double check it and try again.";
    errorEl.style.display = "block";
    return;
  }

  // Hide the lookup box, show the personalized view.
  document.getElementById("lookup").style.display = "none";

  const greetingEl = document.getElementById("greeting");
  const settings = await loadSettings();
  const greetingText = (settings.GreetingTemplate || "Welcome, {name}.").replace(
    "{name}",
    guest.Name || "there"
  );
  document.getElementById("greeting-text").textContent = greetingText;
  greetingEl.style.display = "block";

  const rsvpCta = document.getElementById("rsvp-cta");
  if (rsvpCta) rsvpCta.href = `rsvp.html?g=${encodeURIComponent(code)}`;

  const guestComboKey = normalizeEventCombo(guest.Events);
  const matchingInvitation = invitations.find(
    (inv) => normalizeEventCombo(inv.Events) === guestComboKey
  );
  renderInvitation(matchingInvitation ? matchingInvitation.InvitationURL : "");

  const invitedIds = splitEventIds(guest.Events).map(normalize);
  const guestEvents = events
    .filter((ev) => invitedIds.includes(normalize(ev.ID)))
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  renderEvents(guestEvents);

  // Keep the code in the URL so the page can be bookmarked/refreshed.
  const url = new URL(window.location);
  url.searchParams.set("g", code);
  window.history.replaceState({}, "", url);
}

async function applyCoverImage(settings) {
  const cover = document.getElementById("hero-cover");
  const url = (settings.CoverImage || "").trim();
  if (cover && url) {
    cover.style.backgroundImage = `url("${url}")`;
  }
}

function startCountdown(settings) {
  const targetStr = (settings.CountdownTarget || "").trim();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  if (!targetStr || !els.days) return;

  const target = new Date(targetStr).getTime();
  if (isNaN(target)) return;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.days.textContent = "0";
      els.hours.textContent = "0";
      els.mins.textContent = "0";
      els.secs.textContent = "0";
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    els.days.textContent = Math.floor(s / 86400);
    els.hours.textContent = Math.floor((s % 86400) / 3600);
    els.mins.textContent = Math.floor((s % 3600) / 60);
    els.secs.textContent = s % 60;
  }

  tick();
  const timer = setInterval(tick, 1000);
}

async function init() {
  const settings = await loadSettings();
  applyCoverImage(settings);
  startCountdown(settings);

  const form = document.getElementById("lookup-form");
  const input = document.getElementById("code-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) showGuest(input.value.trim());
  });

  const codeFromUrl = getParam("g");
  if (codeFromUrl) {
    input.value = codeFromUrl;
    showGuest(codeFromUrl);
  }
}

document.addEventListener("DOMContentLoaded", init);
