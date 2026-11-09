/* invite-icons.js: per-template event icons, without changing invite.js.
   Load it right AFTER invite.js (in index.html, invite-builder.html and invite-preview.html).

   In the Events tab, the InviteIcon cell can now hold:
     - just a file name, e.g.  icon-wedding.png   -> that file inside whichever template is chosen
     - a full link or a path with folders          -> used as is, for every template (as before)
     - nothing                                     -> icon-<event ID in lower case>.png in the chosen template
   A template can also list its own icons in template.json, by event ID (this wins over the sheet):
     "icons": { "TAMIL": "icon-wedding.png", "BENGALI": "icon-bengali-wedding.png" }
   If the chosen template has no such file, no picture is shown for that event. */
(function () {
  "use strict";
  var orig = window.renderGeneratedInvite;
  if (!orig || orig.__iconShim) return;

  var isBare = function (v) { return v && !/[\/:\\]/.test(v); };

  // The file this event should use inside template T, or "" to leave it to invite.js.
  function iconPath(ev, T) {
    T = T || {};
    var id = String(ev.ID || "").trim().toLowerCase();
    var cell = String(ev.InviteIcon || "").trim();
    var file = "";
    var map = T.icons || {};
    Object.keys(map).forEach(function (k) { if (String(k).trim().toLowerCase() === id) file = map[k]; });
    if (!file && isBare(cell)) file = cell;
    if (!file && !cell && id) file = "icon-" + id + ".png";
    return file ? (T._base || "") + file : "";
  }

  async function wrapped(opts) {
    try {
      var T = await orig.loadTemplate((opts.settings || {}).InviteTemplate);
      opts = Object.assign({}, opts, {
        events: (opts.events || []).map(function (ev) {
          var p = iconPath(ev, T), id = String(ev.ID || "").trim();
          var out = Object.assign({}, ev);
          if (id !== ev.ID) out.ID = id;               // stray spaces in an ID no longer break matching
          if (p) out.InviteIcon = p;
          return out;
        })
      });
    } catch (e) { /* fall back to the plain behaviour */ }
    return orig(opts);
  }
  Object.keys(orig).forEach(function (k) { wrapped[k] = orig[k]; });   // defaults, loadTemplate, templateSettings
  wrapped.iconPath = iconPath;
  wrapped.__iconShim = true;
  window.renderGeneratedInvite = wrapped;
})();
