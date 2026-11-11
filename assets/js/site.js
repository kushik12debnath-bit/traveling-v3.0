/* ============================================================
   Alive Dreams Holidays — shared interactions
   No dependencies. Progressive enhancement only.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove("no-js");

  var WHATSAPP = "918584832681";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Header state ---------- */
  var header = $("#site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  }
  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Floating WhatsApp ---------- */
  var waFloat = $(".wa-float");
  if (waFloat) {
    var toggleFloat = function () {
      waFloat.classList.toggle("show", window.scrollY > 260);
    };
    toggleFloat();
    window.addEventListener("scroll", toggleFloat, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $("#nav-toggle");
  var mobileMenu = $("#mobile-menu");
  var scrim = $("#menu-scrim");

  function setMenu(open) {
    if (!toggle || !mobileMenu) return;
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (scrim) scrim.setAttribute("aria-hidden", String(!open));
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!root.classList.contains("menu-open"));
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); });
  if (mobileMenu) {
    $$("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- Destinations dropdown ---------- */
  var drop = $(".nav-drop");
  var dropBtn = drop ? $(".nav-drop-btn", drop) : null;
  function setDrop(open) {
    if (!drop || !dropBtn) return;
    drop.classList.toggle("open", open);
    dropBtn.setAttribute("aria-expanded", String(open));
  }
  if (dropBtn) {
    var dropCloseTimer = null;
    function clearDropClose() {
      if (dropCloseTimer) {
        clearTimeout(dropCloseTimer);
        dropCloseTimer = null;
      }
    }
    function closeDropSoon() {
      clearDropClose();
      dropCloseTimer = setTimeout(function () {
        setDrop(false);
        dropCloseTimer = null;
      }, 180);
    }
    dropBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      clearDropClose();
      // Hover already previews the menu; a click should keep it open rather
      // than immediately toggling it closed under the pointer.
      if (drop.classList.contains("open") && !drop.matches(":hover")) setDrop(false);
      else setDrop(true);
    });
    drop.addEventListener("mouseenter", function () {
      clearDropClose();
      setDrop(true);
    });
    // The menu sits 12px below the button. Keep a short grace period so
    // crossing that gap does not close the menu before it can be used.
    drop.addEventListener("mouseleave", closeDropSoon);
    drop.addEventListener("focusin", clearDropClose);
    doc.addEventListener("click", function (e) {
      if (!drop.contains(e.target)) {
        clearDropClose();
        setDrop(false);
      }
    });
    drop.addEventListener("focusout", function (e) {
      if (!drop.contains(e.relatedTarget)) setDrop(false);
    });
  }

  /* ---------- Escape closes overlays ---------- */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (root.classList.contains("menu-open")) setMenu(false);
    if (drop && drop.classList.contains("open")) { setDrop(false); if (dropBtn) dropBtn.focus(); }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 960 && root.classList.contains("menu-open")) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$("[data-reveal]");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- FAQ accordion ---------- */
  $$("[data-faq]").forEach(function (list) {
    var items = $$(".faq-item", list);
    items.forEach(function (item, index) {
      var btn = $(".faq-q", item);
      var panel = $(".faq-a", item);
      if (!btn || !panel) return;
      if (!panel.id) panel.id = "faq-panel-" + index + "-" + Math.random().toString(36).slice(2, 7);
      btn.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btn.id || "");
      panel.setAttribute("aria-hidden", item.classList.contains("open") ? "false" : "true");

      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        items.forEach(function (other) {
          other.classList.remove("open");
          var ob = $(".faq-q", other);
          var op = $(".faq-a", other);
          if (ob) ob.setAttribute("aria-expanded", "false");
          if (op) op.setAttribute("aria-hidden", "true");
        });
        if (!isOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
          panel.setAttribute("aria-hidden", "false");
        }
      });
    });
  });

  /* ---------- Hero offer carousel ---------- */
  var offerRail = $("[data-offer-rail]");
  var offerTrack = $("[data-offer-track]");
  var offerPause = $("[data-offer-pause]");
  if (offerRail && offerTrack && offerPause) {
    var offerIndex = 0;
    var offerTimer = null;
    var offerScrollTimer = null;
    var offerReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function offerStep() {
      var card = $(".offer-poster", offerTrack);
      if (!card) return offerRail.clientWidth;
      var styles = getComputedStyle(offerTrack);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function offerMaxIndex() {
      var step = offerStep();
      if (!step) return 0;
      return Math.max(0, Math.ceil((offerRail.scrollWidth - offerRail.clientWidth) / step));
    }

    function offerGoTo(i) {
      var max = offerMaxIndex();
      offerIndex = i > max ? 0 : (i < 0 ? max : i);
      offerRail.scrollTo({
        left: Math.min(offerIndex * offerStep(), offerRail.scrollWidth),
        behavior: offerReduce ? "auto" : "smooth",
      });
    }

    function offerStop() {
      if (offerTimer) {
        clearInterval(offerTimer);
        offerTimer = null;
      }
    }

    function offerPlay() {
      if (offerReduce || offerRail.classList.contains("is-paused")) return;
      offerStop();
      offerTimer = setInterval(function () { offerGoTo(offerIndex + 1); }, 4800);
    }

    offerPause.addEventListener("click", function () {
      var paused = offerRail.classList.toggle("is-paused");
      offerPause.setAttribute("aria-pressed", String(paused));
      offerPause.setAttribute("aria-label", paused ? "Play offer carousel" : "Pause offer carousel");
      offerPause.textContent = paused ? "Play" : "Pause";
      if (paused) offerStop(); else offerPlay();
    });
    offerRail.addEventListener("mouseenter", offerStop);
    offerRail.addEventListener("mouseleave", offerPlay);
    offerRail.addEventListener("focusin", offerStop);
    offerRail.addEventListener("focusout", function (e) {
      if (!offerRail.contains(e.relatedTarget)) offerPlay();
    });
    offerRail.addEventListener("pointerdown", offerStop);
    offerRail.addEventListener("touchend", function () {
      setTimeout(offerPlay, 1600);
    }, { passive: true });
    offerRail.addEventListener("scroll", function () {
      clearTimeout(offerScrollTimer);
      offerScrollTimer = setTimeout(function () {
        var step = offerStep();
        if (step) offerIndex = Math.round(offerRail.scrollLeft / step);
      }, 120);
    }, { passive: true });
    window.addEventListener("resize", function () {
      offerIndex = Math.min(offerIndex, offerMaxIndex());
    });
    offerPlay();
  }

  /* ---------- Testimonial sliders ---------- */
  $$("[data-slider]").forEach(function (slider) {
    var track = $(".t-track", slider);
    var nav = $(".t-nav", slider);
    var prev = $("[data-slider-prev]", slider);
    var next = $("[data-slider-next]", slider);
    if (!track) return;

    function step() {
      var card = $(".t-card", track);
      return card ? card.getBoundingClientRect().width + 18 : 320;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 4;
      if (nav) nav.hidden = track.scrollWidth <= track.clientWidth + 4;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Toasts ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 4200);
  }

  /* ---------- Holiday search + WhatsApp handoff ---------- */
  var hsForm = $("[data-holiday-search]");
  if (hsForm) {
    var hsTabs = $$("[data-holiday-tab]", hsForm);
    var hsTheme = $("[name='theme']", hsForm);
    var hsDest = $("[data-dest-select]", hsForm);
    var hsDestOptions = hsDest ? $$("option[data-cat]", hsDest) : [];

    function hsSelectTab(tab) {
      hsTabs.forEach(function (t) {
        var active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
      });
      var scope = tab.getAttribute("data-scope") || "all";
      if (hsTheme) hsTheme.value = tab.textContent.trim();
      hsDestOptions.forEach(function (option) {
        var show = scope === "all" || scope === "honeymoon" || scope === "group" || option.getAttribute("data-cat") === scope;
        option.hidden = !show;
        option.disabled = !show;
      });
      if (hsDest && hsDest.selectedOptions.length && hsDest.selectedOptions[0].disabled) hsDest.value = "";
    }

    hsTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { hsSelectTab(tab); });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var next = (index + (e.key === "ArrowRight" ? 1 : -1) + hsTabs.length) % hsTabs.length;
        hsTabs[next].focus();
        hsSelectTab(hsTabs[next]);
      });
    });

    hsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(hsForm);
      var lines = ["Hello Alive Dreams Holidays, I'd like help planning a holiday."];
      var labels = {
        theme: "Holiday type",
        destination: "Destination",
        type: "Trip style",
        duration: "Duration",
        travellers: "Travellers"
      };
      Object.keys(labels).forEach(function (key) {
        var field = hsForm.elements[key];
        var value;
        if (field && field.tagName === "SELECT" && field.value && field.selectedOptions && field.selectedOptions.length) {
          value = field.selectedOptions[0].textContent.trim();
        } else {
          value = (data.get(key) || "").toString().trim();
        }
        if (value) lines.push(labels[key] + ": " + value);
      });
      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      var status = $(".hs-status", hsForm);
      if (status) status.textContent = "Opening WhatsApp with your holiday details.";
      toast("Opening WhatsApp with your holiday details…");
    });
  }

  /* ---------- Form validation + WhatsApp handoff ---------- */
  function fieldWrap(input) { return input.closest(".field"); }
  function setInvalid(input, invalid) {
    var wrap = fieldWrap(input);
    if (wrap) wrap.classList.toggle("invalid", invalid);
    input.setAttribute("aria-invalid", String(invalid));
  }
  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (input) {
      var value = (input.value || "").trim();
      var invalid = !value;
      if (!invalid && input.type === "email") invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!invalid && input.type === "tel") invalid = value.replace(/\D/g, "").length < 7;
      setInvalid(input, invalid);
      if (invalid) { ok = false; if (input === doc.activeElement) return; }
    });
    if (!ok) {
      var first = $(".field.invalid input, .field.invalid select, .field.invalid textarea", form);
      if (first) first.focus();
    }
    return ok;
  }
  $$("form[data-wa-form]").forEach(function (form) {
    $$("input,select,textarea", form).forEach(function (input) {
      input.addEventListener("input", function () { setInvalid(input, false); });
      input.addEventListener("change", function () { setInvalid(input, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        toast("Please complete the highlighted fields.");
        return;
      }
      var data = new FormData(form);
      var kind = form.getAttribute("data-wa-form") || "Enquiry";
      var lines = ["Hello Alive Dreams Holidays, I'd like to " + (kind === "Career" ? "apply for a role." : "plan a trip.")];
      var labels = {
        name: "Name", email: "Email", phone: "Phone", trip: "Trip", dates: "Travel dates",
        travellers: "Travellers", role: "Role", message: "Message"
      };
      Object.keys(labels).forEach(function (key) {
        var field = form.elements[key];
        var value;
        if (field && field.tagName === "SELECT" && field.value && field.selectedOptions && field.selectedOptions.length) {
          value = field.selectedOptions[0].textContent.trim();
        } else {
          value = (data.get(key) || "").toString().trim();
        }
        if (value) lines.push(labels[key] + ": " + value);
      });
      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
      var status = $(".form-status", form);
      window.open(url, "_blank", "noopener");
      if (status) {
        status.textContent = kind === "Career"
          ? "Opening WhatsApp — attach your CV in the chat and we'll take it from there."
          : "Opening WhatsApp with your details. If it doesn't open, call +91 85848 32681.";
      }
      toast("Opening WhatsApp with your enquiry…");
      form.reset();
    });
  });

  /* ---------- Career: preselect role ---------- */
  $$("[data-apply-role]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var role = btn.getAttribute("data-apply-role");
      var select = $("#role");
      if (select) {
        select.value = role;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      var target = $("#apply");
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      var name = $("#name");
      if (name) setTimeout(function () { name.focus(); }, reduceMotion ? 0 : 450);
    });
  });

  /* ---------- Book page: preselect trip from URL ---------- */
  var tripSelect = $("#trip");
  if (tripSelect) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("trip");
    if (wanted) {
      Array.prototype.forEach.call(tripSelect.options, function (option) {
        if (option.value === wanted) tripSelect.value = wanted;
      });
    }
  }

  /* ---------- Gallery filter + lightbox ---------- */
  var gallery = $("[data-gallery]");
  if (gallery) {
    var filterBtns = $$("[data-filter]", gallery);
    var items = $$(".gallery-item", gallery);
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        items.forEach(function (item) {
          var show = filter === "all" || item.getAttribute("data-cat") === filter;
          item.hidden = !show;
        });
      });
    });

    var dialog = $("#lightbox");
    if (dialog && typeof dialog.showModal === "function") {
      var img = $("img", dialog);
      var caption = $("[data-lightbox-caption]", dialog);
      var current = 0;
      var visible = [];
      var opener = null;

      function refreshVisible() {
        visible = items.filter(function (item) { return !item.hidden; });
      }
      function show(index) {
        refreshVisible();
        if (!visible.length) return;
        current = (index + visible.length) % visible.length;
        var item = visible[current];
        var source = $("img", item);
        img.src = source.getAttribute("src");
        img.alt = source.getAttribute("alt") || "";
        caption.textContent = item.getAttribute("data-title") || "Alive Dreams gallery";
      }
      items.forEach(function (item) {
        item.addEventListener("click", function () {
          opener = item;
          refreshVisible();
          show(visible.indexOf(item));
          dialog.showModal();
        });
        item.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            item.click();
          }
        });
      });
      $("[data-lightbox-close]", dialog).addEventListener("click", function () { dialog.close(); });
      $("[data-lightbox-prev]", dialog).addEventListener("click", function () { show(current - 1); });
      $("[data-lightbox-next]", dialog).addEventListener("click", function () { show(current + 1); });
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog) dialog.close();
      });
      dialog.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      });
      dialog.addEventListener("close", function () {
        if (opener) opener.focus();
      });
    }
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
