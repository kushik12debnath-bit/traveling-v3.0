/* Static site generator — Alive Dreams Holidays
   Builds multi-page HTML from the content published on alivedreams.co.in. */
"use strict";

// The premium site is now maintained as static HTML. This generator predates
// that redesign and would overwrite it, so it is opt-in only.
if (process.env.ALLOW_LEGACY_REBUILD !== "1") {
  console.error("Legacy generator disabled. The premium pages are canonical; set ALLOW_LEGACY_REBUILD=1 only if you intend to overwrite them.");
  process.exit(0);
}
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const WA = "918584832681";
const PHONE = "+91 85848 32681";
const PHONE_LINK = "tel:+918584832681";
const EMAIL = "info@alivedreams.co.in";
const SITE = "https://alivedreams.co.in";
const FACEBOOK = "https://www.facebook.com/profile.php?id=100084877547673";
const X = "https://x.com/alivereams";
const LINKEDIN = "https://www.linkedin.com/company/alive-dreams-holidays-pvt-ltd/";
const INSTAGRAM = "https://www.instagram.com/alivedreamsholidays";

const TRIPS = [
  {
    slug: "himalayas", title: "Himalayas", cardTitle: "Himalayas", cat: "domestic", kicker: "India",
    route: "Ladakh • Kashmir • Sikkim • Bhutan border",
    dests: ["Ladakh", "Kashmir", "Sikkim", "Bhutan border"],
    dates: "12 Jun – 20 Jun", duration: "8 Nights / 9 Days", days: 9, rating: "5.0",
    type: "Mountains", price: null, image: "/assets/img/trip-himalayas.jpg",
    alt: "Snow-capped Himalayan landscape",
  },
  {
    slug: "royal-north", title: "Royal North", cardTitle: "Royal North", cat: "domestic", kicker: "India",
    route: "Rajasthan • Agra • Varanasi • Amritsar",
    dests: ["Rajasthan", "Agra", "Varanasi", "Amritsar"],
    dates: "12 Jun – 20 Jun", duration: "2 Nights / 3 Days", days: 3, rating: "5.0",
    type: "Heritage", price: null, image: "/assets/img/trip-royal-north.jpg",
    alt: "Heritage architecture of North India",
  },
  {
    slug: "south-india", title: "South India", cardTitle: "South India", cat: "domestic", kicker: "India",
    route: "Kerala • Coorg • Hampi • Tamil Nadu",
    dests: ["Kerala", "Coorg", "Hampi", "Tamil Nadu"],
    dates: "25 Jun – 30 Jun", duration: "2 Nights / 3 Days", days: 3, rating: "5.0",
    type: "Culture / Temples", price: null, image: "/assets/img/trip-south-india.jpg",
    alt: "Temple and landscape of South India",
  },
  {
    slug: "coastal-islands", title: "Coastal & Islands", cardTitle: "Coastal & Islands", cat: "domestic", kicker: "India",
    route: "Goa • Andamans • Lakshadweep • Konkan coast",
    dests: ["Goa", "Andamans", "Lakshadweep", "Konkan coast"],
    dates: "10 Apr – 13 Apr", duration: "2 Nights / 3 Days", days: 3, rating: "5.0",
    type: "Beach", price: null, image: "/assets/img/trip-coastal.jpg",
    alt: "Coastal beach and islands of India",
  },
  {
    slug: "nepal", title: "Nepal", cardTitle: "Nepal", cat: "international", kicker: "International",
    route: "Nepal", dests: ["Nepal"],
    dates: "On request", duration: "4 Nights / 5 Days", days: 5, rating: "5.0",
    type: "Mountains", price: 14800, image: "/assets/img/trip-nepal.webp",
    alt: "Mountain landscape in Nepal",
  },
  {
    slug: "thailand-pattaya-bangkok-4n", title: "Thailand — Pattaya & Bangkok", cardTitle: "Thailand", cat: "international", kicker: "International",
    route: "Pattaya • Bangkok", dests: ["Pattaya", "Bangkok"],
    sub: "2 Nights Pattaya / 2 Nights Bangkok",
    dates: "On request", duration: "4 Nights / 5 Days", days: 5, rating: "4.5",
    type: "Beach", price: 16800, image: "/assets/img/trip-thailand-4n.webp",
    alt: "Thailand beach and city escape",
  },
  {
    slug: "singapore", title: "Singapore", cardTitle: "Singapore", cat: "international", kicker: "International",
    route: "Singapore • Universal Studios", dests: ["Singapore", "Universal Studios"],
    sub: "Including Universal Studio trip",
    dates: "On request", duration: "4 Nights / 5 Days", days: 5, rating: "4.5",
    type: "City / Shopping", price: 34200, image: "/assets/img/trip-singapore.webp",
    alt: "Singapore city skyline",
  },
  {
    slug: "vietnam-hanoi-da-nang", title: "Vietnam — Hanoi & Da Nang", cardTitle: "Vietnam", cat: "international", kicker: "International",
    route: "Hanoi • Da Nang", dests: ["Hanoi", "Da Nang"],
    sub: "Hanoi – 3 nights and Da Nang – 2 nights",
    dates: "On request", duration: "5 Nights / 6 Days", days: 6, rating: "4.5",
    type: "Culture / Heritage", price: 37800, image: "/assets/img/trip-vietnam-danang.webp",
    alt: "Vietnam coastline and heritage",
  },
];

const THAILAND_PHOTOS = [
  { src: "/assets/img/gallery/mathew-schwartz.jpg", alt: "Thai temple with a seated Buddha", caption: "Thai temple" },
  { src: "/assets/img/gallery/georgios-domouchtsidis.jpg", alt: "Bangkok street scene at night", caption: "Bangkok streets" },
  { src: "/assets/img/gallery/michelle-maria.webp", alt: "Pattaya attraction with a LOVE sign", caption: "Pattaya attractions" },
];

const TRIP_PHOTOS = {
  himalayas: [
    { src: "/assets/img/gallery/gulmarg.jpg", alt: "Gulmarg landscape in Kashmir", caption: "Gulmarg, Kashmir" },
    { src: "/assets/img/ladakh.webp", alt: "Prayer flags beside a high-altitude lake in Ladakh", caption: "Ladakh's high-altitude lakes" },
    { src: "/assets/img/hero-alive.webp", alt: "Himalayan temple against snow-capped peaks", caption: "Himalayan shrines" },
  ],
  "royal-north": [
    { src: "/assets/img/gallery/aditya-siva.jpg", alt: "Hawa Mahal in Jaipur", caption: "Hawa Mahal, Jaipur" },
    { src: "/assets/img/gallery/srivatsan-balaji.webp", alt: "Ghats along the Ganges in Varanasi", caption: "Varanasi ghats" },
    { src: "/assets/img/gallery/amber-fort.png", alt: "Amber Fort in Rajasthan", caption: "Amber Fort, Rajasthan" },
  ],
  "south-india": [
    { src: "/assets/img/gallery/anil-jose.jpg", alt: "Traditional houseboat on the Kerala backwaters", caption: "Kerala backwaters" },
    { src: "/assets/img/gallery/vivekananda-rock.jpg", alt: "Vivekananda Rock Memorial at Kanyakumari", caption: "Vivekananda Rock, Kanyakumari" },
    { src: "/assets/img/gallery/charminar.jpg", alt: "Charminar in Hyderabad", caption: "Charminar, Hyderabad" },
  ],
  "coastal-islands": [
    { src: "/assets/img/gallery/sumit-sourav.jpg", alt: "Beach huts on a Goan beach", caption: "Goa beach huts" },
    { src: "/assets/img/gallery/mountain-lake.webp", alt: "Turquoise water along a wooded coastline", caption: "Coastal shoreline" },
    { src: "/assets/img/trip-coastal.jpg", alt: "Goa beach and coastline", caption: "Goa coastline" },
  ],
  nepal: [
    { src: "/assets/img/trip-nepal.webp", alt: "Kathmandu Durbar Square in Nepal", caption: "Kathmandu Durbar Square" },
    { src: "/assets/img/trip-himalayas.jpg", alt: "Himalayan mountain panorama", caption: "Himalayan panorama" },
  ],
  "thailand-pattaya-bangkok-4n": THAILAND_PHOTOS,
  singapore: [
    { src: "/assets/img/gallery/coleen-rivas.webp", alt: "Gardens by the Bay in Singapore", caption: "Gardens by the Bay" },
    { src: "/assets/img/gallery/chuttersnap.jpg", alt: "Singapore skyline at night", caption: "Singapore skyline" },
    { src: "/assets/img/trip-singapore.webp", alt: "Singapore cityscape", caption: "Singapore cityscape" },
  ],
  "vietnam-hanoi-da-nang": [
    { src: "/assets/img/gallery/james-cheung.jpg", alt: "Hoi An's lantern-lit streets in Vietnam", caption: "Hoi An" },
    { src: "/assets/img/gallery/marina-lobato.jpg", alt: "Limestone karsts in Ha Long Bay", caption: "Ha Long Bay" },
    { src: "/assets/img/trip-vietnam-danang.webp", alt: "Da Nang coastline in Vietnam", caption: "Da Nang coastline" },
  ],
};

const DOMESTIC = TRIPS.filter((t) => t.cat === "domestic");
const INTERNATIONAL = TRIPS.filter((t) => t.cat === "international");

const SEARCH_DESTS = TRIPS.reduce((acc, t) => {
  if (!acc.some((item) => item.title === t.cardTitle)) acc.push({ title: t.cardTitle, cat: t.cat });
  return acc;
}, []);
const SEARCH_TYPES = [...new Set(TRIPS.map((t) => t.type))];
const SEARCH_TABS = [
  ["all", "All Holidays"],
  ["domestic", "Domestic"],
  ["international", "International"],
  ["honeymoon", "Honeymoon"],
  ["group", "Group Tours"],
];

