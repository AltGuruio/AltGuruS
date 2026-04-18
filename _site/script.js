const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const year = document.getElementById("year");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}

// ------------------------------
// Language dropdown (UI only)
// ------------------------------
const LANG_STORAGE_KEY = "altguru_lang";
const LANG_OPTIONS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
];

function setLanguage(code) {
  const opt = LANG_OPTIONS.find((o) => o.code === code) || LANG_OPTIONS[0];
  try {
    localStorage.setItem(LANG_STORAGE_KEY, opt.code);
  } catch {
    // ignore
  }
  document.documentElement.lang = opt.code;
  document.documentElement.dir = opt.dir;

  const btn = document.querySelector(".lang-pill");
  if (btn) {
    btn.textContent = opt.code.toUpperCase();
    btn.setAttribute("aria-label", `Language: ${opt.label}`);
  }
}

function initLanguageMenu() {
  const btn = document.querySelector(".lang-pill");
  if (!btn) return;
  if (btn.dataset.langReady === "1") return;
  btn.dataset.langReady = "1";

  // Pill shows short code (EN, FR, …); menu items use full labels
  let saved = "en";
  try {
    saved = localStorage.getItem(LANG_STORAGE_KEY) || "en";
  } catch {
    saved = "en";
  }
  setLanguage(saved);

  const wrap = document.createElement("div");
  wrap.className = "lang-menu";
  btn.parentNode.insertBefore(wrap, btn);
  wrap.appendChild(btn);

  btn.type = "button";
  btn.setAttribute("aria-haspopup", "menu");
  btn.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "lang-menu-list";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Language");

  LANG_OPTIONS.forEach((opt) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "lang-menu-item";
    item.setAttribute("role", "menuitemradio");
    item.dataset.lang = opt.code;
    item.textContent = opt.label;
    item.addEventListener("click", () => {
      setLanguage(opt.code);
      closeMenu();
    });
    menu.appendChild(item);
  });

  wrap.appendChild(menu);

  function refreshChecked() {
    const current = document.documentElement.lang || "en";
    menu.querySelectorAll(".lang-menu-item").forEach((el) => {
      const active = el.dataset.lang === current;
      el.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function openMenu() {
    wrap.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    refreshChecked();
  }

  function closeMenu() {
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wrap.classList.contains("open")) closeMenu();
    else openMenu();
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
      const first = menu.querySelector(".lang-menu-item");
      first?.focus();
    }
  });

  menu.addEventListener("keydown", (e) => {
    const items = Array.from(menu.querySelectorAll(".lang-menu-item"));
    const idx = items.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      btn.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (items[idx + 1] || items[0])?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      (items[idx - 1] || items[items.length - 1])?.focus();
    }
  });

  document.addEventListener("click", () => closeMenu());
}

initLanguageMenu();

// ------------------------------
// Pricing (Signals) – Draft
// ------------------------------
const billingPills = document.querySelectorAll(".pricing-page .billing-pill");
const pricingPrices = document.querySelectorAll(".pricing-page .price");
const pricingPers = document.querySelectorAll(".pricing-page .per");

function setBilling(mode) {
  billingPills.forEach((b) => b.classList.toggle("active", b.dataset.billing === mode));
  const billingToggle = document.querySelector(".pricing-page .billing-toggle");
  if (billingToggle) billingToggle.dataset.active = mode;

  pricingPrices.forEach((el) => {
    const val = el.dataset[mode];
    if (val) el.textContent = val;
  });

  pricingPers.forEach((el) => {
    const val = el.dataset[mode];
    if (val) el.textContent = val;
  });
}

if (billingPills.length) {
  billingPills.forEach((btn) => btn.addEventListener("click", () => setBilling(btn.dataset.billing)));
  setBilling("monthly");
}

