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

function formatDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

let CURRENT_GUEST = null; // { code, name }
let CURRENT_EVENTS = [];  // events this guest is invited to

function renderRsvpForm(events) {
  const container = document.getElementById("rsvp-events");
  const empty = document.getElementById("empty-state");
  const form = document.getElementById("rsvp-form");

  if (!events.length) {
    empty.style.display = "block";
    form.style.display = "none";
    return;
  }

  container.innerHTML = events
    .map((ev) => {
      const dateLine = [formatDate(ev.Date), ev.Time].filter(Boolean).join(" · ");
      return `
        <div class="rsvp-event">
          ${dateLine ? `<p class="event-date">${dateLine}</p>` : ""}
          <h3>${ev.Name || "Untitled event"}</h3>
          ${ev.Location ? `<p class="location">${ev.Location}</p>` : ""}

          <div class="rsvp-field">
            <label>Will you attend?</label>
            <div class="rsvp-radios">
              <label><input type="radio" name="attending-${ev.ID}" value="Yes" required> Yes</label>
              <label><input type="radio" name="attending-${ev.ID}" value="No" required> No</label>
            </div>
          </div>

          <div class="rsvp-field rsvp-count-wrap" id="count-wrap-${ev.ID}" style="display:none;">
            <label for="count-${ev.ID}">Number attending (including you)</label>
            <input type="number" id="count-${ev.ID}" name="count-${ev.ID}" min="1" value="1">
          </div>
        </div>
      `;
    })
    .join("");

  form.style.display = "block";
  attachAttendingToggles(events);
}

function attachAttendingToggles(events) {
  events.forEach((ev) => {
    const radios = document.querySelectorAll(`input[name="attending-${ev.ID}"]`);
    const countWrap = document.getElementById(`count-wrap-${ev.ID}`);
    const countInput = document.getElementById(`count-${ev.ID}`);

    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked && radio.value === "Yes") {
          countWrap.style.display = "block";
          if (!countInput.value || Number(countInput.value) < 1) countInput.value = 1;
        } else if (radio.checked && radio.value === "No") {
          countWrap.style.display = "none";
          countInput.value = 0;
        }
      });
    });
  });
}

async function showGuest(code) {
  const errorEl = document.getElementById("lookup-error");
  errorEl.style.display = "none";

  let guests, events;
  try {
    [guests, events] = await Promise.all([
      fetchCsv(CONFIG.GUESTS_CSV_URL),
      fetchCsv(CONFIG.EVENTS_CSV_URL),
    ]);
  } catch (err) {
    errorEl.textContent = "We're having trouble loading things right now — please try again shortly.";
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

  document.getElementById("lookup").style.display = "none";

  const settings = await loadSettings();
  const greetingEl = document.getElementById("greeting");
  const template = settings.GreetingTemplate || "Welcome, {name}.";
  document.getElementById("greeting-text").textContent = template.replace(
    "{name}",
    guest.Name || "there"
  );
  greetingEl.style.display = "block";

  const invitedIds = splitEventIds(guest.Events).map(normalize);
  const guestEvents = events
    .filter((ev) => invitedIds.includes(normalize(ev.ID)))
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  CURRENT_GUEST = { code: guest.Code, name: guest.Name };
  CURRENT_EVENTS = guestEvents;

  renderRsvpForm(guestEvents);

  const url = new URL(window.location);
  url.searchParams.set("g", code);
  window.history.replaceState({}, "", url);
}

async function submitRsvp(e) {
  e.preventDefault();

  if (!CONFIG.RSVP_ENDPOINT_URL || CONFIG.RSVP_ENDPOINT_URL.startsWith("PASTE_")) {
    document.getElementById("rsvp-status").textContent =
      "RSVP submissions aren't set up yet — see README.md.";
    return;
  }

  const submitBtn = document.getElementById("rsvp-submit");
  const statusEl = document.getElementById("rsvp-status");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  statusEl.textContent = "";

  const responses = CURRENT_EVENTS.map((ev) => {
    const attending = document.querySelector(`input[name="attending-${ev.ID}"]:checked`);
    const count = document.getElementById(`count-${ev.ID}`);
    return {
      eventId: ev.ID,
      eventName: ev.Name || "",
      attending: attending ? attending.value : "",
      guestCount: count ? count.value : "",
    };
  });

  const notes = document.getElementById("rsvp-notes")
    ? document.getElementById("rsvp-notes").value
    : "";

  try {
    await fetch(CONFIG.RSVP_ENDPOINT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS preflight
      body: JSON.stringify({
        code: CURRENT_GUEST.code,
        name: CURRENT_GUEST.name,
        notes,
        responses,
      }),
    });

    submitBtn.textContent = "Submitted";
    statusEl.innerHTML = `
      <p>Thank you — your RSVP has been recorded. You can revisit this link any time to update it.</p>
      <ul class="rsvp-summary">
        ${responses
          .map((r) => {
            const line =
              r.attending === "Yes"
                ? `${r.eventName}: <strong>Yes</strong> — ${r.guestCount || 1} guest${r.guestCount == 1 ? "" : "s"}`
                : `${r.eventName}: <strong>No</strong>`;
            return `<li>${line}</li>`;
          })
          .join("")}
      </ul>
    `;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit RSVP";
    statusEl.textContent = "Something went wrong submitting your RSVP — please try again.";
    console.error(err);
  }
}

function init() {
  const form = document.getElementById("lookup-form");
  const input = document.getElementById("code-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) showGuest(input.value.trim());
  });

  document.getElementById("rsvp-form").addEventListener("submit", submitRsvp);

  const codeFromUrl = getParam("g");
  if (codeFromUrl) {
    input.value = codeFromUrl;
    showGuest(codeFromUrl);
  }
}

document.addEventListener("DOMContentLoaded", init);
