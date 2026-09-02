async function loadStory() {
  const container = document.getElementById("story-content");
  if (!CONFIG.STORY_CSV_URL || CONFIG.STORY_CSV_URL.startsWith("PASTE_")) {
    container.innerHTML = "<p>Add your Story tab link to config.js to show your story here.</p>";
    return;
  }

  try {
    const res = await fetch(CONFIG.STORY_CSV_URL, { cache: "no-store" });
    const text = await res.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

    const rows = data
      .filter((r) => r.Heading || r.Text)
      .sort((a, b) => (parseFloat(a.Order) || 0) - (parseFloat(b.Order) || 0));

    container.innerHTML = rows
      .map((r) => {
        const paragraphs = (r.Text || "")
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((p) => `<p>${p.trim()}</p>`)
          .join("");
        const img = (r.ImageURL || "").trim();
        return `
          ${r.Heading ? `<h2>${r.Heading}</h2>` : ""}
          ${img ? `<img src="${img}" alt="${r.Heading || ""}" loading="lazy" onerror="this.style.display='none'">` : ""}
          ${paragraphs}
        `;
      })
      .join("");
  } catch (err) {
    container.innerHTML = "<p>Couldn't load your story right now.</p>";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadStory);