/* ---------- helpers ---------- */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function icon(name, cls) {
  return `<svg class="${cls || "icon"}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
function money(n) {
  return "₹" + n.toLocaleString("en-IN");
}
function waLink(message) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
}
function tripWa(t) {
  return waLink(`Hello Alive Dreams Holidays, I'd like to enquire about the ${t.title} trip (${t.duration}${t.dates !== "On request" ? ", " + t.dates : ""}). Please share the detailed itinerary and quote.`);
}
function ratingBadge(rating) {
  return `<span class="stars">${icon("star")}<b>${rating}</b></span>`;
}
/* ---------- shared chrome ---------- */
const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" class="sr-only" aria-hidden="true" focusable="false">
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
<symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></symbol>
<symbol id="i-chev-l" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
<symbol id="i-chev-r" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
<symbol id="i-chev-d" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
<symbol id="i-wa" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.6.13-.14.35-.35.52-.53.17-.17.23-.3.35-.5.11-.2.05-.37-.03-.52-.09-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.34M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41"/></symbol>
<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></symbol>
<symbol id="i-facebook" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
<symbol id="i-linkedin" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v2a6 6 0 0 1 2-2z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-spark" viewBox="0 0 24 24"><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/></symbol>
<symbol id="i-plane" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></symbol>
<symbol id="i-map" viewBox="0 0 24 24"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></symbol>
<symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5"/></symbol>
<symbol id="i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/></symbol>
<symbol id="i-headset" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M18 19a3 3 0 0 1-3 3h-3"/><rect x="2" y="13" width="4" height="6" rx="2"/><rect x="18" y="13" width="4" height="6" rx="2"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></symbol>
<symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></symbol>
<symbol id="i-mountain" viewBox="0 0 24 24"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></symbol>
<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></symbol>
<symbol id="i-car" viewBox="0 0 24 24"><path d="m5 17-2-5 2-4h14l2 4-2 5"/><path d="M3 12h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></symbol>
<symbol id="i-umbrella" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z"/><path d="M12 12v7a2 2 0 0 0 4 0"/></symbol>
<symbol id="i-anchor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><path d="M12 8v14M5 12H2a10 10 0 0 0 20 0h-3"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82z"/><circle cx="7.5" cy="7.5" r="1"/></symbol>
<symbol id="i-expand" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></symbol>
</svg>`;

function brand() {
  return `<a class="brand" href="/" aria-label="Alive Dreams Holidays — home">
    <img class="brand-logo" src="/assets/img/logo.jpg" alt="Alive Dreams Holidays Pvt. Ltd." width="189" height="225" decoding="async">
  </a>`;
}

function header(current) {
  const isDrop = current === "domestic" || current === "international";
  const link = (key, href, label) =>
    `<a class="nav-link" href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header" id="site-header">
  <div class="container header-inner">
    ${brand()}
    <nav class="nav" aria-label="Primary">
      ${link("home", "/", "Home")}
      ${link("about", "/about-us", "About Us")}
      <div class="nav-drop">
        <button class="nav-link nav-drop-btn" type="button" aria-expanded="false" aria-controls="dest-menu"${isDrop ? ' aria-current="page"' : ""}>
          Destinations ${icon("chev-d")}
        </button>
        <div class="nav-drop-menu" id="dest-menu">
          <a href="/domestic">Domestic <span>India</span></a>
          <a href="/international">International <span>World</span></a>
        </div>
      </div>
      ${link("gallery", "/gallery", "Gallery")}
      ${link("career", "/career", "Career")}
      ${link("contact", "/contact-us", "Contact")}
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="${PHONE_LINK}">${icon("phone")}<span>${PHONE}</span></a>
      <a class="btn btn-primary btn-sm" href="/booknow">Plan My Trip</a>
      <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="menu-scrim" id="menu-scrim" aria-hidden="true"></div>
<div class="mobile-menu" id="mobile-menu">
  <nav aria-label="Mobile">
    <a class="m-link" href="/">Home ${icon("chev-r")}</a>
    <a class="m-link" href="/about-us">About Us ${icon("chev-r")}</a>
    <span class="m-label">Destinations</span>
    <div class="mobile-sub">
      <a class="m-sub-link" href="/domestic">Domestic — India</a>
      <a class="m-sub-link" href="/international">International — World</a>
    </div>
    <a class="m-link" href="/gallery">Gallery ${icon("chev-r")}</a>
    <a class="m-link" href="/career">Career ${icon("chev-r")}</a>
    <a class="m-link" href="/contact-us">Contact ${icon("chev-r")}</a>
  </nav>
  <div class="m-foot">
    <a class="btn btn-primary btn-block" href="/booknow">Plan My Trip ${icon("arrow")}</a>
    <div class="m-contact">
      <a href="${PHONE_LINK}">${icon("phone")} ${PHONE}</a>
      <a href="mailto:${EMAIL}">${icon("mail")} ${EMAIL}</a>
    </div>
  </div>
</div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-main">
    <div class="footer-brand">
      ${brand()}
      <p>Alive Dreams Holidays is a Kolkata-based tours and travel company dedicated to designing meaningful journeys across India and the world.</p>
      <div class="socials">
        <a class="social" href="${FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook")}</a>
        <a class="social" href="${X}" target="_blank" rel="noopener" aria-label="X (Twitter)">${icon("x")}</a>
        <a class="social" href="${LINKEDIN}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon("linkedin")}</a>
        <a class="social" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram")}</a>
      </div>
    </div>
    <div class="f-col">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about-us">About Us</a></li>
        <li><a href="/domestic">Domestic</a></li>
        <li><a href="/international">International</a></li>
        <li><a href="/gallery">Gallery</a></li>
        <li><a href="/career">Career</a></li>
        <li><a href="/contact-us">Contact Us</a></li>
      </ul>
    </div>
    <div class="f-col">
      <h4>Top Destinations</h4>
      <ul>
        <li><a href="/trips/himalayas">Himalayas</a></li>
        <li><a href="/trips/royal-north">Royal North</a></li>
        <li><a href="/trips/south-india">South India</a></li>
        <li><a href="/trips/coastal-islands">Coastal &amp; Islands</a></li>
        <li><a href="/trips/nepal">Nepal</a></li>
        <li><a href="/trips/thailand-pattaya-bangkok-4n">Thailand</a></li>
      </ul>
    </div>
    <div class="f-col f-contact">
      <h4>Get In Touch</h4>
      <ul>
        <li>${icon("pin")}<span>1991, Rajdanga Main Road,<br>Block GE, 1st Floor,<br>Kolkata – 700107</span></li>
        <li>${icon("phone")}<a href="${PHONE_LINK}">${PHONE}</a></li>
        <li>${icon("mail")}<a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li>${icon("wa")}<a href="${waLink("Hello Alive Dreams Holidays, I'd like to plan a trip.")}" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© <span data-year>2026</span> Alive Dreams Holidays Pvt. Ltd. All rights reserved.</p>
    <div class="legal"><span>GST-compliant billing</span><span>Kolkata, West Bengal</span><span class="credit">Developed by <strong>Semantic Reworks</strong></span></div>
  </div>
</footer>`;
}

function shell({ title, description, canonical, current, content, schema, image, robots }) {
  const fullTitle = title.includes("Alive Dreams") ? title : `${title} — Alive Dreams Holidays`;
  const ogImage = `${SITE}${image || "/assets/img/hero-alive.webp"}`;
  return `<!doctype html>
<html lang="en-IN" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0A0B09">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  ${robots ? `<meta name="robots" content="${robots}">` : ""}
  <link rel="canonical" href="${SITE}${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Alive Dreams Holidays">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="icon" href="/assets/img/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  <link rel="stylesheet" href="/assets/css/premium.css">
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/premium.js" defer></script>
  ${schema ? `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>` : ""}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${SPRITE}
  ${header(current)}
  <main id="main">
${content}
  </main>
  ${footer()}
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <a class="wa-float" href="${waLink("Hello Alive Dreams Holidays, I'd like to plan a trip.")}" target="_blank" rel="noopener" aria-label="Chat with Alive Dreams on WhatsApp">${icon("wa")}</a>
</body>
</html>
`;
}

const AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Alive Dreams Holidays Pvt. Ltd.",
  url: SITE,
  telephone: "+91-8584832681",
  email: EMAIL,
  description: "Kolkata-based tours and travel company designing personalised journeys across India and the world.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1991, Rajdanga Main Road, Block GE, 1st Floor",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    postalCode: "700107",
    addressCountry: "IN",
  },
  sameAs: [FACEBOOK, LINKEDIN, INSTAGRAM],
};

/* ---------- components ---------- */
function tripCard(t, opts) {
  opts = opts || {};
  return `<a class="dest-card trip-listing-card" href="/trips/${t.slug}" data-reveal>
    <img src="${t.image}" alt="${esc(t.alt)}" loading="lazy" width="640" height="427">
    <div class="dest-top">
      <span class="chip">${t.kicker}</span>
      <span class="chip chip-accent">${t.type}</span>
    </div>
    <div class="dest-content">
      <h3>${t.cardTitle}</h3>
      ${(t.sub || t.route !== t.cardTitle) ? `<p>${t.sub || t.route}</p>` : ""}
      <div class="trip-facts">
        <span>${icon("clock")} ${t.duration}</span>
        <span>${icon("calendar")} ${t.dates}</span>
        ${ratingBadge(t.rating)}
      </div>
      <div class="dest-foot">
        ${t.price
          ? `<span class="trip-price"><strong>${money(t.price)}</strong><small>/ person*</small></span>`
          : `<span class="price"><span>Price</span>On request</span>`}
        <span class="circle-btn" aria-hidden="true">${icon("arrow-up")}</span>
      </div>
    </div>
  </a>`;
}

function offerPoster(t) {
  const meta = t.route && t.route !== t.cardTitle ? t.route : "Ex-Kolkata departure";
  const priceLabel = t.price
    ? `from ${money(t.price)} per person`
    : "price on request";
  return `<a class="offer-poster" href="/trips/${t.slug}" aria-label="View ${esc(t.cardTitle)} — ${esc(t.duration)}, ${priceLabel}">
    <img src="${t.image}" alt="" loading="lazy" width="640" height="427">
    <span class="offer-shade" aria-hidden="true"></span>
    <span class="offer-body">
      <span class="offer-tag">${t.duration.replace(" Nights / ", "N / ").replace(" Days", "D")}</span>
      <span class="offer-title">${t.cardTitle}</span>
      <span class="offer-meta">${meta}</span>
      <span class="offer-foot">
        ${t.price
          ? `<span class="offer-price"><small>From</small> <strong>${money(t.price)}</strong><small> / person</small></span>`
          : `<span class="offer-price"><strong>On request</strong></span>`}
        <span class="offer-go">View ${icon("arrow")}</span>
      </span>
    </span>
  </a>`;
}

function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
    ${items.map((it, i) => {
      if (i === items.length - 1) return `<span aria-current="page">${esc(it.label)}</span>`;
      return `<a href="${it.href}">${esc(it.label)}</a><span class="bc-sep" aria-hidden="true">/</span>`;
    }).join("")}
  </nav>`;
}

