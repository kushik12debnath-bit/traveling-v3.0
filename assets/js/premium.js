/* ============================================================
   Alive Dreams Holidays — premium interaction layer
   Progressive enhancement. No dependencies.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function raf(fn) { return window.requestAnimationFrame(fn); }

  /* ---------- Scroll progress ---------- */
  var progress = doc.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  doc.body.appendChild(progress);
  var progressBar = $("span", progress);
  var progressTick = false;

  function updateProgress() {
    var max = doc.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    progressTick = false;
  }
  window.addEventListener("scroll", function () {
    if (!progressTick) {
      progressTick = true;
      raf(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- Hero parallax ---------- */
  var heroMedia = $(".hero-cinema .hero-media");
  if (heroMedia && !reduceMotion) {
    var parallaxTick = false;
    var updateParallax = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.25) {
        heroMedia.style.transform = "translate3d(0," + (y * 0.13).toFixed(2) + "px,0)";
      }
      parallaxTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!parallaxTick) {
        parallaxTick = true;
        raf(updateParallax);
      }
    }, { passive: true });
  }

  /* ---------- Reveal system for elements without [data-reveal] ---------- */
  if ("IntersectionObserver" in window) {
    var revealSelectors = [
      ".section-head", ".featured-head", ".atlas-head", ".atlas-list",
      ".style-card", ".dest-card:not([data-reveal])", ".icon-card:not([data-reveal])",
      ".stat-band:not([data-reveal])", ".split > *", ".t-head",
      ".faq-intro", ".faq-list", ".cta", ".footer-main", ".form-card",
      ".contact-card", ".job", ".detail-card", ".aside-card", ".gallery-item",
      ".page-hero .lede", ".page-hero .hero-actions", ".fact-bar", ".job-list",
      ".map-card", ".quote-card", ".person", ".step"
    ];
    var candidates = $$(revealSelectors.join(",")).filter(function (el) {
      if (el.closest("[data-reveal]")) return false;
      if (el.classList.contains("reveal")) return false;
      return true;
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -30px" });

    candidates.forEach(function (el, i) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) return;
      el.classList.add("reveal");
      el.style.setProperty("--delay", String(Math.min(i % 8, 6) * 55) + "ms");
      revealObserver.observe(el);
    });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = $$(".hero-meta strong, .stat strong, .stat-band strong, .hero-proof strong");
  function animateCount(el) {
    var original = el.textContent.trim();
    if (/x\d/i.test(original)) return;
    var match = original.match(/^([\d,]+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ""), 10);
    var suffix = match[2] || "";
    if (!isFinite(target) || target === 0) return;
    var start = null;
    var duration = 1300;
    el.setAttribute("aria-label", original);
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) raf(tick);
      else el.textContent = original;
    }
    raf(tick);
  }
  if (!reduceMotion && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.65 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Atlas preview ---------- */
  var atlas = $("[data-atlas]");
  if (atlas) {
    var preview = $(".atlas-preview", atlas);
    var previewImg = preview ? $("img", preview) : null;
    var previewKicker = preview ? $(".preview-kicker", preview) : null;
    var previewTitle = preview ? $("strong", preview) : null;
    var previewMeta = preview ? $(".preview-meta", preview) : null;
    var preloaded = {};

    function preload(src) {
      if (!src || preloaded[src]) return;
      var img = new Image();
      img.src = src;
      preloaded[src] = true;
    }

    $$(".atlas-item", atlas).forEach(function (item) {
      preload(item.getAttribute("data-atlas-img"));
      function activate() {
        if (!preview || !previewImg) return;
        var src = item.getAttribute("data-atlas-img");
        var title = item.getAttribute("data-atlas-title") || $(".atlas-name", item).textContent;
        var meta = item.getAttribute("data-atlas-meta") || "";
        if (previewKicker) previewKicker.textContent = "The atlas · " + (item.getAttribute("data-atlas-index") || "");
        if (previewTitle) previewTitle.textContent = title;
        if (previewMeta) previewMeta.textContent = meta;
        if (src && previewImg.getAttribute("src") !== src) {
          previewImg.style.opacity = "0";
          var next = new Image();
          next.onload = function () {
            previewImg.src = src;
            previewImg.style.opacity = "1";
          };
          next.src = src;
        }
      }
      item.addEventListener("mouseenter", activate);
      item.addEventListener("focus", activate);
    });
  }

  /* ---------- Offer rail arrows ---------- */
  var offerRail = $("[data-offer-rail]");
  if (offerRail) {
    function offerStep() {
      var card = $(".offer-poster", offerRail);
      if (!card) return 340;
      var styles = getComputedStyle(offerRail.querySelector(".poster-track") || offerRail);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    $$("[data-offer-prev]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        offerRail.scrollBy({ left: -offerStep(), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    $$("[data-offer-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        offerRail.scrollBy({ left: offerStep(), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".btn-primary, .btn-ghost, .rail-btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 6;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 5;
        btn.style.setProperty("--tx", x.toFixed(2) + "px");
        btn.style.setProperty("--ty", y.toFixed(2) + "px");
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ---------- Header current state ---------- */
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  $$(".nav-link[href]").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var normalized = href.replace(/\/+$/, "") || "/";
    if (normalized === path) link.setAttribute("aria-current", "page");
    else if (path !== "/" && normalized === "/" && link.getAttribute("aria-current")) link.removeAttribute("aria-current");
  });
  if (path.indexOf("/trips/") === 0) {
    var dropBtn = $(".nav-drop-btn");
    if (dropBtn) dropBtn.setAttribute("aria-current", "page");
  }

  /* ---------- Mobile menu focus handling ---------- */
  var navToggle = $("#nav-toggle");
  var mobileMenu = $("#mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      window.setTimeout(function () {
        if (root.classList.contains("menu-open")) {
          var first = $("a, button", mobileMenu);
          if (first) first.focus();
        }
      }, 80);
    });
    // Capture phase so focus returns to the toggle even though site.js
    // closes the menu in its own keydown handler.
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && (root.classList.contains("menu-open") || mobileMenu.contains(doc.activeElement))) {
        window.setTimeout(function () { navToggle.focus(); }, 0);
      }
    }, true);
    doc.addEventListener("keydown", function (e) {
      if (!root.classList.contains("menu-open")) return;
      if (e.key === "Escape") return;
      if (e.key !== "Tab") return;
      var focusables = $$("a[href], button:not([disabled])", mobileMenu).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var firstEl = focusables[0];
      var lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && doc.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    });
  }

  /* ---------- Image decode polish ---------- */
  $$("img").forEach(function (img) {
    if (img.complete) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
    }
  });
})();
