(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "English";
  const BOARD_PREFIX = "board3";
  const MAX_SLIDES = 7;

  let translations = null;

  const savedLang = normalizeLang(localStorage.getItem(LANG_KEY));

  document.documentElement.classList.add("lang-loading");
  setLangAttributes(savedLang);

  function normalizeLang(lang) {
    if (lang === "Hindi" || lang === "Gujarati" || lang === "English") {
      return lang;
    }
    return DEFAULT_LANG;
  }

  function getLangCode(lang) {
    if (lang === "Hindi") return "hi";
    if (lang === "Gujarati") return "gu";
    return "en";
  }

  function setLangAttributes(lang) {
    const code = getLangCode(lang);

    document.documentElement.setAttribute("lang", code);
    document.documentElement.setAttribute("data-lang", code);

    if (document.body) {
      document.body.setAttribute("data-lang", code);
    }
  }

  async function loadTranslations() {
    if (translations) return translations;

    try {
      const res = await fetch("/JSON/data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("JSON not found");
      translations = await res.json();
    } catch (err) {
      console.error("Translation load failed:", err);
      translations = {};
    }

    return translations;
  }

  function setActiveUI(lang) {
    const container = document.querySelector(".navbar-language");
    if (!container) return;

    container.classList.remove("lang-left", "lang-right", "lang-middle");

    if (lang === "English") container.classList.add("lang-left");
    if (lang === "Hindi") container.classList.add("lang-middle");
    if (lang === "Gujarati") container.classList.add("lang-right");

    document.querySelectorAll(".navbar-language > div").forEach((btn) => {
      btn.classList.remove("lang-active");
    });

    const mapBtn = {
      English: ".english-button",
      Hindi: ".hindi-button",
      Gujarati: ".gujrati-button",
    };

    document.querySelector(mapBtn[lang])?.classList.add("lang-active");
  }

  function setElementText(el, value) {
    if (value == null) return;

    if (String(value).includes("<br")) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  }

  function updateStaticLanguage(lang) {
    if (!translations || !translations[lang]) return;

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");
      const value = translations[lang][key];

      if (value == null) return;
      setElementText(el, value);
    });
  }

  function updateBoardText(lang) {
    if (!translations || !translations[lang]) return;

    const boardText = document.getElementById("boardText");
    if (!boardText) return;

    let index = 1;

    if (window.swiper && typeof window.swiper.realIndex === "number") {
      index = window.swiper.realIndex + 1;
    } else if (window.swiper && typeof window.swiper.activeIndex === "number") {
      index = window.swiper.activeIndex + 1;
    }

    index = Math.min(index, MAX_SLIDES);

    const slideKey = `${BOARD_PREFIX}.slide${index}`;
    const value = translations[lang][slideKey];

    if (!value) return;

    boardText.innerHTML = `<h2 data-lang-key="${slideKey}">${value}</h2>`;
  }

  function applyLanguage(lang) {
    lang = normalizeLang(lang);

    localStorage.setItem(LANG_KEY, lang);
    setLangAttributes(lang);
    setActiveUI(lang);
    updateStaticLanguage(lang);
    updateBoardText(lang);
  }

  function showPage() {
    document.documentElement.classList.remove("lang-loading");
    document.documentElement.classList.add("lang-ready");
  }

  async function initLang() {
    await loadTranslations();

    const saved = normalizeLang(localStorage.getItem(LANG_KEY));

    applyLanguage(saved);

    document
      .querySelector(".english-button")
      ?.addEventListener("click", () => applyLanguage("English"));

    document
      .querySelector(".hindi-button")
      ?.addEventListener("click", () => applyLanguage("Hindi"));

    document
      .querySelector(".gujrati-button")
      ?.addEventListener("click", () => applyLanguage("Gujarati"));

    window.setLanguage = applyLanguage;

    showPage();
  }

  document.addEventListener("DOMContentLoaded", initLang);

  window.setLanguage = (lang) => applyLanguage(lang);
})();

// tooltip
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("pageTooltip");
  if (!tooltip) return;

  const tooltipText = tooltip.querySelector(".tooltip-text");
  if (!tooltipText) return;

  const tooltipColors = {
    destroy: "rgba(173, 147, 197, 0.65)",
    nature: "rgba(250, 162, 44, 0.65)",
    save: "rgba(246, 157, 155, 0.65)",
  };

  function placeTooltipToIcon(link) {
    const rect = link.getBoundingClientRect();
    const topVH = ((rect.top + rect.height / 2) / window.innerHeight) * 99;

    tooltip.style.top = `${topVH}vh`;
    tooltip.style.right = `1vw`;
    tooltip.style.left = `auto`;
  }

  document.querySelectorAll(".pages a").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const tipId = link.querySelector("img")?.dataset.tip;
      const source = document.getElementById(tipId);

      if (!source) return;

      tooltipText.textContent = source.textContent;
      tooltip.style.background =
        tooltipColors[tipId] || "rgba(96, 97, 159, 0.75)";

      placeTooltipToIcon(link);

      tooltip.classList.remove("show");
      void tooltip.offsetWidth;
      tooltip.classList.add("show");
    });

    link.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
    });
  });

  window.addEventListener("resize", () => {
    if (!tooltip.classList.contains("show")) return;

    const active = document.querySelector(".pages a:hover");
    if (active) placeTooltipToIcon(active);
  });
});

// page load animation
window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const html = document.documentElement;
  const title = document.querySelector(".title");

  if (!title) return;

  body.classList.add("intro");
  html.classList.add("intro");

  function measureFinalTitlePosition() {
    body.classList.add("measure-final");
    body.classList.remove("intro");
    html.classList.remove("intro");

    const finalRect = title.getBoundingClientRect();

    body.classList.add("intro");
    html.classList.add("intro");
    body.classList.remove("measure-final");

    return finalRect;
  }

  const style = document.createElement("style");
  style.textContent = `
    html.lang-loading body {
      visibility: hidden;
    }

    html.lang-ready body {
      visibility: visible;
    }

    body.measure-final .title {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      transform: none !important;
      visibility: hidden !important;
    }

    body.measure-final .home-btn,
    body.measure-final .navbar-language,
    body.measure-final .page-content {
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);

  const finalRect = measureFinalTitlePosition();
  const startRect = title.getBoundingClientRect();

  title.style.setProperty("--dx", finalRect.left - startRect.left + "px");
  title.style.setProperty("--dy", finalRect.top - startRect.top + "px");

  setTimeout(() => {
    body.classList.add("intro-fly");

    title.addEventListener(
      "animationend",
      () => {
        body.classList.add("intro-done");

        body.classList.remove("intro");
        body.classList.remove("intro-fly");
        html.classList.remove("intro");
      },
      { once: true }
    );
  }, 1000);
});