# Your event site — setup guide (no coding required)

This site has three parts:

1. **A Google Sheet** — six tabs where you (and anyone you invite) manage
   guests, events, wedding party, FAQs, your story, and site-wide settings
   like the cover photo and countdown. This is the only place you'll make
   changes day to day.
2. **The website files** (already built, in this folder) — hosted for free
   on GitHub Pages. Once set up, you should rarely if ever need to open
   these again.
3. **A personal link per guest** — like `yoursite.com/?g=SAMIRA24`. Each
   guest only sees the events tagged to their code.

You will not need to write or edit any code. There's exactly one file
(`config.js`) with six lines you'll paste links into, one time, during
setup. After that, everything — wording, photos, the countdown, guest
list, all of it — is edited in the spreadsheet.

---

## Part 1 — Set up your Google Sheet

Go to [sheets.google.com](https://sheets.google.com) and create a new
spreadsheet. Create six tabs (right-click a tab at the bottom > Duplicate,
or the `+` button), named exactly as below. For each, either import the
matching sample CSV from this folder (File > Import > Upload) to see the
format, or type the column headers yourself into row 1.

### 1. Guests

| Code | Name | Events |
|------|------|--------|
| SAMIRA24 | Samira & family | MEHNDI;WEDDING;RECEPTION |
| RAVI24 | Ravi Kumar | WEDDING;RECEPTION |

- **Code**: a unique code per guest/household — this becomes part of
  their personal link.
- **Name**: used in the greeting they see.
- **Events**: the ID(s) of every event they're invited to, separated by
  semicolons. IDs are defined in the Events tab below.

### 2. Events

Columns: `ID`, `Name`, `Date`, `Time`, `Location`, `Description`,
`ImageURL`, `EmbedURL`, `RSVPLink`

- **ID**: a short code referenced from the Guests tab (e.g. `WEDDING`).
- **ImageURL**: a direct link to an image *or a GIF* — see the image
  troubleshooting section below for the right link format, especially
  for Google Drive.
- **EmbedURL**: optional — a link to interactive content, like a
  Storyline export hosted on Vercel. Paste the live URL and it's
  embedded automatically.
- **RSVPLink**: a Google Form link, if you want per-event RSVP tracking.

### 3. Party

Columns: `Name`, `Role`, `Bio`, `PhotoURL`

One row per member of the wedding party. `PhotoURL` is optional.

### 4. FAQ

Columns: `Question`, `Answer`

One row per question. They render as an expandable list, in sheet order.

### 5. Story

Columns: `Order`, `Heading`, `Text`, `ImageURL`

This is what powers the "Our Story" page — one row per section.

- **Order**: a number (1, 2, 3…) controlling what appears first.
- **Heading**: section title, e.g. "How we met."
- **Text**: the story itself. To create separate paragraphs within one
  section, leave a fully blank line between them in the cell (in
  Google Sheets, press **Alt+Enter** / **Option+Return** for a line
  break inside a cell).
- **ImageURL**: optional photo for that section.

Add, remove, or reorder rows any time — the page rebuilds itself from
whatever's in this tab.

### 6. Settings

Columns: `Key`, `Value` — one row per setting. Use these keys exactly:

| Key | Value example | Notes |
|-----|----------------|-------|
| CoverImage | `https://...` | Large homepage photo |
| CountdownTarget | `2027-03-14T11:00:00` | Exact format: `YYYY-MM-DDTHH:MM:SS`, 24-hour time |
| StoryBannerImage | `https://...` | Small banner on the Our Story page |
| PartyBannerImage | `https://...` | Small banner on the Wedding Party page |
| FaqBannerImage | `https://...` | Small banner on the FAQs page |
| HeroEyebrow | `You're invited` | Small line above the homepage title |
| HeroTitle | `Our Celebration` | The big homepage heading |
| SiteTitle | `Our Celebration` | What shows in the browser tab |
| GreetingTemplate | `So glad you're joining us, {name}.` | Shown once a guest enters their code. `{name}` is replaced automatically |
| LookupHeading | `Find your invitation` | Heading above the access code box |
| LookupSubtext | `This was included in the message we sent you...` | Line under that heading |
| StoryPageTitle | `Our story` | Heading on the Our Story page **and** its nav bar link |
| PartyPageTitle | `Wedding party` | Heading on the Wedding Party page **and** its nav bar link |
| FaqPageTitle | `Frequently asked questions` | Heading on the FAQs page **and** its nav bar link |
| FooterText | `Made with care for the people we love.` | Small line at the bottom of every page |

Leave any Value blank and that image/feature just won't show (or the
built-in default text is used) — no other file needs to change either
way.