function pageHero({ crumbs, eyebrow, title, lede, image, alt, actions }) {
  return `<section class="page-hero">
    <div class="page-hero-bg"><img src="${image}" alt="${esc(alt)}"${alt ? "" : ' aria-hidden="true"'} fetchpriority="high"></div>
    <div class="container">
      ${crumbs ? breadcrumb(crumbs) : ""}
      ${eyebrow ? `<span class="pill"><span class="dot"></span>${eyebrow}</span>` : ""}
      <h1>${title}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
      ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
    </div>
  </section>`;
}

function sectionHead({ eyebrow, title, note, action }) {
  return `<div class="section-head">
    <div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h2>${title}</h2></div>
    <div class="section-note">${note ? `<p>${note}</p>` : ""}${action ? `<p>${action}</p>` : ""}</div>
  </div>`;
}

function iconCard(ic, title, text) {
  return `<article class="icon-card" data-reveal>
    <span class="ic">${icon(ic)}</span>
    <h3>${title}</h3>
    <p>${text}</p>
  </article>`;
}

function reviewCard(review) {
  return `<article class="t-card">
    <div class="t-top">
      <span class="stars" aria-label="5 out of 5 stars">${icon("star")}${icon("star")}${icon("star")}${icon("star")}${icon("star")}</span>
      <span class="verified">${icon("check")} Traveller review</span>
    </div>
    <blockquote>${review.text}</blockquote>
    <div class="t-foot">
      <div><div class="t-name">${review.name}</div><div class="t-meta">${review.trip}</div></div>
    </div>
  </article>`;
}

const REVIEWS = [
  {
    name: "Nupur Sharma",
    trip: "Ujjain & Omkareshwar",
    text: "We recently completed our Ujjain and Omkareshwar trip with AliveDreams, and it was a wonderful experience. The hotel, cab, and bus services provided were excellent. We were a group of ladies traveling with kids, and the entire journey was safe, comfortable, and hassle-free. Highly recommended for a smooth and memorable travel experience!",
  },
  {
    name: "Archana Mate",
    trip: "Hampi–Badami",
    text: "We recently completed the Hampi–Badami tour (Pune to Pune) with AliveDreams, and it was a fantastic experience. A separate vehicle was arranged for our group, making the journey comfortable and convenient. The driver was polite and professional, and the hotels booked were excellent. We also received regular follow-up calls from the AliveDreams team to ensure everything was going smoothly. Their attention to customer satisfaction made our trip truly enjoyable. Highly recommended!",
  },
];

const EDGE = [
  ["headset", "Personal Account Manager", "One named point of contact through planning, travel, and after — not a call centre queue."],
  ["wallet", "Transparent Pricing", "No hidden costs, no last-minute add-ons. What we quote is what you pay."],
  ["shield", "Vetted Partners Only", "Hotels, transporters, and guides we have personally tested — never blind bookings."],
  ["clock", "24x7 On-Trip Support", "A real human on call during your trip — for changes, delays, or any small worry."],
  ["file", "GST Compliant & Documented", "Proper invoicing, audit-ready paperwork, fully registered under West Bengal GST."],
  ["compass", "Curated, Not Catalogued", "Itineraries built from scratch around you — not pulled off a wholesale rack."],
];

const STYLES = [
  ["heart", "Honeymoons", "Quiet beaches, mountain hideaways, romantic city breaks — designed for the two of you."],
  ["users", "Family Holidays", "Trips that work for grandparents and teenagers alike — comfort, pace, and shared joy."],
  ["globe", "Group Tours", "Friends, alumni circles, neighbours — fixed-departure or fully private group escapes."],
  ["briefcase", "Corporate MICE", "Offsites, conferences, dealer meets, R&amp;R events — orchestrated end-to-end."],
  ["compass", "Adventure", "Treks, river rafting, wildlife safaris and high-altitude crossings, safely guided."],
  ["map", "Pilgrimage", "Char Dham, Vaishno Devi, Tirupati, Ajmer — devotional journeys arranged with care."],
  ["sun", "Beach Escapes", "Maldives, Bali, Andamans, Goa — sea, sun, and unhurried days."],
  ["anchor", "Cruises", "Royal Caribbean, Cordelia, MSC — open-water voyages with full shore-excursion planning."],
];

const TRENDING = [
  ["Bali", "/international"], ["Paris", "/international"], ["Thailand", "/trips/thailand-pattaya-bangkok-4n"],
  ["Maldives", "/international"], ["Himachal Pradesh", "/domestic"], ["Goa", "/trips/coastal-islands"],
  ["Rajasthan", "/trips/royal-north"], ["Kerala", "/trips/south-india"], ["Andaman", "/trips/coastal-islands"],
  ["Vietnam", "/trips/vietnam-hanoi-da-nang"], ["Uttarakhand", "/domestic"],
];

const FAQS = [
  ["Do You Offer Customized Travel Packages?", "You can easily book tour packages online through our website by selecting your preferred destination, travel dates, and package. We offer a seamless online travel booking experience with expert assistance available at every step."],
  ["What are the best travel destinations you offer?", "We provide access to top domestic and international travel destinations, including beach holidays, luxury resorts, cultural tours, and exotic getaways across the globe."],
  ["What is included in your tour packages?", "Our all-inclusive tour packages typically cover hotel accommodation, transportation, sightseeing tours, guided experiences, and meals. Premium packages include luxury stays and exclusive experiences."],
];

const CTA = (heading, text, image) => `<section class="cta-wrap">
  <div class="container">
    <div class="cta">
      <div class="cta-bg"><img src="${image || "/assets/img/trip-nepal.webp"}" alt="" aria-hidden="true"></div>
      <div class="cta-content">
        <span class="eyebrow">Start planning</span>
        <h2>${heading}</h2>
        <p>${text}</p>
        <div class="cta-actions">
          <a class="btn btn-primary btn-lg" href="/booknow">Book Now ${icon("arrow")}</a>
          <a class="btn btn-wa btn-lg" href="${waLink("Hello Alive Dreams Holidays, I'd like help planning a trip.")}" target="_blank" rel="noopener">${icon("wa")} WhatsApp Us</a>
        </div>
        <p class="cta-note">${icon("check")} No payment required to enquire.</p>
      </div>
    </div>
  </div>
</section>`;

function holidaySearch() {
  return `<form class="holiday-search" data-holiday-search action="/booknow" method="get">
    <div class="hs-tabs" role="tablist" aria-label="Choose a holiday type">
      ${SEARCH_TABS.map(([scope, label], i) => `<button class="hs-tab" type="button" role="tab" aria-selected="${i === 0}" aria-controls="holiday-search-fields" tabindex="${i === 0 ? 0 : -1}" data-holiday-tab data-scope="${scope}">${label}</button>`).join("")}
    </div>
    <input type="hidden" name="theme" value="All Holidays">
    <div class="hs-fields" id="holiday-search-fields" role="tabpanel" aria-label="Holiday details">
      <label class="hs-field">
        <span class="hs-label">${icon("pin")} Destination</span>
        <select name="destination" data-dest-select>
          <option value="">Anywhere</option>
          ${SEARCH_DESTS.map((d) => `<option value="${esc(d.title)}" data-cat="${d.cat}">${esc(d.title)}</option>`).join("")}
        </select>
      </label>
      <label class="hs-field">
        <span class="hs-label">${icon("compass")} Trip type</span>
        <select name="type">
          <option value="">Any style</option>
          ${SEARCH_TYPES.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
        </select>
      </label>
      <label class="hs-field">
        <span class="hs-label">${icon("clock")} Duration</span>
        <select name="duration">
          <option value="">Any duration</option>
          <option>3–4 nights</option>
          <option>5–6 nights</option>
          <option>7–9 nights</option>
          <option>10+ nights</option>
        </select>
      </label>
      <label class="hs-field">
        <span class="hs-label">${icon("users")} Travellers</span>
        <select name="travellers">
          <option>1 traveller</option>
          <option selected>2 travellers</option>
          <option>3–5 travellers</option>
          <option>6–10 travellers</option>
          <option>10+ travellers</option>
        </select>
      </label>
      <button class="btn btn-primary hs-submit" type="submit">${icon("search")} Plan My Holiday</button>
    </div>
    <div class="hs-foot">
      <p class="hs-note">${icon("check")} No payment now. We reply on WhatsApp with a tailored itinerary and quote.</p>
      <p class="hs-status" aria-live="polite"></p>
    </div>
  </form>`;
}

