(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-header .nav");
  if (!toggle || !nav) return;

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "nav-backdrop";
  backdrop.setAttribute("aria-label", "Close menu");
  document.body.appendChild(backdrop);

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  backdrop.addEventListener("click", () => setOpen(false));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
})();
