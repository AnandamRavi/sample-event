/* ==========================================================
   START HERE — builds (or rebuilds) the first tab of the sheet.

   Run it from the menu:  RSVP Tools > Build Start Here tab
   Safe to run as often as you like: it only touches the
   "Start Here" tab and never your guest data. Tab links are
   looked up fresh each time, so they never go stale.

   Screenshot: upload help/home-annotated.jpg to your GitHub
   repo (folder "help"), then it appears automatically at
   SITE_BASE_URL + "help/home-annotated.jpg".
   ========================================================== */

var SH_NAME = "Start Here";
var SH_IMG  = "help/home-annotated.jpg";
// false = editors get a warning before changing locked cells (works for everyone with edit access).
// true  = only the sheet owner can edit them (locks clients out for real, but only the owner can rebuild).
var LOCK_STRICT = true;
var LOCK_DESC = "Locked by Start Here";
var SH = { wine: "#6B2737", gold: "#B99456", cream: "#FAF7F2", card: "#F1EAE0", ink: "#2B2320", muted: "#8A7F72", line: "#E3D9CB" };

function buildStartHere() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SH_NAME);
  if (!sh) sh = ss.insertSheet(SH_NAME, 0);
  else { sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); sh.clear(); sh.clearConditionalFormatRules(); }
  ss.setActiveSheet(sh);
  ss.moveActiveSheet(1);
  sh.setTabColor(SH.wine);
  sh.setHiddenGridlines(true);

  if (sh.getMaxColumns() < 5) sh.insertColumnsAfter(sh.getMaxColumns(), 5 - sh.getMaxColumns());
  sh.setColumnWidth(1, 36);   // A: tick boxes
  sh.setColumnWidth(2, 210);  // B: labels
  sh.setColumnWidth(3, 560);  // C: explanation
  sh.setColumnWidth(4, 230);  // D: links / examples
  sh.setColumnWidth(5, 24);

  var base = (typeof SITE_BASE_URL !== "undefined" ? SITE_BASE_URL : "");
  var imgUrl = base + SH_IMG;

  var r = 1;
  var anchors = [];   // {title, row}

  function tab(name, label, auto) {
    var t = ss.getSheetByName(name);
    if (!t) return auto ? "Appears automatically" : "";
    return '=HYPERLINK("#gid=' + t.getSheetId() + '","' + (label || ("Open " + name + " tab →")) + '")';
  }
  function fill(rng, bg, color, bold, size, font) {
    rng.setBackground(bg).setFontColor(color).setFontWeight(bold ? "bold" : "normal")
       .setFontSize(size || 11).setFontFamily(font || "Arial").setVerticalAlignment("middle");
  }
  function title(text, sub) {
    sh.getRange(r, 2, 1, 3).merge().setValue(text);
    fill(sh.getRange(r, 1, 1, 5), SH.wine, "#FFFFFF", true, 24, "Georgia");
    sh.setRowHeight(r, 64); r++;
    sh.getRange(r, 2, 1, 3).merge().setValue(sub).setWrap(true);
    fill(sh.getRange(r, 1, 1, 5), SH.card, SH.ink, false, 11);
    sh.setRowHeight(r, 58); r++;
  }
  function gap(h) { sh.setRowHeight(r, h || 14); r++; }
  function step(name, heading, tabName, tabLabel) {
    anchors.push({ title: heading, row: r });
    sh.getRange(r, 1).insertCheckboxes();
    sh.getRange(r, 2, 1, 2).merge().setValue(heading);
    var tv = tabName ? tab(tabName, tabLabel) : "";
    if (tv.charAt(0) === "=") sh.getRange(r, 4).setFormula(tv); else sh.getRange(r, 4).setValue(tv);
    fill(sh.getRange(r, 1, 1, 5), SH.wine, "#FFFFFF", true, 14, "Georgia");
    sh.getRange(r, 4).setFontSize(11).setFontFamily("Arial").setHorizontalAlignment("right")
      .setFontColor("#FFFFFF");
    sh.getRange(r, 1).setHorizontalAlignment("center").setBackground(SH.cream);
    sh.setRowHeight(r, 42); r++;
  }
  // label | text | optional right-hand cell (text or formula)
  function item(label, text, right, kind) {
    sh.getRange(r, 2).setValue(label);
    sh.getRange(r, 3).setValue(text);
    if (right) {
      if (String(right).charAt(0) === "=") sh.getRange(r, 4).setFormula(right); else sh.getRange(r, 4).setValue(right);
    }
    var row = sh.getRange(r, 1, 1, 5);
    fill(row, kind === "tip" ? SH.card : SH.cream, SH.ink, false, 11);
    sh.getRange(r, 2).setFontWeight("bold").setFontColor(kind === "tip" ? SH.wine : SH.ink);
    sh.getRange(r, 2, 1, 3).setWrap(true).setVerticalAlignment("top");
    sh.getRange(r, 4).setFontColor(kind === "tip" ? SH.ink : SH.wine).setFontStyle(kind === "ex" ? "italic" : "normal");
    sh.getRange(r, 2, 1, 3).setBorder(null, null, true, null, null, null, SH.line, SpreadsheetApp.BorderStyle.SOLID);
    r++;
  }
  function tip(text) { item("Tip", text, "", "tip"); }
  function head3(a, b, c) {
    sh.getRange(r, 2, 1, 3).setValues([[a, b, c]]);
    fill(sh.getRange(r, 1, 1, 5), SH.card, SH.wine, true, 11);
    sh.getRange(r, 1).setBackground(SH.cream); sh.getRange(r, 5).setBackground(SH.cream);
    r++;
  }

  // ---------- Page background ----------
  sh.getRange(1, 1, 220, 5).setBackground(SH.cream);

  // ---------- Header ----------
  title("Start Here", "Welcome! Work through the steps below in order and tick each box as you go. Click any “Open … tab” link to jump straight there. Your changes show up on the website within a few minutes.");
  item("Quick rules", "1)  Don’t rename tabs or column headings.\n2)  Grey cells are there to keep the site working. Please leave them as they are.\n3)  Share pictures in Google Drive as “Anyone with the link”.", "");
  gap();

  // ---------- Contents (filled at the end) ----------
  var tocStart = r;
  sh.getRange(r, 2, 1, 3).merge().setValue("Contents — click to jump");
  fill(sh.getRange(r, 1, 1, 5), SH.gold, "#FFFFFF", true, 12, "Georgia"); sh.setRowHeight(r, 30); r++;
  var tocRows = 5; r += tocRows;
  gap();

  // ---------- STEP 1 Events ----------
  step("1", "Step 1 — Events: what are we celebrating?", "Events");
  item("What this tab does", "One row per event. Guests only see the events they’re invited to, in date order.", "");
  item("ID", "A short code with no spaces. Other tabs use it, so don’t change it later.", "MEHNDI", "ex");
  item("Name, Date, Time, Location", "Type these as you’d like guests to see them. Write the date as year-month-day.", "2026-12-12", "ex");
  item("Description", "A few lines about the event. For a new line inside a cell, press Alt+Enter (Windows) or Option+Return (Mac).", "");
  item("Several events", "Separate them with a semicolon and no spaces.", "MEHNDI;WEDDING", "ex");
  item("ImageURL", "Use for a photo or GIF. Recommended size: 1500 px wide.", "");
  item("ImageCredit", "Optional. A small credit line shown under the image.", "Illustration by Priya Nair", "ex");
  item("EmbedURL", "Use to embed a live or interactive element, including videos.", "");
  item("EmbedCredit", "Optional. A small credit line shown under the embed.", "Video by Rohan Mehta", "ex");
  tip("To remove a picture, clear the cell completely. Even a stray space leaves a broken image.");
  gap();

  // ---------- STEP 2 Guests ----------
  step("2", "Step 2 — Guests: who is invited", "Guests");
  item("What this tab is", "Your master list of guests, one row per family or household.", "");
  item("Code", "A private code for each family, written as FirstnameLastname. Guests type it in to see their invitation.", "AnandamRavi", "ex");
  item("Name", "How you’d like to greet them.", "Anandam Ravi", "ex");
  item("Events", "The events they’re invited to, separated by semicolons.", "MEHNDI;WEDDING", "ex");
  item("Other columns", "These fill in automatically. Please leave them alone.", "");
  item("Groups", "Big families can also join through a group. See Step 5.", "");
  gap();

  // ---------- STEP 3 Settings ----------
  step("3", "Step 3 — Settings: the words and pictures on your home page", "Settings");
  item("How to use it", "Change the text on the right of each row. The numbers below match the numbers in the picture.", "");
  sh.getRange(r, 2, 1, 3).merge().setFormula('=IMAGE("' + imgUrl + '",4,540,980)');
  sh.getRange(r, 1, 1, 5).setBackground(SH.cream);
  sh.setRowHeight(r, 548); r++;
  sh.getRange(r, 2, 1, 2).merge().setValue("");
  sh.getRange(r, 4).setFormula('=HYPERLINK("' + imgUrl + '","Open full size →")');
  fill(sh.getRange(r, 1, 1, 5), SH.cream, SH.muted, false, 10); sh.getRange(r, 4).setFontColor(SH.wine); r++;
  gap(8);
  head3("# · Setting", "What it does", "Example");
  item("2 · CoverImage", "The big picture beside your welcome text. Recommended size: 1600 × 1800 px.", "", "ex");
  item("2 · CoverImageCredit", "Optional. A small credit line shown in the corner of the cover picture. To add it, type CoverImageCredit in the next empty row on the left, and the credit on the right.", "Illustration by Priya Nair", "ex");
  item("3 · CountdownTarget", "The date and time the countdown ticks down to.", "2026-12-12T11:00:00", "ex");
  item("4 · VenueDetails", "The venue line under the countdown.", "Eden Farms, Bagalur", "ex");
  item("5 · VenueMapLink", "Optional. Your “Get directions” link. Leave blank to search Google Maps automatically.", "", "ex");
  item("6 · HeroEyebrow", "The small italic line above your main title.", "You’re invited to", "ex");
  item("7 · HeroTitle", "Your big main heading.", "Dhwani & Arnesh’s Wedding Celebrations", "ex");
  item("8 · SiteTitle", "The name shown on the browser tab.", "Wedding_Celebrations", "ex");
  item("9 · GreetingTemplate", "Shown once a guest enters their code. Keep {name}. It turns into their name.", "We hope you can join us, {name}.", "ex");
  item("10 · LookupHeading", "The heading above the access code box.", "Find your code", "ex");
  item("11 · LookupSubtext", "The help text under that heading.", "", "ex");
  item("12–15 · Page titles", "The page names in the top menu. Each is also that page’s heading.", "Our Story", "ex");
  item("16 · FooterText", "The small line at the bottom of every page.", "Made with care for the people we love.", "ex");
  item("PageBorderImage", "Optional. Decorative borders on either side of the page on wide screens. Recommended size: 220 px wide and tall.", "", "ex");
  item("Show…Page", "Type No to hide a page. Setting ShowRsvpPage to No closes RSVPs.", "Yes / No", "ex");
  tip("Each page’s banner picture is set on that page’s own tab (Step 4).");
  gap();

  // ---------- STEP 4 Pages ----------
  step("4", "Step 4 — Your pages: Story, FAQ, Travel, Party, RSVP", "");
  item("Page banner", "Recommended size: 1960 × 600 px, with the important part in the centre. Put the link in a BannerImage column, in any one row. For an optional credit, add a BannerCredit column the same way.", "");
  gap(6);
  item("Our Story", "One row per section, in Order. Leave a blank line between paragraphs. ImageURL is an optional photo (recommended size: 1200 px wide) and ImageCredit is an optional small credit under it.", tab("Story", "Open Story tab →"));
  item("FAQ", "One row per question, shown in the order you list them. Keep answers short.", tab("FAQ", "Open FAQ tab →"));
  item("Travel", "Grouped by Category. Address adds a map link. Link and LinkLabel add a button. For a welcome or closing note, use Category Intro or Outro. PhotoURL recommended size: 720 × 520 px. PhotoCredit adds an optional small credit.", tab("Travel", "Open Travel tab →"));
  item("Wedding Party", "One row per person: Name, Role, Bio and PhotoURL. Recommended photo: square, 800 × 800 px. PhotoCredit adds an optional small credit under the photo.", tab("Party", "Open Party tab →"));
  item("RSVP", "The wording of your RSVP form. Leave a cell blank to use the standard wording. For a banner credit, add a row with BannerCredit on the left.", tab("RSVP Questions", "Open RSVP Questions tab →"));
  gap();

  // ---------- STEP 5 Behind the scenes ----------
  step("5", "Step 5 — Groups, messages and replies", "");
  item("Groups", "For families who share one link in a group chat. Add a GroupName, Events and Code. Guests pick their group on the RSVP page. With the right code they’re in straight away. Without it, they wait for your approval.", tab("Groups", "Open Groups tab →"));
  item("Pending Guests", "Appears automatically when someone joins through a group. Select their row, then choose RSVP Tools > Approve selected Pending Guest(s). They’re added to Guests and sent their link.", tab("Pending Guests", "Open Pending Guests tab →", true));
  item("Invitations", "Matches each guest with their invitation PDF. One row per set of events, with a Google Drive link to the PDF.", tab("Invitations", "Open Invitations tab →"));
  item("Message Templates", "The wording of the emails and WhatsApp messages sent to guests. Use {name}, {code}, {events} and {link}. They’re filled in for each guest.", tab("Message Templates", "Open Message Templates tab →"));
  item("Sending", "Use the RSVP Tools menu to email guests, create WhatsApp links, or remind people who haven’t replied. You’ll see a summary before anything is sent.", "");
  item("Dashboard", "A summary of replies. Choose RSVP Tools > Refresh Dashboard for the latest numbers.", tab("Dashboard", "Open Dashboard tab →", true));
  gap();
  sh.getRange(r, 2, 1, 3).merge().setValue("Questions? Ask whoever set up your site.");
  fill(sh.getRange(r, 1, 1, 5), SH.cream, SH.muted, false, 10); sh.setRowHeight(r, 30); r++;

  // ---------- Fill the contents list ----------
  var toc = [];
  anchors.forEach(function (a) {
    toc.push([ '=HYPERLINK("#gid=' + sh.getSheetId() + '&range=B' + a.row + '","' + a.title.replace(/"/g, "") + '")' ]);
  });
  for (var i = 0; i < toc.length; i++) {
    var cell = sh.getRange(tocStart + 1 + i, 2, 1, 3).merge();
    cell.setFormula(toc[i][0]);
    fill(sh.getRange(tocStart + 1 + i, 1, 1, 5), SH.cream, SH.wine, false, 11);
    sh.setRowHeight(tocStart + 1 + i, 24);
  }
  for (var j = toc.length; j < tocRows; j++) sh.setRowHeight(tocStart + 1 + j, 4);

  // Trim unused rows below the content
  if (sh.getMaxRows() > r + 2) sh.deleteRows(r + 2, sh.getMaxRows() - r - 2);
  sh.setFrozenRows(0);
  sh.getRange("B1").activate();
  lockCells_(ss);
  SpreadsheetApp.getUi().alert("Start Here tab built.");
}


/* Greys out and protects the cells that drive the site, so they are not edited by accident. */
function lockCells_(ss) {
  // remove earlier locks made by this script
  ss.getSheets().forEach(function (t) {
    t.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(t.getProtections(SpreadsheetApp.ProtectionType.SHEET))
      .forEach(function (p) { if (p.getDescription() === LOCK_DESC) p.remove(); });
  });
  function lock(range) {
    var p = range.protect().setDescription(LOCK_DESC);
    if (!LOCK_STRICT) { p.setWarningOnly(true); return; }
    var me = Session.getEffectiveUser();
    p.addEditor(me);
    p.removeEditors(p.getEditors().filter(function (u) { return u.getEmail() !== me.getEmail(); }));
    if (p.canDomainEdit()) p.setDomainEdit(false);
  }
  function grey(range) { range.setFontColor(SH.muted).setBackground(SH.card); }

  var start = ss.getSheetByName(SH_NAME);
  if (start) lock(start.getRange(1, 1, start.getMaxRows(), start.getMaxColumns()));

  // Key columns (the names the website looks for)
  ["Settings", "Message Templates", "RSVP Questions"].forEach(function (n) {
    var t = ss.getSheetByName(n); if (!t) return;
    var rng = t.getRange(1, 1, t.getMaxRows(), 1);
    grey(rng); lock(rng);
  });
  // Column headings on every data tab
  ["Events", "Guests", "Groups", "Invitations", "Story", "FAQ", "Travel", "Party", "Pending Guests"].forEach(function (n) {
    var t = ss.getSheetByName(n); if (!t) return;
    var rng = t.getRange(1, 1, 1, Math.max(1, t.getLastColumn()));
    grey(rng); lock(rng);
  });
}