/* ---------- pages ---------- */
function homePage() {
  const domesticCards = DOMESTIC.map((t) => tripCard(t)).join("\n");
  const intlCards = INTERNATIONAL.map((t) => tripCard(t)).join("\n");
  const offers = TRIPS;
  const content = `
  <section class="hero yatra-hero" id="top">
    <div class="hero-media"><img src="/assets/img/hero-alive.webp" alt="Kedarnath temple with snow-capped Himalayas behind" fetchpriority="high" width="640" height="427"></div>
    <div class="hero-glow"></div><div class="hero-grid"></div>
    <div class="container hero-inner">
      <span class="pill"><span class="dot"></span>Kolkata-based travel house · India &amp; worldwide</span>
      <h1>Travel <span class="grad">Beyond Imagination</span></h1>
      <p class="hero-sub">Personalised domestic and international holidays, planned end to end by a team that knows the road — from Himalayan escapes to Southeast Asian beach breaks.</p>
      ${holidaySearch()}
      <div class="hero-proof">
        <span><strong>26K+</strong> tours completed</span><span class="sep"></span>
        <span><strong>60+</strong> destinations curated</span><span class="sep"></span>
        <span><strong>24x7</strong> on-trip support</span>
      </div>

      <section class="hero-offers" aria-labelledby="offers-heading">
        <div class="offers-head">
          <h2 class="eyebrow" id="offers-heading">Featured Offers</h2>
          <div class="offers-head-right">
            <span class="offers-note">International ex-Kolkata · domestic on request · flight &amp; GST extra</span>
            <button class="offers-toggle" type="button" data-offer-pause aria-pressed="false" aria-controls="hero-offers-track">Pause</button>
          </div>
        </div>
        <div class="poster-viewport" id="hero-offers-track" data-offer-rail tabindex="0" role="region" aria-roledescription="carousel" aria-label="Featured offers">
          <div class="poster-track" data-offer-track>
            ${offers.map((t) => offerPoster(t)).join("")}
          </div>
        </div>
      </section>
    </div>
  </section>

  <section class="trust" aria-label="Destinations we plan">
    <div class="marquee">
      <div class="marquee-track">
        ${[1, 2].map(() => `<div class="marquee-group">
          <span class="m-item">Himalayas</span><span class="m-item caps">✦</span>
          <span class="m-item">South India</span><span class="m-item caps">✦</span>
          <span class="m-item">Royal North</span><span class="m-item caps">✦</span>
          <span class="m-item">Coastal &amp; Islands</span><span class="m-item caps">✦</span>
          <span class="m-item">Southeast Asia</span><span class="m-item caps">✦</span>
          <span class="m-item">Far East</span><span class="m-item caps">✦</span>
          <span class="m-item">Middle East</span><span class="m-item caps">✦</span>
          <span class="m-item">Europe</span><span class="m-item caps">✦</span>
          <span class="m-item">Americas</span><span class="m-item caps">✦</span>
          <span class="m-item">Africa &amp; Indian Ocean</span><span class="m-item caps">✦</span>
        </div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section section-tight" id="trending">
    <div class="container">
      ${sectionHead({
        eyebrow: "Top Trending Destination",
        title: "Explore the hottest travel spots around the globe",
        note: "From a Himalayan escape to a Southeast Asian beach break — start with a destination and we'll shape the rest around you.",
        action: `<a class="link-arrow" href="/international">Browse all destinations ${icon("arrow")}</a>`,
      })}
      <div class="chip-cloud" data-reveal>
        ${TRENDING.map(([name, href]) => `<a href="${href}">${icon("pin")} ${name}</a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section" id="styles">
    <div class="container">
      ${sectionHead({
        eyebrow: "Holiday Styles",
        title: "Journeys For Every Traveller",
        note: "Honeymoons, family holidays, group tours, corporate MICE and more — each planned around the way you actually like to travel.",
      })}
      <div class="cards-4">
        ${STYLES.map(([ic, title, text], i) => `<article class="style-card" data-reveal style="--delay:${i * 40}ms">
          <span class="num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          ${icon(ic)}
          <h3>${title}</h3>
          <p>${text}</p>
        </article>`).join("")}
      </div>
    </div>
  </section>

  <section class="section" id="domestic">
    <div class="container">
      ${sectionHead({
        eyebrow: "Domestic",
        title: "India, Reimagined",
        note: "From snow-fed valleys to spice-scented coasts — we know every corner of the country, and the secrets between the pages of the brochure.",
        action: `<a class="link-arrow" href="/domestic">View all domestic trips ${icon("arrow")}</a>`,
      })}
      <div class="cards-4">
        ${domesticCards}
      </div>
      <p class="note-box">Prices may vary. Contact us for exact quotes.</p>
    </div>
  </section>

  <section class="section" id="international">
    <div class="container">
      ${sectionHead({
        eyebrow: "International",
        title: "The World, Within Reach",
        note: "From Nepal and Thailand to Singapore and Vietnam — a selection of our current international packages, ex-Kolkata.",
        action: `<a class="link-arrow" href="/international">View all international trips ${icon("arrow")}</a>`,
      })}
      <div class="cards-4">
        ${intlCards}
      </div>
      <p class="note-box">All prices are based on departures from Kolkata (CCU). Flight costs and GST are additional.</p>
    </div>
  </section>

  <section class="section" id="why">
    <div class="container">
      ${sectionHead({
        eyebrow: "Our Edge",
        title: "Why Travel With Us",
        note: "A small, attentive team — and the systems to back it up. Here is what that means for your trip.",
      })}
      <div class="cards-3">
        ${EDGE.map(([ic, title, text]) => iconCard(ic, title, text)).join("")}
      </div>
      <div class="stat-band" data-reveal>
        <div><strong>100%</strong><span>GST-compliant billing</span></div>
        <div><strong>24x7</strong><span>On-trip support</span></div>
        <div><strong>60+</strong><span>Destinations curated</span></div>
        <div><strong>15 Yrs</strong><span>Combined director experience</span></div>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="container split">
      <div data-reveal>
        <span class="eyebrow">About Us</span>
        <h2>Who We Are</h2>
        <div class="prose" style="margin-top:18px">
          <p><strong>A modern travel house, built on old-fashioned care.</strong> Alive Dreams Holidays is a Kolkata-based tours and travel company dedicated to designing meaningful journeys across India and the world. Though young as a brand, our leadership brings decades of hands-on travel expertise — from curating intimate family escapes and honeymoon getaways to orchestrating large corporate group movements.</p>
          <p>We work as a small, attentive team, which means every traveller is personally looked after — not lost in a queue.</p>
        </div>
        <p style="margin-top:20px"><a class="link-arrow" href="/about-us">Read our story ${icon("arrow")}</a></p>
      </div>
      <div class="quote-card" data-reveal>
        <blockquote>Every journey we craft is a promise — to surprise you, to comfort you, and to bring back stories worth sharing. We don't just plan trips; we shape the moments you remember for a lifetime.</blockquote>
        <div class="by"><strong>The Board of Directors</strong>Alive Dreams Holidays</div>
      </div>
    </div>
  </section>

  <section class="section" id="reviews">
    <div class="container" data-slider>
      <div class="t-head">
        <div><span class="eyebrow">Testimonials</span><h2>Stories From Our Travellers</h2></div>
        <div class="t-nav">
          <button class="t-btn" type="button" data-slider-prev aria-label="Previous testimonials">${icon("chev-l")}</button>
          <button class="t-btn" type="button" data-slider-next aria-label="Next testimonials">${icon("chev-r")}</button>
        </div>
      </div>
      <div class="t-track">
        ${REVIEWS.map(reviewCard).join("")}
      </div>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="container faq-grid">
      <div class="faq-intro">
        <span class="eyebrow">FAQ's</span>
        <h2>Questions &amp; Answer</h2>
        <p>Still deciding? These are the questions we hear most often. For anything else, our team is one message away.</p>
        <div class="help-card">
          <h3>Need help planning?</h3>
          <p>Tell us your dates and we'll come back with a draft itinerary.</p>
          <a class="link-arrow" href="/booknow">Plan my trip ${icon("arrow")}</a>
        </div>
      </div>
      <div class="faq-list" data-faq>
        ${FAQS.map(([q, a], i) => `<div class="faq-item${i === 0 ? " open" : ""}">
          <button class="faq-q" type="button" id="faq-q-${i}" aria-expanded="${i === 0 ? "true" : "false"}">${q}<span class="faq-icon">${icon("plus")}</span></button>
          <div class="faq-a"><div><p>${a}</p></div></div>
        </div>`).join("")}
      </div>
    </div>
  </section>

  ${CTA("Find Your Perfect Destination in Minutes", "Tell us where you'd like to go, your dates, and how you like to travel. We'll take it from there.", "/assets/img/trip-himalayas.jpg")}
  `;
  return shell({
    title: "Alive Dreams Holidays — Travel Beyond Imagination",
    description: "Kolkata-based tours and travel company crafting personalised domestic and international holidays. Himalayas, Royal North, South India, Thailand, Singapore, Vietnam and more.",
    canonical: "/",
    current: "home",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/hero-alive.webp",
  });
}

function aboutPage() {
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "About Us" }],
    eyebrow: "About Us",
    title: "A modern travel house, built on old-fashioned care.",
    lede: "Alive Dreams Holidays is a Kolkata-based tours and travel company dedicated to designing meaningful journeys across India and the world.",
    image: "/assets/img/gallery/sumit-sourav.jpg",
    alt: "Travel landscape",
    actions: `<a class="btn btn-primary" href="/booknow">Plan My Trip ${icon("arrow")}</a><a class="btn btn-ghost" href="/contact-us">Talk to us</a>`,
  })}

  <section class="section">
    <div class="container">
      <div class="stat-band" data-reveal style="margin-top:0">
        <div><strong>26K+</strong><span>Tours completed</span></div>
        <div><strong>12+</strong><span>Years of travel experience</span></div>
        <div><strong>150+</strong><span>Happy travellers</span></div>
        <div><strong>98%</strong><span>Retention rate</span></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container split">
      <div data-reveal>
        <span class="eyebrow">Who We Are</span>
        <h2>A small team. A very personal standard of care.</h2>
      </div>
      <div class="prose" data-reveal>
        <p>Alive Dreams Holidays is a Kolkata-based tours and travel company dedicated to designing meaningful journeys across India and the world. Though young as a brand, our leadership brings decades of hands-on travel expertise — from curating intimate family escapes and honeymoon getaways to orchestrating large corporate group movements.</p>
        <p>We work as a small, attentive team, which means every traveller is personally looked after — not lost in a queue.</p>
        <p>We serve leisure travellers, families, honeymooners, adventure seekers, and corporate clients — delivering the same high standard of care whether we are booking a weekend hill station retreat or orchestrating a pan-India MICE conference.</p>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container cards-2">
      <article class="detail-card" data-reveal>
        <span class="ic" style="display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid #ffd1d1;background:#fff0f0;color:#d60f0f">${icon("compass")}</span>
        <h2 style="margin-top:16px">Our Mission</h2>
        <p>Our mission at ALIVE Dreams Holidays is simple: to bring your travel dreams to life. We do this by combining deep destination knowledge with a genuine passion for exploration — designing each trip around what matters most to you.</p>
        <p>From the snow-capped Himalayas and the royal forts of Rajasthan to the backwaters of South India, the golden beaches of Southeast Asia, and the vibrant streets of Singapore, we handle every detail so you can focus on what travel is truly about — discovery, connection, and joy.</p>
      </article>
      <article class="detail-card" data-reveal>
        <span class="ic" style="display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid #ffd1d1;background:#fff0f0;color:#d60f0f">${icon("globe")}</span>
        <h2 style="margin-top:16px">Our Vision</h2>
        <p>At ALIVE Dreams Holidays, we envision a world where every person has the opportunity to explore, experience, and be transformed by travel. We aspire to be the first name that comes to mind when someone in Eastern India — and beyond — dreams of a getaway.</p>
        <p>Whether it's a solo adventure to the Himalayas, a family holiday in Southeast Asia, or a large-scale corporate incentive event, we see ourselves as the trusted architects of those experiences. Our vision is to continuously raise the bar for personalised travel — combining local expertise, global reach, and heartfelt service to create journeys that go far beyond a simple itinerary.</p>
      </article>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container split">
      <div class="quote-card" data-reveal>
        <blockquote>Transparent quotes, no hidden costs, and a real human on the other end of the phone — anywhere, any hour.</blockquote>
        <div class="by"><strong>Alive Dreams Holidays</strong>Our promise, in writing</div>
      </div>
      <div data-reveal>
        <span class="eyebrow">Our Promise</span>
        <h2>What you can expect, every time.</h2>
        <div class="prose" style="margin-top:18px">
          <p>We work as a small, attentive team, which means every traveller is personally looked after — not lost in a queue.</p>
          <p>From the first enquiry to the final farewell, we strive for perfection in every aspect of your journey — accommodation, transfers, activities, and beyond. Small details make big memories.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Core Values",
        title: "The way we work",
        note: "Six values that shape every itinerary, every quote, and every conversation.",
      })}
      <div class="cards-3">
        ${[
          ["heart", "Passion for Travel", "We don't just plan trips — we live and breathe travel. Our team brings genuine enthusiasm to every itinerary, every destination, and every client interaction. That passion is what makes the difference between an ordinary holiday and an extraordinary one."],
          ["users", "Customer First", "Your satisfaction is the foundation of every decision we make. We listen carefully, plan meticulously, and stay available throughout your journey — because when you travel with confidence, you travel better."],
          ["shield", "Integrity &amp; Transparency", "We believe in honest, straightforward dealings — no hidden charges, no fine-print surprises. What we quote is what you pay. What we promise is what we deliver. Trust is the cornerstone of every relationship we build."],
          ["spark", "Personalisation", "No two travellers are the same, and no two itineraries should be either. We take the time to understand your preferences, interests, and budget, crafting experiences that feel tailor-made — because they are."],
          ["check", "Excellence in Every Detail", "From the first enquiry to the final farewell, we strive for perfection in every aspect of your journey — accommodation, transfers, activities, and beyond. Small details make big memories."],
          ["globe", "Spirit of Discovery", "We encourage every traveller to step beyond the familiar and embrace the extraordinary. Whether it is a hidden waterfall in Meghalaya, a centuries-old temple in Tamil Nadu, or a night market in Bangkok — we are here to help you find it."],
        ].map(([ic, title, text]) => iconCard(ic, title, text)).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Our Edge",
        title: "Why Travel With Us",
        note: "The practical things that make a trip feel effortless.",
      })}
      <div class="cards-3">
        ${EDGE.map(([ic, title, text]) => iconCard(ic, title, text)).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Leadership",
        title: "Meet The Directors",
        note: "Decades of combined experience, and a hands-on role in every journey.",
      })}
      <div class="team-grid">
        ${[
          ["AD", "Abhishek Dasgupta", "Founder, Managing Director"],
          ["DB", "Debasri Bhattacharyya", "Executive Director"],
          ["JS", "Joita Sengupta", "Executive Director"],
          ["AD", "Ashish Dasgupta", "Managing Director"],
        ].map(([initials, name, role]) => `<article class="person" data-reveal>
          <span class="avatar" aria-hidden="true">${initials}</span>
          <h3>${name}</h3>
          <p>${role}</p>
        </article>`).join("")}
      </div>
      <div class="quote-card" data-reveal style="margin-top:18px">
        <blockquote>Every journey we craft is a promise — to surprise you, to comfort you, and to bring back stories worth sharing. We don't just plan trips; we shape the moments you remember for a lifetime.</blockquote>
        <div class="by"><strong>A Note From Our Founders</strong>The Board of Directors, Alive Dreams Holidays</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "How We Work",
        title: "From Idea To Itinerary",
        note: "A clear, human process — from first brief to a draft itinerary.",
      })}
      <div class="cards-2">
        ${[
          ["search", "Discover", "We listen first — your dates, budget, travel style, and what kind of memory you're after."],
          ["file", "Draft", "A draft itinerary shaped around your dates, balanced pace, and honest costs."],
          ["check", "Confirm", "We refine until it's perfect, then lock in flights, rooms, and transfers in your name."],
          ["heart", "Travel & Reconnect", "On-trip checklists, WhatsApp updates, and 24x7 support — then we follow up after you're home."],
        ].map(([ic, title, text]) => iconCard(ic, title, text)).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container" data-slider>
      <div class="t-head">
        <div><span class="eyebrow">Testimonials</span><h2>In Their Words</h2></div>
        <div class="t-nav">
          <button class="t-btn" type="button" data-slider-prev aria-label="Previous testimonials">${icon("chev-l")}</button>
          <button class="t-btn" type="button" data-slider-next aria-label="Next testimonials">${icon("chev-r")}</button>
        </div>
      </div>
      <div class="t-track">${REVIEWS.map(reviewCard).join("")}</div>
    </div>
  </section>

  ${CTA("Let's Plan Something Worth Remembering", "Share your dates and travel style — we'll come back with a draft itinerary.", "/assets/img/trip-royal-north.jpg")}
  `;
  return shell({
    title: "About Us",
    description: "Meet Alive Dreams Holidays — a Kolkata-based tours and travel company designing personalised journeys across India and the world.",
    canonical: "/about-us",
    current: "about",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/gallery/sumit-sourav.jpg",
  });
}

function domesticPage() {
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Destinations", href: "/domestic" }, { label: "Domestic" }],
    eyebrow: "Domestic",
    title: "India, Reimagined",
    lede: "From snow-fed valleys to spice-scented coasts — we know every corner of the country, and the secrets between the pages of the brochure.",
    image: "/assets/img/trip-himalayas.jpg",
    alt: "Himalayan landscape",
    actions: `<a class="btn btn-primary" href="/booknow">Plan a domestic trip ${icon("arrow")}</a><a class="btn btn-ghost" href="/international">International trips</a>`,
  })}

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Curated Domestic Trips",
        title: "Four ways to see India",
        note: "Scheduled departures and tailor-made extensions across the Himalayas, royal Rajasthan, South India, and the coast.",
        action: `<a class="link-arrow" href="/booknow">Not sure which? Ask us ${icon("arrow")}</a>`,
      })}
      <div class="cards-4">
        ${DOMESTIC.map((t) => tripCard(t)).join("")}
      </div>
      <p class="note-box">Prices may vary. Contact us for exact quotes.</p>
    </div>
  </section>

  <section class="section section-tight">
    <div class="container">
      ${sectionHead({
        eyebrow: "Top Destinations",
        title: "Start with a place, we'll shape the rest",
        note: "These are the destinations our travellers ask for most often.",
      })}
      <div class="chip-cloud" data-reveal>
        ${TRENDING.filter(([, href]) => href === "/domestic" || DOMESTIC.some((t) => href === "/trips/" + t.slug)).map(([name, href]) => `<a href="${href}">${icon("pin")} ${name}</a>`).join("")}
      </div>
    </div>
  </section>

  ${CTA("Build Your India Itinerary", "Tell us your dates and the kind of trip you have in mind. We'll send a draft plan.", "/assets/img/trip-south-india.jpg")}
  `;
  return shell({
    title: "Domestic Tours",
    description: "Domestic tour packages across the Himalayas, Royal North, South India, and Coastal & Islands.",
    canonical: "/domestic",
    current: "domestic",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/trip-himalayas.jpg",
  });
}

