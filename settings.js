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

/* Applies site-wide text that appears on more than one page (hero
   heading, browser tab title, footer line), so this only needs to be
   written once here rather than in every page's own script. Elements
   that don't exist on a given page are simply skipped. */
document.addEventListener("DOMContentLoaded", async function () {
  const settings = await loadSettings();

  const eyebrow = document.getElementById("hero-eyebrow");
  if (eyebrow && settings.HeroEyebrow) eyebrow.textContent = settings.HeroEyebrow;

  const title = document.getElementById("hero-title");
  if (title && settings.HeroTitle) title.textContent = settings.HeroTitle;

  const footer = document.getElementById("site-footer");
  if (footer && settings.FooterText) footer.textContent = settings.FooterText;

  const lookupHeading = document.getElementById("lookup-heading");
  if (lookupHeading && settings.LookupHeading) lookupHeading.textContent = settings.LookupHeading;

  const lookupSubtext = document.getElementById("lookup-subtext");
  if (lookupSubtext && settings.LookupSubtext) lookupSubtext.textContent = settings.LookupSubtext;

  const storyTitle = document.getElementById("story-page-title");
  if (storyTitle && settings.StoryPageTitle) storyTitle.textContent = settings.StoryPageTitle;

  const navStory = document.getElementById("nav-story");
  if (navStory && settings.StoryPageTitle) navStory.textContent = settings.StoryPageTitle;

  const partyTitle = document.getElementById("party-page-title");
  if (partyTitle && settings.PartyPageTitle) partyTitle.textContent = settings.PartyPageTitle;

  const navParty = document.getElementById("nav-party");
  if (navParty && settings.PartyPageTitle) navParty.textContent = settings.PartyPageTitle;

  const faqTitle = document.getElementById("faq-page-title");
  if (faqTitle && settings.FaqPageTitle) faqTitle.textContent = settings.FaqPageTitle;

  const navFaq = document.getElementById("nav-faq");
  if (navFaq && settings.FaqPageTitle) navFaq.textContent = settings.FaqPageTitle;

  const rsvpTitle = document.getElementById("rsvp-page-title");
  if (rsvpTitle && settings.RsvpPageTitle) rsvpTitle.textContent = settings.RsvpPageTitle;

  const navRsvp = document.getElementById("nav-rsvp");
  if (navRsvp && settings.RsvpPageTitle) navRsvp.textContent = settings.RsvpPageTitle;

  if (settings.SiteTitle) document.title = settings.SiteTitle;

  const borderImage = (settings.PageBorderImage || "").trim();
  const borderLeft = document.getElementById("page-border-left");
  const borderRight = document.getElementById("page-border-right");
  if (borderLeft && borderRight && borderImage) {
    borderLeft.style.backgroundImage = `url("${borderImage}")`;
    borderRight.style.backgroundImage = `url("${borderImage}")`;
    borderLeft.classList.add("has-image");
    borderRight.classList.add("has-image");
  }

  const venueDetails = document.getElementById("venue-details");
  const venueText = document.getElementById("venue-text");
  const venueMapLink = document.getElementById("venue-map-link");
  if (venueDetails && venueText && settings.VenueDetails) {
    venueText.textContent = settings.VenueDetails;
    venueDetails.style.display = "block";

    const mapUrl = settings.VenueMapLink
      ? settings.VenueMapLink
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.VenueDetails)}`;
    venueMapLink.href = mapUrl;
    venueMapLink.style.display = "inline-block";
  }

  // Reveal the hero text now that it shows the real content, rather
  // than flashing the placeholder text before this fetch resolves.
  const heroContent = document.querySelector(".hero-cover-content");
  if (heroContent) heroContent.classList.add("ready");
});
