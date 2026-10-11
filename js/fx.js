/* Decorative motion for "Switched On". Nothing here changes the data or the charts.
   Everything is skipped when the visitor has "reduce motion" switched on. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add(reduce ? "no-motion" : "motion");

  /* ---------- 1. Live TV static in the header (canvas noise) ---------- */
  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const cv = document.createElement("canvas");
    cv.className = "static-canvas";
    cv.width = 192; cv.height = 108;
    hero.prepend(cv);
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(cv.width, cv.height);
    let visible = true, last = 0;
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hero);
    (function frame(t) {
      if (visible && t - last > 70) {           // ~14 fps feels like real analogue snow
        last = t;
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = Math.random() * 255 | 0;
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      requestAnimationFrame(frame);
    })(0);
  }

  /* ---------- 2. Count-up numbers (hero stats, fact panels, takeaways) ---------- */
  function countUp(el) {
    const original = el.textContent;
    const parts = original.split(/(\d+(?:\.\d+)?)/);   // keep text, animate the numbers
    if (parts.length < 2) return;
    const targets = parts.map(p => (/^\d+(\.\d+)?$/.test(p) ? parseFloat(p) : null));
    const decimals = parts.map(p => (p.includes(".") ? p.split(".")[1].length : 0));
    const start = performance.now(), dur = 1200;
    (function tick(now) {
      const k = Math.min(1, (now - start) / dur), ease = 1 - Math.pow(1 - k, 3);
      el.textContent = parts.map((p, i) => targets[i] === null ? p : (targets[i] * ease).toFixed(decimals[i])).join("");
      if (k < 1) requestAnimationFrame(tick); else el.textContent = original;
    })(start);
  }

  /* ---------- 3. Reveal on scroll: cards "tune in" through a burst of static ---------- */
  const revealables = document.querySelectorAll(".card, .banner, .photo, .ch-head, .takeaways > div");
  const counters = document.querySelectorAll(".stats b, .fact b");
  if (!reduce && "IntersectionObserver" in window) {
    revealables.forEach(el => el.classList.add("reveal"));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("in");
        if (el.classList.contains("card")) {
          el.classList.add("tuning");
          setTimeout(() => el.classList.remove("tuning"), 700);
        }
        el.querySelectorAll && el.querySelectorAll(".fact b").forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(el => io.observe(el));
    document.querySelectorAll(".stats b").forEach(b => setTimeout(() => countUp(b), 900));
  }

  /* ---------- 4. Reading-progress bar + active chapter in the nav ---------- */
  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);
  const links = [...document.querySelectorAll(".toc a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href")));
  function onScroll() {
    const h = document.documentElement;
    bar.style.transform = "scaleX(" + (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) + ")";
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 140) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 5. The TV switches off when the ending scrolls into view ---------- */
  const ending = document.querySelector(".ending");
  if (ending && !reduce) {
    new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) { ending.classList.add("switch-off"); o.disconnect(); }
    }, { threshold: 0.35 }).observe(ending);
  }
})();