function internationalPage() {
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Destinations", href: "/international" }, { label: "International" }],
    eyebrow: "International",
    title: "The World, Within Reach",
    lede: "From Nepal and Thailand to Singapore and Vietnam — a selection of our current international packages, ex-Kolkata.",
    image: "/assets/img/trip-singapore.webp",
    alt: "International destination",
    actions: `<a class="btn btn-primary" href="/booknow">Plan an international trip ${icon("arrow")}</a><a class="btn btn-ghost" href="/domestic">Domestic trips</a>`,
  })}

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Curated International Trips",
        title: "Where we can take you next",
        note: "Nepal, Thailand, Singapore and Vietnam — with flights, stays, transfers and experiences arranged around your dates.",
        action: `<a class="link-arrow" href="/booknow">Request a custom quote ${icon("arrow")}</a>`,
      })}
      <div class="cards-4">
        ${INTERNATIONAL.map((t) => tripCard(t)).join("")}
      </div>
      <p class="note-box">All prices are based on departures from Kolkata (CCU). Flight costs and GST are additional.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      ${sectionHead({
        eyebrow: "Where We Plan",
        title: "More of the world, on request.",
        note: "Our current packages cover Nepal, Thailand, Singapore and Vietnam. We also plan custom journeys across the regions below.",
      })}
      <div class="chip-cloud" data-reveal>
        ${["Southeast Asia", "Far East", "Middle East", "Europe", "Americas", "Africa & Indian Ocean"].map((r) => `<a href="/booknow">${icon("globe")} ${r}</a>`).join("")}
      </div>
    </div>
  </section>

  ${CTA("Your Next Stamp Starts Here", "Tell us where you'd like to go and we'll build the itinerary, flights, stays and transfers around you.", "/assets/img/trip-thailand-4n.webp")}
  `;
  return shell({
    title: "International Tours",
    description: "International tour packages to Nepal, Thailand, Singapore and Vietnam, with departures from Kolkata. Flight costs and GST extra.",
    canonical: "/international",
    current: "international",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/trip-singapore.webp",
  });
}

function galleryPage() {
  const items = [
    ["domestic", "/assets/img/gallery/akshardham.jpg", "Akshardham", "Akshardham temple complex", false],
    ["domestic", "/assets/img/gallery/srivatsan-balaji.webp", "", "Travel photograph from the gallery", true],
    ["domestic", "/assets/img/gallery/sumit-sourav.jpg", "", "Travel photograph from the gallery", false],
    ["domestic", "/assets/img/gallery/james-cheung.jpg", "", "Travel photograph from the gallery", false],
    ["domestic", "/assets/img/gallery/aditya-siva.jpg", "", "Travel photograph from the gallery", false],
    ["domestic", "/assets/img/gallery/anil-jose.jpg", "", "Travel photograph from the gallery", false],
    ["domestic", "/assets/img/gallery/mountain-lake.webp", "", "Mountain lake landscape", true],
    ["domestic", "/assets/img/gallery/vivekananda-rock.jpg", "Vivekananda Rock", "Vivekananda Rock Memorial", false],
    ["domestic", "/assets/img/gallery/charminar.jpg", "Charminar", "Charminar, Hyderabad", false],
    ["domestic", "/assets/img/gallery/gulmarg.jpg", "Gulmarg", "Gulmarg landscape", false],
    ["domestic", "/assets/img/gallery/amber-fort.png", "Amber Fort", "Amber Fort, Rajasthan", true],
    ["international", "/assets/img/gallery/chuttersnap.jpg", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/jeff-tumale.webp", "", "Travel photograph from the gallery", true],
    ["international", "/assets/img/gallery/coleen-rivas.webp", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/ferrari-world.webp", "Ferrari World, Yas Island", "Ferrari World, Yas Island, Abu Dhabi", false],
    ["international", "/assets/img/gallery/michelle-maria.webp", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/mathew-schwartz.jpg", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/harry-kessell.jpg", "", "Travel photograph from the gallery", true],
    ["international", "/assets/img/gallery/legoland.jpg", "Legoland", "Legoland", false],
    ["international", "/assets/img/gallery/meric-dagli.jpg", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/catalin-pop.jpg", "", "Travel photograph from the gallery", true],
    ["international", "/assets/img/gallery/marina-lobato.jpg", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/georgios-domouchtsidis.jpg", "", "Travel photograph from the gallery", false],
    ["international", "/assets/img/gallery/hugh-whyte.jpg", "", "Travel photograph from the gallery", false],
  ];
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Gallery" }],
    eyebrow: "Gallery",
    title: "Moments from the road.",
    lede: "A look at the places, details, and detours that make up an Alive Dreams journey — at home in India and across the world.",
    image: "/assets/img/gallery/akshardham.jpg",
    alt: "Akshardham temple complex",
  })}

  <section class="section">
    <div class="container" data-gallery>
      <div class="filter-bar" role="group" aria-label="Filter gallery">
        <button class="filter-btn" type="button" data-filter="all" aria-pressed="true">All</button>
        <button class="filter-btn" type="button" data-filter="domestic" aria-pressed="false">Domestic</button>
        <button class="filter-btn" type="button" data-filter="international" aria-pressed="false">International</button>
      </div>
      <div class="gallery-grid">
        ${items.map(([cat, src, title, alt, tall], i) => `<figure class="gallery-item${tall ? " tall" : ""}" data-cat="${cat}" data-title="${esc(title)}" role="button" tabindex="0" aria-label="View ${esc(title || "gallery image")}">
          <img src="${src}" alt="${esc(alt)}" loading="lazy" width="640" height="427">
          ${title ? `<figcaption><span>${esc(title)}</span>${icon("expand")}</figcaption>` : ""}
        </figure>`).join("")}
      </div>
    </div>
  </section>

  ${CTA("See It For Yourself", "Tell us which of these places has your attention — we'll build the trip around it.", "/assets/img/gallery/gulmarg.jpg")}

  <dialog class="lightbox" id="lightbox" aria-label="Gallery viewer">
    <img src="" alt="">
    <div class="lightbox-bar">
      <p data-lightbox-caption>Alive Dreams gallery</p>
      <div class="lightbox-controls">
        <button class="lightbox-nav" type="button" data-lightbox-prev aria-label="Previous image">${icon("chev-l")}</button>
        <button class="lightbox-nav" type="button" data-lightbox-next aria-label="Next image">${icon("chev-r")}</button>
        <button class="lightbox-close" type="button" data-lightbox-close aria-label="Close gallery">${icon("x")}</button>
      </div>
    </div>
  </dialog>
  `;
  return shell({
    title: "Gallery",
    description: "Photographs from Alive Dreams Holidays journeys across India and the world.",
    canonical: "/gallery",
    current: "gallery",
    content,
    image: "/assets/img/gallery/akshardham.jpg",
  });
}