---

## Part 2 — Publish every tab, and share edit access

**Publish each of the six tabs so the site can read them:**

1. File > Share > **Publish to web**.
2. Under "Link", pick one specific tab (e.g. Guests), set format to
   **Comma-separated values (.csv)**, click **Publish**.
3. Copy the link you're given.
4. Repeat for all six tabs — you'll end up with six separate links.
5. If offered, tick "Automatically republish when I make changes" so
   future edits show up on the site without repeating this step.

**Share edit access with helpers:** click the normal blue **Share**
button (top right — not "publish to web") and add people by email as
**Editors**. They can now update anything on the site directly through
the spreadsheet — no code, no GitHub account needed for them.

---

## Part 3 — Paste your six links into config.js (one time)

Open `config.js` (in this folder, or later directly on GitHub) and
replace the six placeholder lines with the links from Part 2:

```js
GUESTS_CSV_URL:   "https://docs.google.com/.../pub?output=csv",
EVENTS_CSV_URL:   "https://docs.google.com/.../pub?output=csv",
PARTY_CSV_URL:    "https://docs.google.com/.../pub?output=csv",
FAQ_CSV_URL:      "https://docs.google.com/.../pub?output=csv",
STORY_CSV_URL:    "https://docs.google.com/.../pub?output=csv",
SETTINGS_CSV_URL: "https://docs.google.com/.../pub?output=csv",
```

This is the only file-level edit in the whole setup, and you shouldn't
need to touch it again after this — everything else lives in the sheet.

---

## Part 4 — Put it on GitHub Pages (free hosting)

You don't need Git installed or the command line — GitHub's website lets
you upload files by dragging them in.

1. Go to [github.com](https://github.com) and sign in (your account:
   **AnandamRavi**).
2. Click **New repository**. Name it something like `our-event` and set
   it to **Public** (GitHub Pages requires public on a free account).
   Click **Create repository**.
3. Click **Add file > Upload files**, then drag in every file from this
   folder (all the `.html`, `.js`, and `.css` files, with your six links
   already pasted into `config.js`). Commit the upload.
4. Go to the repo's **Settings > Pages**.
5. Under "Build and deployment", set **Source** to **Deploy from a
   branch**, branch **main**, folder **/(root)**. Save.
6. GitHub will give you a URL like
   `https://anandamravi.github.io/our-event/` within a minute or two.
   That's your live site.

From here on, you should not need to open GitHub again for routine
content changes — only for structural changes to the site itself
(which you can always come back and ask about).

---

## Part 5 — Embedding your Storyline content from Vercel

Since your Storyline export is already hosted on Vercel:

1. Copy the live URL of your Storyline export from Vercel.
2. Paste it into the **EmbedURL** cell for the relevant event in your
   Events tab.
3. It's wrapped in an `<iframe>` automatically.

Two things worth checking on the Vercel side if the embed shows blank:

- **Framing allowed:** if a `X-Frame-Options` or
  `Content-Security-Policy: frame-ancestors` header was added (by you or
  a template), remove it, or add your GitHub Pages domain (e.g.
  `https://anandamravi.github.io`) to the allowed `frame-ancestors` list.
- **HTTPS:** the link must be `https://`, not `http://`.

---

## Troubleshooting: images from Google Drive not showing

The normal Drive "Share" link (`drive.google.com/file/d/FILE_ID/view`)
won't display as an image — it's a viewer page, not the file itself.

