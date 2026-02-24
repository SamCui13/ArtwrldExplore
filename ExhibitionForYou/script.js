const feed = document.getElementById("feed");
const hint = document.getElementById("hint");

const svg = {
  pin: () => `
    <svg class="i-sm i-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `,
  cal: () => `
    <svg class="i-sm i-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  `,
  ext: () => `
    <svg class="i-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  `,
  save: () => `
    <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
  `,
  share: () => `
    <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
  `,
};

function dotsHTML(count) {
  return Array.from({ length: count })
    .map((_, i) => `<span class="dot ${i === 0 ? "is-active" : ""}" data-dot="${i}"></span>`)
    .join("");
}

function cardHTML(ex, mediumName) {
  return `
  <section class="card" aria-label="${ex.exhibitionTitle}">
    <img class="card__img" src="${ex.imageUrl}" alt="${ex.exhibitionTitle}" />
    <div class="card__overlay"></div>

    <header class="top">
      <div class="pills">
        <span class="pill">${mediumName}</span>
      </div>

      <div class="dots" aria-hidden="true"></div>

      <div class="pills" aria-hidden="true"></div>
    </header>

    <div class="bottom">
      <div class="meta">
        <div class="title">
          <h1>${ex.exhibitionTitle}</h1>
          <div class="artist">${ex.artistName}</div>
        </div>

        <div class="kv">
          <div class="row">
            ${svg.pin()}
            <div class="row__text">
              <div class="gallery">${ex.galleryName}</div>
              <div class="addr">${ex.address}</div>
              <div class="area">${ex.locationArea}</div>
            </div>
          </div>

          <div class="row">
            ${svg.cal()}
            <div class="row__text">
              <div>${ex.exhibitionDates}</div>
            </div>
          </div>
        </div>

        <a class="cta" href="${ex.exhibitionUrl}" target="_blank" rel="noreferrer">
          <span>View Exhibition</span>
          ${svg.ext()}
        </a>
      </div>

      <div class="actions">
        <button class="action" type="button" aria-label="Save">
          <div class="action__circle">${svg.save()}</div>
          <div class="action__label">Save</div>
        </button>
        <button class="action" type="button" aria-label="Share">
          <div class="action__circle">${svg.share()}</div>
          <div class="action__label">Share</div>
        </button>
      </div>
    </div>
  </section>
  `;
}

function mediumHTML(m) {
  const cards = (m.exhibitions || []).map((ex) => cardHTML(ex, m.name)).join("");
  return `
  <section class="medium" data-medium="${m.id}">
    <div class="carousel" data-carousel="${m.id}">
      ${cards}
    </div>
  </section>
  `;
}

function mount(mediums) {
  feed.innerHTML = mediums.map(mediumHTML).join("");

  mediums.forEach((m) => {
    const mediumEl = feed.querySelector(`[data-medium="${m.id}"]`);
    if (!mediumEl) return;

    const dots = dotsHTML((m.exhibitions || []).length);
    mediumEl.querySelectorAll(".top .dots").forEach((d) => (d.innerHTML = dots));
  });

  window.setTimeout(() => hint?.classList.add("is-hidden"), 1800);

  mediums.forEach((m) => {
    const mediumEl = feed.querySelector(`[data-medium="${m.id}"]`);
    if (!mediumEl) return;

    const carousel = mediumEl.querySelector(`[data-carousel="${m.id}"]`);
    if (!carousel) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = carousel.clientWidth || 1;
        const idx = Math.round(carousel.scrollLeft / w);

        mediumEl.querySelectorAll(".top .dot").forEach((dot) => {
          dot.classList.toggle("is-active", Number(dot.dataset.dot) === idx);
        });
      });
    };

    carousel.addEventListener("scroll", onScroll, { passive: true });
  });
}

async function loadData() {
  const res = await fetch("./exhibitions.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load exhibitions.json (${res.status})`);
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.mediums)) return json.mediums;
  throw new Error("Invalid exhibitions.json: expected an array or { mediums: [...] }");
}

(async function init() {
  try {
    const mediums = await loadData();
    mount(mediums);
  } catch (err) {
    console.error(err);
    feed.innerHTML = `
      <div style="padding:24px; color: rgba(255,255,255,.9); font-family: inherit;">
        <div style="font-size:18px; font-weight:700; margin-bottom:8px;">Could not load exhibitions</div>
        <div style="opacity:.8; line-height:1.4;">
          Make sure <code>exhibitions.json</code> is in the same folder as <code>index.html</code>, and open the site via a local server (e.g. Live Server).
        </div>
      </div>
    `;
  }
})();