function careerPage() {
  const jobs = [
    ["MICE Corporate Sales Executive", "We are looking for a dynamic MICE Corporate Sales Executive to join our growing team. The ideal candidate will have a strong background in corporate travel sales, event coordination, and client relationship management within the MICE (Meetings, Incentives, Conferences & Events) segment."],
    ["Domestic Ticketing Executive", "We are seeking a detail-oriented Domestic Ticketing Executive to manage flight and train bookings for our domestic travel packages. The ideal candidate will be proficient with GDS systems (Amadeus, Galileo, or similar), have excellent knowledge of domestic routes and fare structures, and provide prompt, accurate ticketing support to our sales team and clients."],
  ];
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Career" }],
    eyebrow: "Careers",
    title: "Build journeys with us.",
    lede: "We're a small, attentive travel team in Kolkata. If you love the details of a well-planned trip, we'd like to hear from you.",
    image: "/assets/img/gallery/aditya-siva.jpg",
    alt: "Travel landscape",
    actions: `<a class="btn btn-primary" href="#apply">Apply now ${icon("arrow")}</a>`,
  })}

  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "Our Open Positions",
        title: "Two roles, one standard of care",
        note: "Both roles are based with our team in Kolkata. Tell us which one fits, and attach your CV when the WhatsApp chat opens.",
      })}
      <div class="jobs">
        ${jobs.map(([role, text], i) => `<article class="job" data-reveal>
          <div>
            <h3>${role}</h3>
            <p>${text}</p>
            <span class="chip">${i === 0 ? "Corporate travel · MICE" : "Ticketing · Domestic"}</span>
          </div>
          <button class="btn btn-ghost" type="button" data-apply-role="${role}">Apply Now ${icon("arrow")}</button>
        </article>`).join("")}
      </div>
    </div>
  </section>

  <section class="section" id="apply" style="padding-top:0">
    <div class="container contact-grid">
      <div>
        <span class="eyebrow">Application</span>
        <h2 style="margin-top:16px;font-size:clamp(1.8rem,3vw,2.4rem)">Tell us a little about you.</h2>
        <div class="prose" style="margin-top:16px">
          <p>Send us your name, contact details, and a short note about your experience. When WhatsApp opens, attach your CV in the chat and our team will take it from there.</p>
        </div>
        <div class="contact-cards" style="margin-top:24px">
          <a class="contact-card" href="mailto:${EMAIL}?subject=Career%20enquiry">
            <span class="ic">${icon("mail")}</span>
            <span><span>Email</span><strong>${EMAIL}</strong></span>
          </a>
          <a class="contact-card" href="${PHONE_LINK}">
            <span class="ic">${icon("phone")}</span>
            <span><span>Phone</span><strong>${PHONE}</strong></span>
          </a>
        </div>
      </div>
      <form class="form-card" data-wa-form="Career" novalidate>
        <h3>Apply for a role</h3>
        <p>All fields marked * are required.</p>
        <div class="form-grid">
          <div class="field full">
            <label for="role">Role *</label>
            <select id="role" name="role" required>
              <option value="">Select a role</option>
              ${jobs.map(([role]) => `<option value="${role}">${role}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="name">Full name *</label>
            <input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="phone">Phone *</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+91" required>
          </div>
          <div class="field full">
            <label for="email">Email *</label>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
          </div>
          <div class="field full">
            <label for="message">A short note</label>
            <textarea id="message" name="message" placeholder="Tell us about your experience…"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-wa" type="submit">${icon("wa")} Send application</button>
          <span class="form-note">${icon("check")} Opens WhatsApp with your details</span>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>
  `;
  return shell({
    title: "Careers",
    description: "Open roles at Alive Dreams Holidays in Kolkata: MICE Corporate Sales Executive and Domestic Ticketing Executive.",
    canonical: "/career",
    current: "career",
    content,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Careers — Alive Dreams Holidays",
      about: "Travel careers in Kolkata",
    },
  });
}