// Results pages: animate market pill, then navigate (full page load skips CSS transitions otherwise)
const resultsMarketToggle = document.querySelector(".results-market-toggle");
if (resultsMarketToggle) {
  const marketLinks = resultsMarketToggle.querySelectorAll("a.billing-pill");
  const slider = resultsMarketToggle.querySelector(".billing-toggle-slider");

  marketLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href) return;

      let destUrl;
      try {
        destUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destUrl.pathname === window.location.pathname) {
        e.preventDefault();
        return;
      }

      const market = link.dataset.market;
      if (!market) return;

      e.preventDefault();

      resultsMarketToggle.dataset.active = market;
      marketLinks.forEach((l) => l.classList.toggle("active", l === link));

      let navigated = false;
      const go = () => {
        if (navigated) return;
        navigated = true;
        window.location.assign(href);
      };

      if (slider) {
        const onEnd = (ev) => {
          if (ev.propertyName !== "transform") return;
          slider.removeEventListener("transitionend", onEnd);
          go();
        };
        slider.addEventListener("transitionend", onEnd);
      }

      window.setTimeout(go, 450);
    });
  });
}

// Pay page wallet addresses (shown on pay.html)
const PAY_WALLET_ADDRESSES = {
  trc20: "TFjciLMrkwC8Kx967j3AKBBGKBZCnwYxPq",
  sol: "C5qsp3BfnNcw1wLiWg4YU4BeFme5fjwUZEG6E2u1DH2M",
};

// Network tabs (TRC20 / SOL)
const networkTabs = document.querySelectorAll(".network-tab");
const networkPanels = document.querySelectorAll("[data-network-panel]");

function setNetwork(network) {
  networkTabs.forEach((t) => t.classList.toggle("active", t.dataset.network === network));
  networkPanels.forEach((p) => p.classList.toggle("hidden", p.dataset.networkPanel !== network));
  const tabsWrap = document.querySelector(".network-tabs");
  if (tabsWrap) tabsWrap.dataset.active = network;
}

if (networkTabs.length) {
  networkTabs.forEach((t) => t.addEventListener("click", () => setNetwork(t.dataset.network)));
  const preferNetwork = PAY_WALLET_ADDRESSES.trc20?.trim()
    ? "trc20"
    : PAY_WALLET_ADDRESSES.sol?.trim()
      ? "sol"
      : "trc20";
  setNetwork(preferNetwork);
}

// Copy template + open Telegram
const copyTemplateBtn = document.querySelector("[data-copy-template]");
const openTelegramLink = document.querySelector("[data-open-telegram]");
const tgTemplate = document.getElementById("tgTemplate");
const selectedPlan = document.getElementById("selectedPlan");

// Pay page: auto-generate template (market + billing + network) for copy message
let payMarket = "—";
let payBilling = "—";
let payProduct = "";

function getActiveNetworkKey() {
  const active = document.querySelector(".network-tab.active");
  return active?.dataset?.network || "trc20";
}

function getActiveNetworkLabel() {
  const raw = getActiveNetworkKey();
  if (raw === "trc20") return "USDT (TRC20)";
  if (raw === "sol") return "SOL";
  return "—";
}

function refreshPayAccessTail() {
  const el = document.getElementById("payAccessTail");
  if (!el) return;
  let productRaw = "";
  try {
    productRaw = (new URLSearchParams(window.location.search).get("product") || "").toLowerCase();
  } catch {
    productRaw = "";
  }
  if (productRaw === "crypto-bot" || productRaw === "forex-bot") {
    el.textContent = "to get access to the bot.";
  } else if (productRaw === "bundler") {
    el.textContent = "to get access to Bundler.";
  } else {
    el.textContent = "to get access to the VIP group.";
  }
}

function refreshPayTemplate() {
  refreshPayAccessTail();
  if (!tgTemplate) return;
  const network = getActiveNetworkLabel();

  if (selectedPlan) {
    selectedPlan.textContent = payProduct ? payProduct : `${payMarket} · ${payBilling}`;
  }

  tgTemplate.textContent =
`${payProduct ? `Product: ${payProduct}` : `Market: ${payMarket}\nBilling: ${payBilling}`}
Network: ${network}
Username: @___
Transaction ID: ___`;
}

function getTemplateText() {
  return tgTemplate ? tgTemplate.textContent.trim() : "";
}

async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

