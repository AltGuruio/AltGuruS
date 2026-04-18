/**
 * Home ticker: CoinGecko — BTC, ETH, SOL, XRP, DOGE. Polls every 60s; no persistence.
 */
(function () {
  const COINGECKO =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin&vs_currencies=usd&include_24hr_change=true";
  const INTERVAL_MS = 60_000;

  function fmtInt(n) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  }

  function fmtDec(n, minF, maxF) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: minF,
      maximumFractionDigits: maxF,
    }).format(n);
  }

  function fmtPct(change) {
    if (change == null || Number.isNaN(change)) {
      return { text: "—", cls: "flat" };
    }
    const sign = change > 0 ? "+" : "";
    const text = `${sign}${change.toFixed(2)}%`;
    const cls = change > 0 ? "up" : change < 0 ? "down" : "flat";
    return { text, cls };
  }

  function formatPrice(key, n) {
    if (key === "btc" || key === "eth") return fmtInt(n);
    if (key === "sol") return fmtDec(n, 2, 2);
    if (key === "xrp") return fmtDec(n, 2, 4);
    if (key === "doge") return fmtDec(n, 4, 5);
    return fmtDec(n, 2, 2);
  }

  function updateTicker(key, priceText, pct) {
    document.querySelectorAll(`.ticker-item[data-ticker="${key}"]`).forEach((el) => {
      const p = el.querySelector(".ticker-price");
      const e = el.querySelector(".ticker-pct");
      if (p) p.textContent = priceText;
      if (e) {
        e.textContent = pct.text;
        e.className = `ticker-pct ${pct.cls}`;
      }
    });
  }

  async function tick() {
    try {
      const res = await fetch(COINGECKO);
      if (!res.ok) throw new Error("coingecko");
      const j = await res.json();
      const pairs = [
        { key: "btc", data: j.bitcoin },
        { key: "eth", data: j.ethereum },
        { key: "sol", data: j.solana },
        { key: "xrp", data: j.ripple },
        { key: "doge", data: j.dogecoin },
      ];
      for (const { key, data } of pairs) {
        if (!data || typeof data.usd !== "number") continue;
        updateTicker(key, formatPrice(key, data.usd), fmtPct(data.usd_24h_change));
      }
    } catch (err) {
      console.warn("[ticker]", err);
    }
  }

  function start() {
    if (!document.querySelector(".ticker-track")) return;
    tick();
    setInterval(tick, INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
