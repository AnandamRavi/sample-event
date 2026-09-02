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
GUESTS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1798527694&single=true&output=csv",
  EVENTS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1913252533&single=true&output=csv",
  PARTY_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1044096524&single=true&output=csv",
  FAQ_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1088904958&single=true&output=csv",
  STORY_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1183152801&single=true&output=csv",
  SETTINGS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLl3giq70GX4aEnUpr16FE1_Ua4AdBgxET_8clQaJe9QbbbbAHxZFcIcB3tq-Q_zNWMTFwY7PB1jgo/pub?gid=1017722567&single=true&output=csv",
};

/* ==========================================================
   Everything else — cover image, countdown date/time, and each
   page's banner image — now lives in your Settings tab in
   Google Sheets, not here. Once these six links above are set,
   you should never need to open this file again. See README.md
   for the full walkthrough.
   ========================================================== */
