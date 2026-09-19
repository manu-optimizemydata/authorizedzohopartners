(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-header .nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
  }

  function carousel(selector, interval) {
    const slides = document.querySelectorAll(selector);
    if (!slides.length) return { show() {} };
    let i = 0;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("is-on", idx === i));
    }
    setInterval(() => show(i + 1), interval);
    return { show: (dir) => show(i + dir) };
  }

  const hero = carousel(".hero-slide", 3000);
  document.querySelectorAll(".hero-nav button").forEach((btn) => {
    btn.addEventListener("click", () => hero.show(Number(btn.dataset.dir)));
  });
  const gallery = carousel(".gallery-slide", 3000);
  document.querySelectorAll("[data-gallery]").forEach((btn) => {
    btn.addEventListener("click", () => gallery.show(Number(btn.dataset.gallery)));
  });
})();