(function initPayWalletRows() {
  const panel = document.querySelector(".pay-panel");
  if (!panel) return;

  Object.entries(PAY_WALLET_ADDRESSES).forEach(([key, addr]) => {
    const trimmed = (addr || "").trim();
    const valueEl = panel.querySelector(`[data-address="${key}"]`);
    const copyBtn = panel.querySelector(`[data-copy-address="${key}"]`);
    if (valueEl) {
      valueEl.textContent = trimmed || "—";
      valueEl.classList.toggle("addr-value--pending", !trimmed);
    }
    if (!copyBtn) return;
    copyBtn.disabled = !trimmed;
    copyBtn.addEventListener("click", async () => {
      if (!trimmed) return;
      const ok = await copyToClipboard(trimmed);
      if (!ok) return;
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied";
      window.setTimeout(() => {
        copyBtn.textContent = original;
      }, 1200);
    });
  });
})();

if (copyTemplateBtn && tgTemplate) {
  copyTemplateBtn.addEventListener("click", async () => {
    const ok = await copyToClipboard(getTemplateText());
    if (!ok) return;

    const original = copyTemplateBtn.textContent;
    copyTemplateBtn.textContent = "Copied";
    setTimeout(() => (copyTemplateBtn.textContent = original), 1200);
  });
}

if (openTelegramLink && tgTemplate) {
  openTelegramLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const text = getTemplateText();
    await copyToClipboard(text);
    window.open("https://t.me/AltGuruSupport", "_blank", "noopener,noreferrer");
  });
}

// Pricing page: redirect Pay buttons with selected billing auto-attached
const payLinks = document.querySelectorAll(".pricing-page .pay-link");
function getActiveBilling() {
  const active = document.querySelector(".pricing-page .billing-pill.active");
  return active?.dataset?.billing || "monthly";
}

if (payLinks.length) {
  payLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const card = a.closest(".pricing-card");
      const market = card?.dataset?.market;
      if (!market) return;

      e.preventDefault();
      const billing = getActiveBilling();
      window.location.href = `pay.html?market=${encodeURIComponent(market)}&billing=${encodeURIComponent(billing)}`;
    });
  });
}

// Pay page: derive selected market/billing from query string
if (tgTemplate) {
  const params = new URLSearchParams(window.location.search);
  const marketRaw = (params.get("market") || "").toLowerCase();
  const billingRaw = (params.get("billing") || "").toLowerCase();
  const productRaw = (params.get("product") || "").toLowerCase();

  const marketMap = { forex: "Forex", futures: "Futures", spot: "Spot" };
  const billingMap = { monthly: "Monthly", quarterly: "Quarterly" };
  const productMap = {
    "crypto-bot": "Crypto trading bot",
    "forex-bot": "Forex trading bot",
    bundler: "Bundler",
  };

  payMarket = marketMap[marketRaw] || "—";
  payBilling = billingMap[billingRaw] || "—";
  payProduct = productMap[productRaw] || "";
  refreshPayTemplate();
}

// If we're on the pay page, keep template synced when network changes
if (networkTabs.length && tgTemplate) {
  networkTabs.forEach((t) => t.addEventListener("click", refreshPayTemplate));
  refreshPayTemplate();
}

