/* ==========================================================
   Event site logic
   No build step, no server — everything happens in the
   visitor's browser: fetch the published sheets, find the
   guest (or register a new group member), and show only the
   events tagged for them.
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

function normalizeEventCombo(raw) {
  return splitEventIds(raw)
    .map((s) => s.toLowerCase())
    .sort()
    .join("|");
}

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
  if (isNaN(d)) return raw;
  return d.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function capitalize(s) {
  s = (s || "").trim();
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";
}

function generateCode(firstName, lastName, existingCodes) {
  const base = (capitalize(firstName) + capitalize(lastName)).replace(/[^a-zA-Z]/g, "") || "Guest";
  const codes = existingCodes || new Set();
  let code = base;
  let n = 2;
  while (codes.has(code.toLowerCase())) {
    code = base + n;
    n++;
  }
  return code;
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

let CURRENT_GUEST = null; // { code, name, isNew, groupName, firstName, lastName }
let GROUPS_DATA = [];

async function populateGroupDropdown() {
  const select = document.getElementById("group-select");
  if (!select || !CONFIG.GROUPS_CSV_URL || CONFIG.GROUPS_CSV_URL.startsWith("PASTE_")) return;
  try {
    GROUPS_DATA = await fetchCsv(CONFIG.GROUPS_CSV_URL);
    select.innerHTML = GROUPS_DATA
      .filter((g) => g.GroupName)
      .map((g) => `<option value="${g.GroupName}">${g.GroupName}</option>`)
      .join("");
  } catch (err) {
    console.error("Could not load Groups sheet:", err);
  }
}

async function showIdentified(guestEvents) {
  document.getElementById("lookup").style.display = "none";
  document.getElementById("empty-state").style.display = guestEvents.length ? "none" : "block";

  const settings = await loadSettings();
  const greetingEl = document.getElementById("greeting");
  const greetingText = (settings.GreetingTemplate || "Welcome, {name}.").replace(
    "{name}", CURRENT_GUEST.name || "there"
  );
  document.getElementById("greeting-text").textContent = greetingText;
  greetingEl.style.display = "block";

  const rsvpCta = document.getElementById("rsvp-cta");
  if (rsvpCta) {
    if (CURRENT_GUEST.isNew) {
      const params = new URLSearchParams({
        mode: "group",
        group: CURRENT_GUEST.groupName,
        first: CURRENT_GUEST.firstName,
        last: CURRENT_GUEST.lastName,
        code: CURRENT_GUEST.code,
      });
      rsvpCta.href = `rsvp.html?${params.toString()}`;
    } else {
      rsvpCta.href = `rsvp.html?g=${encodeURIComponent(CURRENT_GUEST.code)}`;
    }
  }

  let invitations = [];
  try {
    if (CONFIG.INVITATIONS_CSV_URL && !CONFIG.INVITATIONS_CSV_URL.startsWith("PASTE_")) {
      invitations = await fetchCsv(CONFIG.INVITATIONS_CSV_URL);
    }
  } catch (err) { console.error(err); }
  const comboKey = normalizeEventCombo(guestEvents.map((e) => e.ID).join(";"));
  const match = invitations.find((inv) => normalizeEventCombo(inv.Events) === comboKey);
  renderInvitation(match ? match.InvitationURL : "");

  renderEvents(guestEvents);
}

async function showGuest(code) {
  const errorEl = document.getElementById("lookup-error");
  errorEl.style.display = "none";
  errorEl.textContent = "";

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
    errorEl.textContent = "We couldn't find that code — please double check it, or check with your host if you registered as part of a group recently.";
    errorEl.style.display = "block";
    return;
  }

  CURRENT_GUEST = { code: guest.Code, name: guest.Name, isNew: false, groupName: "", firstName: "", lastName: "" };

  const invitedIds = splitEventIds(guest.Events).map(normalize);
  const guestEvents = events
    .filter((ev) => invitedIds.includes(normalize(ev.ID)))
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  const url = new URL(window.location);
  url.searchParams.set("g", code);
  window.history.replaceState({}, "", url);

  showIdentified(guestEvents);
}

async function registerGroupMember() {
  const errorEl = document.getElementById("lookup-error");
  errorEl.style.display = "none";
  errorEl.textContent = "";

  const groupName = document.getElementById("group-select").value;
  const firstName = document.getElementById("first-name-input").value.trim();
  const lastName = document.getElementById("last-name-input").value.trim();

  if (!groupName || !firstName || !lastName) {
    errorEl.textContent = "Please fill in your group, first name, and last name.";
    errorEl.style.display = "block";
    return;
  }

  let allEvents, guests;
  try {
    allEvents = await fetchCsv(CONFIG.EVENTS_CSV_URL);
    guests = await fetchCsv(CONFIG.GUESTS_CSV_URL);
  } catch (err) {
    errorEl.textContent = "We're having trouble loading things right now — please try again shortly.";
    errorEl.style.display = "block";
    return;
  }

  const existingCodes = new Set(guests.map((g) => normalize(g.Code)));
  const group = GROUPS_DATA.find((g) => normalize(g.GroupName) === normalize(groupName));
  const invitedIds = splitEventIds(group ? group.Events : "").map(normalize);
  const guestEvents = allEvents
    .filter((ev) => invitedIds.includes(normalize(ev.ID)))
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  CURRENT_GUEST = {
    code: generateCode(firstName, lastName, existingCodes),
    name: `${firstName} ${lastName}`,
    isNew: true,
    groupName, firstName, lastName,
  };

  showIdentified(guestEvents);
}

async function applyCoverImage(settings) {
  const cover = document.getElementById("hero-cover");
  const url = (settings.CoverImage || "").trim();
  if (cover && url) cover.style.backgroundImage = `url("${url}")`;
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
      els.days.textContent = "0"; els.hours.textContent = "0";
      els.mins.textContent = "0"; els.secs.textContent = "0";
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

async function loadRsvpQuestions() {
  if (!CONFIG.RSVP_QUESTIONS_CSV_URL || CONFIG.RSVP_QUESTIONS_CSV_URL.startsWith("PASTE_")) return {};
  try {
    const data = await fetchCsv(CONFIG.RSVP_QUESTIONS_CSV_URL);
    const map = {};
    data.forEach((row) => { if (row.Key) map[row.Key.trim()] = (row.Value || "").trim(); });
    return map;
  } catch (err) {
    console.error("Could not load RSVP Questions sheet:", err);
    return {};
  }
}

function applyRsvpQuestionText(q) {
  const setText = (id, key, fallback) => {
    const el = document.getElementById(id);
    if (el) el.textContent = q[key] || fallback;
  };
  setText("group-prompt-label", "GroupPromptQuestion", "Did you receive this link as part of a group?");
  setText("group-name-label", "GroupNameLabel", "Which group are you part of?");
  setText("first-name-label", "FirstNameLabel", "First name");
  setText("last-name-label", "LastNameLabel", "Last name");
  setText("code-label", "CodeLabel", "Access code");
}

async function init() {
  const settings = await loadSettings();
  applyCoverImage(settings);
  startCountdown(settings);

  document.querySelectorAll('input[name="is-group"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.getElementById("lookup-form").style.display = radio.value === "No" && radio.checked ? "block" : "none";
      document.getElementById("group-form").style.display = radio.value === "Yes" && radio.checked ? "block" : "none";
    });
  });

  document.getElementById("lookup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("code-input").value.trim();
    if (code) showGuest(code);
  });

  document.getElementById("group-form").addEventListener("submit", (e) => {
    e.preventDefault();
    registerGroupMember();
  });

  populateGroupDropdown();
  loadRsvpQuestions().then(applyRsvpQuestionText);

  const codeFromUrl = getParam("g");
  if (codeFromUrl) showGuest(codeFromUrl);
}

document.addEventListener("DOMContentLoaded", init);