function contactPage() {
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Contact Us" }],
    eyebrow: "Contact Us",
    title: "Let's start with a conversation.",
    lede: "We'd love to hear from you. Whether you're planning your next holiday, looking for a corporate travel solution, or simply want to explore your options, our friendly team is here to help.",
    image: "/assets/img/gallery/charminar.jpg",
    alt: "Charminar, Hyderabad",
  })}

  <section class="section">
    <div class="container contact-grid">
      <div>
        <span class="eyebrow">Reach Us</span>
        <h2 style="margin-top:16px;font-size:clamp(1.8rem,3vw,2.4rem)">By phone, WhatsApp, or email.</h2>
        <p style="margin-top:12px;font-size:.94rem;color:#666;max-width:46ch">Call, message, or write — we'll take it from there.</p>
        <div class="contact-cards" style="margin-top:24px">
          <a class="contact-card" href="${PHONE_LINK}">
            <span class="ic">${icon("phone")}</span>
            <span><span>Phone</span><strong>${PHONE}</strong></span>
          </a>
          <a class="contact-card" href="${waLink("Hello Alive Dreams Holidays, I'd like to enquire about a trip.")}" target="_blank" rel="noopener">
            <span class="ic">${icon("wa")}</span>
            <span><span>WhatsApp</span><strong>${PHONE}</strong></span>
          </a>
          <a class="contact-card" href="mailto:${EMAIL}">
            <span class="ic">${icon("mail")}</span>
            <span><span>Email</span><strong>${EMAIL}</strong></span>
          </a>
          <div class="contact-card">
            <span class="ic">${icon("pin")}</span>
            <span><span>Location</span><strong>1991, Rajdanga Main Road, Block GE, 1st Floor, Kolkata – 700107</strong></span>
          </div>
        </div>
        <div class="map-card" style="margin-top:16px">
          <span class="pin-lg">${icon("pin")}</span>
          <h3>Alive Dreams Holidays</h3>
          <p>1991, Rajdanga Main Road, Block GE, 1st Floor, Kolkata – 700107</p>
          <a class="link-arrow" href="https://www.google.com/maps/search/?api=1&query=1991+Rajdanga+Main+Road+Block+GE+Kolkata+700107" target="_blank" rel="noopener">Open in Google Maps ${icon("arrow-up")}</a>
        </div>
      </div>

      <form class="form-card" data-wa-form="Contact" novalidate>
        <h3>Send us a message</h3>
        <p>Tell us what you have in mind. We'll continue the conversation on WhatsApp.</p>
        <div class="form-grid">
          <div class="field">
            <label for="name">Full name *</label>
            <input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="phone">Phone *</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+91" required>
          </div>
          <div class="field full">
            <label for="email">Email *</label>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
          </div>
          <div class="field full">
            <label for="message">Message *</label>
            <textarea id="message" name="message" placeholder="Where would you like to go, and when?" required></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-wa" type="submit">${icon("wa")} Send via WhatsApp</button>
          <span class="form-note">${icon("check")} No payment required to enquire</span>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>

  ${CTA("Prefer to Talk It Through?", "Call us on +91 85848 32681 or send a WhatsApp message — a real person will answer.", "/assets/img/trip-coastal.jpg")}
  `;
  return shell({
    title: "Contact Us",
    description: "Contact Alive Dreams Holidays in Kolkata. Call +91 85848 32681, email info@alivedreams.co.in, or visit 1991 Rajdanga Main Road, Block GE.",
    canonical: "/contact-us",
    current: "contact",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/gallery/charminar.jpg",
  });
}

function bookPage() {
  const options = TRIPS.map((t) => `<option value="${t.slug}">${t.title} — ${t.duration}</option>`).join("");
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Book Now" }],
    eyebrow: "Plan My Trip",
    title: "Tell us about the trip you're dreaming of.",
    lede: "Share your dates, destination, and travel style. We'll come back with a draft itinerary and a clear quote.",
    image: "/assets/img/trip-nepal.webp",
    alt: "Mountain landscape",
  })}

  <section class="section">
    <div class="container contact-grid">
      <form class="form-card" data-wa-form="Booking" novalidate>
        <h3>Plan my trip</h3>
        <p>All fields marked * are required. Sending this opens WhatsApp with your details filled in.</p>
        <div class="form-grid">
          <div class="field">
            <label for="name">Full name *</label>
            <input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="phone">Phone *</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+91" required>
          </div>
          <div class="field full">
            <label for="email">Email *</label>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
          </div>
          <div class="field full">
            <label for="trip">Which trip?</label>
            <select id="trip" name="trip">
              <option value="">Not sure yet — help me choose</option>
              ${options}
            </select>
          </div>
          <div class="field">
            <label for="dates">Travel dates</label>
            <input id="dates" name="dates" type="text" placeholder="e.g. Feb 2027 · 9 nights">
          </div>
          <div class="field">
            <label for="travellers">Travellers</label>
            <input id="travellers" name="travellers" type="text" placeholder="e.g. 2 adults, 1 child">
          </div>
          <div class="field full">
            <label for="message">Anything else?</label>
            <textarea id="message" name="message" placeholder="Budget, pace, places you'd love to see…"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-wa" type="submit">${icon("wa")} Send via WhatsApp</button>
          <span class="form-note">${icon("check")} No payment required to enquire</span>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>

      <div>
        <div class="aside-card" style="position:static">
          <div class="aside-body">
            <span class="eyebrow">Prefer to talk?</span>
            <h2 style="font-size:1.4rem;margin-top:8px">A real person, not a form queue.</h2>
            <p>Call or message us directly and we'll start shaping the trip with you.</p>
            <ul class="aside-list">
              <li>${icon("phone")}<a href="${PHONE_LINK}">${PHONE}</a></li>
              <li>${icon("mail")}<a href="mailto:${EMAIL}">${EMAIL}</a></li>
              <li>${icon("pin")}<span>1991, Rajdanga Main Road, Block GE, 1st Floor, Kolkata – 700107</span></li>
            </ul>
            <a class="btn btn-wa btn-block" href="${waLink("Hello Alive Dreams Holidays, I'd like to plan a trip.")}" target="_blank" rel="noopener">${icon("wa")} Chat on WhatsApp</a>
          </div>
          <div class="aside-foot">Transparent quotes · No hidden costs</div>
        </div>

        <div class="detail-card" style="margin-top:16px">
          <span class="eyebrow">What Happens Next</span>
          <ul class="include-list" style="margin-top:14px">
            <li>${icon("check")}<span><strong>Discover.</strong> We listen to your dates, budget, and travel style.</span></li>
            <li>${icon("check")}<span><strong>Draft.</strong> We turn your brief into a route, stays, and a clear quote.</span></li>
            <li>${icon("check")}<span><strong>Confirm.</strong> We refine, then lock flights, rooms and transfers.</span></li>
            <li>${icon("check")}<span><strong>Travel.</strong> On-trip checklists and 24x7 support.</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  `;
  return shell({
    title: "Book Now",
    description: "Plan your holiday with Alive Dreams Holidays. Share your dates and destination and receive a draft itinerary.",
    canonical: "/booknow",
    current: "book",
    content,
    schema: AGENCY_SCHEMA,
    image: "/assets/img/trip-nepal.webp",
  });
}