// FAQ accordion (single open)
document.querySelectorAll(".faq-item").forEach((item) => {
  const trigger = item.querySelector(".faq-trigger");
  const panel = item.querySelector(".faq-panel");
  if (!trigger || !panel) return;

  trigger.addEventListener("click", () => {
    const wasOpen = item.classList.contains("is-open");

    document.querySelectorAll(".faq-item").forEach((i) => {
      i.classList.remove("is-open");
      const t = i.querySelector(".faq-trigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });

    if (!wasOpen) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

// ------------------------------
// Site search (navbar) — tries search-index.json, then built-in list (file:// / offline safe)
// Keep SITE_SEARCH_INDEX_EMBEDDED in sync with search-index.json when you edit keywords.
// ------------------------------
(function initSiteSearch() {
  const input = document.querySelector(".nav-search-input");
  const brand = document.querySelector(".nav-brand");
  if (!input || !brand) return;

  const MIN_LEN = 2;
  const DEBOUNCE_MS = 180;

  let searchIndex;
  let loadPromise = null;
  let debounceTimer = null;
  let activeIdx = -1;
  let lastMatches = [];

  const SITE_SEARCH_INDEX_EMBEDDED = [
    {
      title: "Home",
      url: "index.html",
      keywords: ["home", "altguru", "crypto", "forex", "signals", "telegram", "trading", "plan", "risk", "how it works", "pricing", "join"],
    },
    {
      title: "Results",
      url: "results.html",
      keywords: ["results", "performance", "track record", "crypto futures", "futures", "pnl", "logs", "history"],
    },
    {
      title: "Results — Spot",
      url: "results-spot.html",
      keywords: ["spot", "results", "crypto spot", "performance"],
    },
    {
      title: "Results — Forex",
      url: "results-forex.html",
      keywords: ["forex", "fx", "results", "performance", "currencies"],
    },
    {
      title: "Signals",
      url: "signals.html",
      keywords: ["signals", "trade ideas", "crypto signals", "futures", "spot", "telegram", "vip", "subscription", "levels", "risk"],
    },
    {
      title: "Bots",
      url: "bots.html",
      keywords: ["bots", "trading bot", "automation", "crypto bot", "forex bot", "bundler", "wallet", "token", "strategies"],
    },
    {
      title: "Pricing",
      url: "pricing.html",
      keywords: ["pricing", "plans", "cost", "subscribe", "monthly", "vip", "futures", "bundler", "crypto bot", "forex bot", "payment"],
    },
    {
      title: "Pay with crypto",
      url: "pay.html",
      keywords: ["pay", "crypto payment", "usdt", "trc20", "transaction", "txid", "activation", "billing", "support"],
    },
    {
      title: "About",
      url: "about.html",
      keywords: ["about", "team", "who we are", "risk", "disclaimer", "support", "altguru"],
    },
    {
      title: "Contact us",
      url: "contact.html",
      keywords: ["contact", "contact us", "email", "telegram", "message", "support", "help", "reach"],
    },
    {
      title: "News",
      url: "news.html",
      keywords: ["news", "updates", "announcements", "blog"],
    },
    {
      title: "Log in",
      url: "join.html",
      keywords: ["login", "log in", "join", "account", "member", "access", "sign in"],
    },
    {
      title: "Privacy policy",
      url: "privacy.html",
      keywords: ["privacy", "data", "gdpr", "cookies", "ip", "analytics", "tracking", "policy"],
    },
    {
      title: "Terms of Service",
      url: "terms.html",
      keywords: ["terms", "legal", "conditions", "tos", "agreement", "subscription", "refund", "disclaimer", "liability"],
    },
  ];

  function safePageUrl(u) {
    if (!/^[a-z0-9._-]+\.html$/i.test(u)) return "#";
    return u;
  }

  function normalizeRaw(data) {
    if (!Array.isArray(data)) return [];
    return data
      .filter((e) => e && typeof e.title === "string" && typeof e.url === "string")
      .map((e) => ({
        title: e.title.trim(),
        url: safePageUrl(e.url.trim()),
        keywords: Array.isArray(e.keywords)
          ? e.keywords.map((k) => String(k).toLowerCase().trim()).filter(Boolean)
          : [],
      }))
      .filter((e) => e.title && e.url !== "#");
  }

  function loadIndex() {
    if (searchIndex !== undefined) return Promise.resolve(searchIndex);
    if (loadPromise) return loadPromise;

    const url = new URL("search-index.json", document.baseURI).href;

    loadPromise = fetch(url, { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.json();
      })
      .then((data) => normalizeRaw(data))
      .catch(() => normalizeRaw(SITE_SEARCH_INDEX_EMBEDDED))
      .then((normalized) => {
        searchIndex = normalized.length ? normalized : normalizeRaw(SITE_SEARCH_INDEX_EMBEDDED);
        return searchIndex;
      });

    return loadPromise;
  }

  function haystack(entry) {
    return [entry.title, entry.url, entry.keywords.join(" ")].join(" ").toLowerCase();
  }

  /** Match full phrase or any word (2+ chars); multi-word uses OR so each word can surface pages. */
  function matchEntry(entry, q) {
    const h = haystack(entry);
    const parts = q.split(/\s+/).filter(Boolean);
    if (!parts.length) return false;
    if (h.includes(q)) return true;
    const significant = parts.filter((p) => p.length >= 2);
    if (!significant.length) return false;
    return significant.some((p) => h.includes(p));
  }

  const dropdown = document.createElement("div");
  dropdown.className = "nav-search-dropdown";
  dropdown.id = "navSearchDropdown";
  dropdown.setAttribute("hidden", "");
  dropdown.innerHTML =
    '<p class="nav-search-status" hidden></p><ul class="nav-search-list"></ul><p class="nav-search-empty" hidden></p>';
  brand.appendChild(dropdown);

  const statusEl = dropdown.querySelector(".nav-search-status");
  const listEl = dropdown.querySelector(".nav-search-list");
  const emptyEl = dropdown.querySelector(".nav-search-empty");

  function setStatus(text, show) {
    statusEl.textContent = text;
    statusEl.hidden = !show;
  }

  function hideDropdown() {
    dropdown.setAttribute("hidden", "");
    activeIdx = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function showDropdown() {
    dropdown.removeAttribute("hidden");
    input.setAttribute("aria-expanded", "true");
  }

  function renderList(matches) {
    lastMatches = matches;
    activeIdx = matches.length ? 0 : -1;
    listEl.innerHTML = "";
    emptyEl.hidden = true;

    setStatus("", false);

    if (!matches.length) {
      emptyEl.textContent = "No pages match.";
      emptyEl.hidden = false;
      showDropdown();
      return;
    }

    matches.forEach((entry, i) => {
      const li = document.createElement("li");
      li.className = "nav-search-item";
      li.setAttribute("role", "presentation");
      if (i === 0) li.classList.add("is-active");

      const a = document.createElement("a");
      a.href = entry.url;
      a.setAttribute("role", "option");
      a.dataset.idx = String(i);

      const titleSpan = document.createElement("span");
      titleSpan.className = "nav-search-item-title";
      titleSpan.textContent = entry.title;

      a.appendChild(titleSpan);
      li.appendChild(a);
      listEl.appendChild(li);
    });

    showDropdown();
  }

  function updateActive(delta) {
    if (!lastMatches.length) return;
    const n = lastMatches.length;
    activeIdx = (activeIdx + delta + n) % n;
    listEl.querySelectorAll(".nav-search-item").forEach((li, i) => {
      li.classList.toggle("is-active", i === activeIdx);
    });
    const activeLink = listEl.querySelector(`.nav-search-item:nth-child(${activeIdx + 1}) a`);
    if (activeLink) activeLink.scrollIntoView({ block: "nearest" });
  }

  function goActive() {
    if (activeIdx < 0 || !lastMatches[activeIdx]) return;
    const url = lastMatches[activeIdx].url;
    if (url && url !== "#") window.location.href = url;
  }

  function runSearch(qRaw) {
    const q = qRaw.trim().toLowerCase();
    if (q.length < MIN_LEN) {
      hideDropdown();
      return Promise.resolve();
    }

    return loadIndex().then((data) => {
      const rows = Array.isArray(data) ? data : [];
      const matches = rows.filter((e) => matchEntry(e, q));
      renderList(matches);
    });
  }

  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", "navSearchDropdown");
  input.setAttribute("autocomplete", "off");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value), DEBOUNCE_MS);
  });

  input.addEventListener("focus", () => {
    loadIndex();
    if (input.value.trim().length >= MIN_LEN) runSearch(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdown.hasAttribute("hidden") && lastMatches.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        updateActive(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateActive(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        goActive();
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideDropdown();
        input.blur();
      }
    } else if (e.key === "Enter" && input.value.trim().length >= MIN_LEN) {
      e.preventDefault();
      runSearch(input.value).then(() => {
        if (lastMatches.length === 1) goActive();
      });
    }
  });

  listEl.addEventListener("mousedown", (e) => {
    const a = e.target.closest("a");
    if (a && a.href) e.preventDefault();
  });

  listEl.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a && a.href) {
      window.location.href = a.getAttribute("href");
    }
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!brand.contains(e.target)) hideDropdown();
    },
    true
  );

  loadIndex();
})();

// Home mega-footer: the "FAQs" link must open the dedicated hub (not index#faq).
(function () {
  const homeFooter = document.querySelector(".site-footer-home");
  if (!homeFooter) return;
  homeFooter.querySelectorAll("a[href]").forEach((a) => {
    if ((a.textContent || "").trim() !== "FAQs") return;
    try {
      a.setAttribute("href", new URL("faqs.html", window.location.href).href);
    } catch (_) {
      a.setAttribute("href", "faqs.html");
    }
  });
})();
