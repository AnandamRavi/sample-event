/* ==========================================================
   SITE CONFIG — this is the only file most people will ever
   need to touch by hand, and even this is just two links.

   How to get these URLs:
   1. Open your Google Sheet.
   2. File > Share > Publish to web.
   3. Under "Link", choose the specific tab (e.g. "Guests"),
      set the format to "Comma-separated values (.csv)",
      and click Publish.
   4. Copy the link it gives you and paste it below.
   5. Repeat for the "Events" tab.
   6. Tick "Automatically republish when I make changes" if
      offered, so edits show up on the site without redoing
      this step.

   Full walkthrough with scre​enshots-style steps: see README.md
   ========================================================== */

const CONFIG = {
  GUESTS_CSV_URL: "PASTE_YOUR_GUESTS_TAB_PUBLISHED_CSV_LINK_HERE",
  EVENTS_CSV_URL: "PASTE_YOUR_EVENTS_TAB_PUBLISHED_CSV_LINK_HERE",
  PARTY_CSV_URL: "PASTE_YOUR_WEDDING_PARTY_TAB_PUBLISHED_CSV_LINK_HERE",
  FAQ_CSV_URL: "PASTE_YOUR_FAQ_TAB_PUBLISHED_CSV_LINK_HERE",
  STORY_CSV_URL: "PASTE_YOUR_STORY_TAB_PUBLISHED_CSV_LINK_HERE",
  SETTINGS_CSV_URL: "PASTE_YOUR_SETTINGS_TAB_PUBLISHED_CSV_LINK_HERE",

  // Where RSVP submissions are sent — your Apps Script Web App URL.
  // See README.md, "Setting up RSVP" for how to get this.
  RSVP_ENDPOINT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
};

/* ==========================================================
   Everything else — cover image, countdown date/time, and each
   page's banner image — now lives in your Settings tab in
   Google Sheets, not here. Once these six links above are set,
   you should never need to open this file again. See README.md
   for the full walkthrough.
   ========================================================== */