1. On the file in Drive, click **Share** and set access to **Anyone
   with the link — Viewer**.
2. Copy the share link and pull out the **File ID** — the long string
   between `/d/` and `/view`.
3. Use this format instead: `https://lh3.googleusercontent.com/d/FILE_ID`
   (more reliable than the older `uc?export=view` format, especially
   for GIFs).
4. Use that as the ImageURL / PhotoURL / CoverImage / banner value.

**If a GIF still won't animate**, upload it directly into your GitHub
repo instead (e.g. an `images/` folder, drag-and-drop) and link to it
there: `https://anandamravi.github.io/our-event/images/reception.gif`

Also double check the cell is completely empty (not just a stray space)
if you're trying to remove an image — a lingering space is read as "has
a value" and can leave a broken-image icon behind.

---

## Sending out invitations

Once your site is live, open:

```
https://anandamravi.github.io/our-event/admin.html
```

This page reads your Guests tab and lists every guest's ready-to-send
personal link, with a Copy button next to each.

This page isn't linked from anywhere on the public site, but it also
isn't password-protected — don't post its address publicly, and only
share it with people you trust to see the full guest list.

---

## A note on privacy

This approach is intentionally lightweight, similar in spirit to how
With Joy's guest links worked: a guest's code acts as their access key,
not a password tied to a login. Anyone who has a specific guest's link
can see that guest's events. Nothing is indexed or searchable, and
codes aren't guessable in sequence if you make them a little varied
(e.g. name + a few digits). For a family event this is normally more
than sufficient — just avoid publishing the raw list of codes anywhere
public.

---

## Quick reference: sheet columns

**Guests**

| Column | Required | Notes |
|--------|----------|-------|
| Code | Yes | Unique per guest/household, used in their link |
| Name | Yes | Shown in the greeting |
| Events | Yes | Event IDs this guest can see, separated by `;` |

**Events**

| Column | Required | Notes |
|--------|----------|-------|
| ID | Yes | Short code referenced from Guests > Events |
| Name | Yes | Event title |
| Date | No | Any format Google Sheets understands |
| Time | No | Free text, e.g. `5:00 PM` |
| Location | No | Free text |
| Description | No | Free text |
| ImageURL | No | Static image or GIF, direct link |
| EmbedURL | No | Interactive content (e.g. Storyline export) |
| RSVPLink | No | Link to a Google Form or any RSVP page |

**Party**

| Column | Required | Notes |
|--------|----------|-------|
| Name | Yes | Person's name |
| Role | No | e.g. "Maid of Honor" |
| Bio | No | A line or two about them |
| PhotoURL | No | Direct image link |

**FAQ**

| Column | Required | Notes |
|--------|----------|-------|
| Question | Yes | Shown as the collapsed header |
| Answer | No | Shown when a guest expands it |

**Story**

| Column | Required | Notes |
|--------|----------|-------|
| Order | Yes | Number controlling section order |
| Heading | No | Section title |
| Text | No | Body text; blank line = new paragraph |
| ImageURL | No | Optional photo for that section |

**Settings**

| Key | Notes |
|-----|-------|
| CoverImage | Homepage background photo |
| CountdownTarget | `YYYY-MM-DDTHH:MM:SS`, 24-hour time |
| StoryBannerImage | Banner on Our Story page |
| PartyBannerImage | Banner on Wedding Party page |
| FaqBannerImage | Banner on FAQs page |
| HeroEyebrow | Small line above the homepage title |
| HeroTitle | The big homepage heading |
| SiteTitle | Browser tab title |
| GreetingTemplate | Guest greeting; `{name}` is replaced automatically |
| LookupHeading | Heading above the access code box |
| LookupSubtext | Line under that heading |
| StoryPageTitle | Heading on the Our Story page and its nav link |
| PartyPageTitle | Heading on the Wedding Party page and its nav link |
| FaqPageTitle | Heading on the FAQs page and its nav link |
| FooterText | Line at the bottom of every page |