function tripPage(t) {
  const related = TRIPS.filter((x) => x.cat === t.cat && x.slug !== t.slug).slice(0, 3);
  const photos = TRIP_PHOTOS[t.slug] || [];
  const isIntl = t.cat === "international";
  const departure = t.dates === "On request" ? "On request" : t.dates;
  const dateLabel = isIntl ? "Departure" : "Listed dates";
  const overview = isIntl
    ? `Our ${t.title} journey covers ${t.dests.join(", ")} across ${t.duration}.${t.sub ? " " + t.sub + "." : ""} Departure dates are on request, and the trip is rated ${t.rating} by travellers. Departures are ex-Kolkata (CCU), with flight cost and GST extra.`
    : `Our ${t.title} journey brings together ${t.dests.join(", ")} across ${t.duration}. The official listing shows ${t.dates}, and the trip is rated ${t.rating} by travellers. Exact travel dates are confirmed on enquiry.`;

  const notes = isIntl
    ? `All prices are based on departures from Kolkata (CCU). Flight costs and GST are additional. Final inclusions are confirmed in your personalised quote.`
    : `Prices may vary. Contact us for exact quotes. The official listing shows a ${t.dates} date window; final travel dates are confirmed on enquiry.`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.title,
    description: overview,
    duration: `P${t.days}D`,
    touristType: "Leisure",
    itinerary: {
      "@type": "ItemList",
      itemListElement: t.dests.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d })),
    },
    provider: {
      "@type": "TravelAgency",
      name: "Alive Dreams Holidays Pvt. Ltd.",
      telephone: "+91-8584832681",
      url: SITE,
    },
    ...(t.price ? { offers: { "@type": "Offer", price: t.price, priceCurrency: "INR", availability: "https://schema.org/InStock" } } : {}),
  };

  const content = `
  <section class="page-hero trip-hero">
    <div class="page-hero-bg"><img src="${t.image}" alt="${esc(t.alt)}" fetchpriority="high"></div>
    <div class="container">
      ${breadcrumb([{ label: "Home", href: "/" }, { label: t.cat === "domestic" ? "Domestic" : "International", href: t.cat === "domestic" ? "/domestic" : "/international" }, { label: t.cardTitle }])}
      <div class="badge-row" style="margin-bottom:14px">
        <span class="chip">${t.kicker}</span>
        <span class="chip chip-accent">${t.type}</span>
        ${t.sub ? `<span class="chip">${t.sub}</span>` : ""}
      </div>
      <h1>${t.title}</h1>
      <p class="trip-route">${icon("pin")}<span>${t.dests.join(" • ")}</span></p>
      <div class="trip-hero-meta">
        <span class="chip">${icon("clock")} ${t.duration}</span>
        <span class="chip">${icon("calendar")} ${departure}</span>
        <span class="chip">${ratingBadge(t.rating)}</span>
        ${isIntl ? `<span class="chip">${icon("plane")} Ex-Kolkata (CCU)</span>` : ""}
      </div>
      <div class="price-hero">
        ${t.price
          ? `<span>From</span><strong>${money(t.price)}</strong><span>per person*</span><span style="font-size:.82rem">· flight cost and GST extra</span>`
          : `<span>Price</span><strong>On request</strong><span style="font-size:.82rem">· prices may vary</span>`}
      </div>
    </div>
  </section>

  <div class="container">
    <div class="fact-bar" data-reveal>
      <div class="fact">${icon("clock")}<div><span>Duration</span><strong>${t.duration}</strong></div></div>
      <div class="fact">${icon("calendar")}<div><span>${dateLabel}</span><strong>${departure}</strong></div></div>
      <div class="fact">${icon("tag")}<div><span>Style</span><strong>${t.type}</strong></div></div>
      <div class="fact">${icon("star")}<div><span>Rating</span><strong>${t.rating} / 5.0</strong></div></div>
    </div>
  </div>

  <div class="container detail-layout">
    <div class="detail-main">
      <section class="detail-card" data-reveal>
        <span class="eyebrow">Trip Overview</span>
        <h2>The ${t.cardTitle} journey, at a glance.</h2>
        <p>${overview}</p>
        <p>Every itinerary is built around your dates, pace and budget. Share your preferences and we'll send a draft plan.</p>
      </section>

      <section class="detail-card" data-reveal>
        <span class="eyebrow">Where You'll Go</span>
        <h2>Destinations on this journey</h2>
        <div class="route-list">
          ${t.dests.map((d) => `<span>${icon("pin")} ${d}</span>`).join("")}
        </div>
        ${t.sub ? `<p style="margin-top:16px">${t.sub}</p>` : ""}
      </section>

      ${photos.length ? `<section class="detail-card" data-reveal>
        <span class="eyebrow">Trip Gallery</span>
        <h2>Scenes from this journey</h2>
        <p>A visual preview of the places and experiences that shape this itinerary.</p>
        <div class="trip-gallery">
          ${photos.map((p) => `<figure class="trip-photo">
            <img src="${p.src}" alt="${esc(p.alt)}" loading="lazy" width="640" height="480">
            <figcaption>${esc(p.caption)}</figcaption>
          </figure>`).join("")}
        </div>
      </section>` : ""}

      <section class="detail-card" data-reveal>
        <span class="eyebrow">What's Included</span>
        <h2>Our packages typically cover</h2>
        <ul class="include-list">
          ${["Hotel accommodation", "Transportation", "Sightseeing tours", "Guided experiences", "Meals"].map((x) => `<li>${icon("check")}<span>${x}</span></li>`).join("")}
        </ul>
        <div class="note-box">${notes}</div>
      </section>

      <section class="detail-card" data-reveal>
        <span class="eyebrow">Good To Know</span>
        <h2>Before you book</h2>
        <ul class="include-list">
          <li>${icon("check")}<span>No payment required to enquire.</span></li>
          <li>${icon("check")}<span>One named account manager through planning, travel, and after.</span></li>
          <li>${icon("check")}<span>24x7 on-trip support — a real human on call.</span></li>
          <li>${icon("check")}<span>Transparent quotes, no hidden costs.</span></li>
        </ul>
      </section>

      <section class="detail-card" data-reveal>
        <span class="eyebrow">How Booking Works</span>
        <h2>From idea to itinerary</h2>
        <div class="steps-mini">
          <div><strong>01 · Discover</strong><span>We listen to your dates, budget and travel style.</span></div>
          <div><strong>02 · Draft</strong><span>We turn your brief into a route and a clear quote.</span></div>
          <div><strong>03 · Confirm</strong><span>We refine, then lock flights, rooms and transfers.</span></div>
          <div><strong>04 · Travel</strong><span>Checklists, WhatsApp updates, and 24x7 support.</span></div>
        </div>
      </section>
    </div>

    <aside class="aside-card" aria-label="Enquire about this trip">
      <div class="aside-body">
        <span class="eyebrow">${isIntl ? "From" : "Price"}</span>
        <div class="aside-price">
          ${t.price
            ? `<strong>${money(t.price)}</strong><small>per person*</small>`
            : `<span class="on-request">On request</span>`}
        </div>
        <p>${isIntl ? "Ex-Kolkata (CCU). Flight cost and GST extra." : "Prices may vary. Contact us for exact quotes."}</p>
        <ul class="aside-list">
          <li>${icon("clock")}<span><strong>${t.duration}</strong> · ${departure}</span></li>
          <li>${icon("tag")}<span>${t.type} · ${t.kicker}</span></li>
          <li>${icon("star")}<span>Rated ${t.rating} by travellers</span></li>
        </ul>
        <a class="btn btn-wa btn-block" href="${tripWa(t)}" target="_blank" rel="noopener">${icon("wa")} Enquire on WhatsApp</a>
        <a class="btn btn-ghost btn-block" href="/booknow?trip=${t.slug}" style="margin-top:8px">Request a callback</a>
      </div>
      <div class="aside-foot">No payment required to enquire</div>
    </aside>
  </div>

  <section class="section" style="padding-top:0">
    <div class="container">
      ${sectionHead({
        eyebrow: "More Like This",
        title: "You might also like",
        note: `Other ${t.cat} journeys from our current collection.`,
        action: `<a class="link-arrow" href="${t.cat === "domestic" ? "/domestic" : "/international"}">View all ${t.cat} trips ${icon("arrow")}</a>`,
      })}
      <div class="cards-3">${related.map((r) => tripCard(r)).join("")}</div>
    </div>
  </section>

  ${CTA("Ready to Make This Trip Yours?", "Send us your dates and we'll turn this outline into a full itinerary and quote.", t.image)}
  `;

  return shell({
    title: `${t.title} — ${t.duration}`,
    description: `${t.title}: ${t.dests.join(", ")}. ${t.duration}. ${isIntl ? "Ex-Kolkata, flight cost and GST extra." : t.dates + "."} Enquire with Alive Dreams Holidays.`,
    canonical: `/trips/${t.slug}`,
    current: t.cat,
    content,
    schema,
    image: t.image,
  });
}

function notFoundPage() {
  const content = `
  ${pageHero({
    crumbs: [{ label: "Home", href: "/" }, { label: "Page not found" }],
    eyebrow: "404",
    title: "This path doesn't exist — yet.",
    lede: "The page you were looking for has moved or never existed. Let's get you back to somewhere worth going.",
    image: "/assets/img/trip-nepal.webp",
    alt: "Mountain landscape",
    actions: `<a class="btn btn-primary" href="/">Back to home ${icon("arrow")}</a><a class="btn btn-ghost" href="/domestic">Explore trips</a>`,
  })}
  `;
  return shell({
    title: "Page Not Found",
    description: "The page you were looking for could not be found. Explore Alive Dreams Holidays trips instead.",
    canonical: "/404",
    current: "404",
    content,
    image: "/assets/img/trip-nepal.webp",
    robots: "noindex, follow",
  });
}

/* ---------- write ---------- */
const pages = {
  "index.html": homePage(),
  "about-us.html": aboutPage(),
  "domestic.html": domesticPage(),
  "international.html": internationalPage(),
  "gallery.html": galleryPage(),
  "career.html": careerPage(),
  "contact-us.html": contactPage(),
  "booknow.html": bookPage(),
  "404.html": notFoundPage(),
};

fs.mkdirSync(path.join(ROOT, "trips"), { recursive: true });
for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(ROOT, file), html, "utf8");
  console.log("wrote", file, html.length);
}
for (const t of TRIPS) {
  const file = path.join("trips", `${t.slug}.html`);
  const html = tripPage(t);
  fs.writeFileSync(path.join(ROOT, file), html, "utf8");
  console.log("wrote", file, html.length);
}

const urls = [
  ["/", "1.0"], ["/about-us", "0.7"], ["/domestic", "0.9"], ["/international", "0.9"],
  ["/gallery", "0.6"], ["/career", "0.5"], ["/contact-us", "0.7"], ["/booknow", "0.8"],
  ...TRIPS.map((t) => [`/trips/${t.slug}`, "0.8"]),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><priority>${p}</priority></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, "utf8");
console.log("wrote sitemap.xml and robots.txt");
