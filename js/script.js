/* ============ Ka Mashila Poultry Farm – interactions ============ */

const CONTACT = {
  whatsapp: "27637394708",              // +27 63 739 4708
  email: "kamashila26@gmail.com",
  facebook: "https://www.facebook.com/share/p/1cjMoPo2Jo/"
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ---------- Footer year ---------- */
const yr = $("#year");
if (yr) yr.textContent = new Date().getFullYear();

/* ---------- Nav: scrolled state + mobile menu ---------- */
const nav = $("#nav");
if (nav) {
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30 || nav.dataset.solid === "1");
  if (nav.classList.contains("scrolled")) nav.dataset.solid = "1";
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

const navToggle = $("#navToggle");
const navLinks  = $("#navLinks");
function setMenu(open) {
  if (!navLinks || !navToggle) return;
  navLinks.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}
if (navToggle) {
  navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => setMenu(false)));
}

/* ---------- Reveal on scroll ---------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
    io.observe(el);
  });
} else {
  $$(".reveal").forEach(el => el.classList.add("in"));
}

/* ---------- Hero logo: 3D tilt on pointer move ---------- */
const tilt = $("#tilt");
if (tilt && window.matchMedia && window.matchMedia("(hover:hover)").matches) {
  const art = tilt.parentElement;
  art.addEventListener("pointermove", e => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  art.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
}

/* ---------- FAQ accordion ---------- */
$$(".acc__q").forEach(btn => {
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    $$(".acc__q").forEach(b => {
      b.setAttribute("aria-expanded", "false");
      b.nextElementSibling.style.maxHeight = null;
    });
    if (!open) {
      btn.setAttribute("aria-expanded", "true");
      const panel = btn.nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

/* ---------- Gallery lightbox (products page) ---------- */
const lb = $("#lightbox");
if (lb) {
  const items = $$(".gallery__btn").map(btn => {
    const img = $("img", btn);
    return { src: img.getAttribute("src"), alt: img.alt, cap: $("figcaption", btn.parentElement).textContent };
  });
  let idx = 0, lastFocus = null;
  const lbImg = $("#lbImg"), lbCap = $("#lbCap");

  function show(i) {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
    lbCap.textContent = items[idx].cap;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".gallery__btn").forEach(btn => btn.addEventListener("click", () => openLb(Number(btn.dataset.index))));
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => show(idx - 1));
  $("#lbNext").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  // swipe on touch screens
  let sx = null;
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
}

/* ---------- Contact form (opens WhatsApp or email) ---------- */
const form = $("#contactForm");
if (form) {
  const nameEl = $("#cName"), msgEl = $("#cMsg");
  [nameEl, msgEl].forEach(el => el.addEventListener("input", () => el.classList.remove("invalid")));

  function valid() {
    const okName = nameEl.value.trim().length >= 2;
    const okMsg  = msgEl.value.trim().length >= 3;
    nameEl.classList.toggle("invalid", !okName);
    msgEl.classList.toggle("invalid", !okMsg);
    if (!okName) { nameEl.focus(); toast("Please enter your name"); return false; }
    if (!okMsg)  { msgEl.focus();  toast("Please write a message");  return false; }
    return true;
  }
  const body = () => `Hi Ka Mashila Poultry Farm,\n\n${msgEl.value.trim()}\n\nFrom: ${nameEl.value.trim()}`;

  $("#sendWa").addEventListener("click", () => {
    if (!valid()) return;
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body())}`, "_blank", "noopener");
  });
  $("#sendMail").addEventListener("click", () => {
    if (!valid()) return;
    const subject = `Message from ${nameEl.value.trim()} – Ka Mashila Poultry Farm`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
  });
  form.addEventListener("submit", e => e.preventDefault());
}
