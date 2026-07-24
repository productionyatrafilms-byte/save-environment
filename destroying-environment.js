(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "English";
  const LANGS = ["English", "Hindi", "Gujarati"];

  let translations = null;
  let popSfx = null;
  let pendingLang =
    localStorage.getItem(LANG_KEY) && LANGS.includes(localStorage.getItem(LANG_KEY))
      ? localStorage.getItem(LANG_KEY)
      : DEFAULT_LANG;

  function getLangCode(lang) {
    if (lang === "Hindi") return "hi";
    if (lang === "Gujarati") return "gu";
    return "en";
  }

  // IMPORTANT: set selected language immediately before DOM paints fully
  document.documentElement.setAttribute("lang", getLangCode(pendingLang));
  document.documentElement.setAttribute("data-lang-loading", "true");

  const antiFlashStyle = document.createElement("style");
  antiFlashStyle.textContent = `
    html[data-lang-loading="true"] [data-lang-key],
    html[data-lang-loading="true"] #boardText {
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(antiFlashStyle);

  const playPop = () => {
    try {
      if (!popSfx) return;
      popSfx.currentTime = 0;
      popSfx.play();
    } catch (_) {}
  };

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

  function updateBoardText(lang) {
    const swiperInstance =
      window.swiper || document.querySelector(".imageSwiper")?.swiper;

    const boardText = document.getElementById("boardText");

    if (!boardText || !translations?.[lang]) return;

    const index =
      swiperInstance && typeof swiperInstance.realIndex === "number"
        ? swiperInstance.realIndex + 1
        : 1;

    const slideKey = `board1.slide${Math.min(index, 5)}`;
    const txt = translations[lang][slideKey];

    if (txt) {
      boardText.innerHTML = `<h2>${txt}</h2>`;
    }
  }

  function applyLanguage(lang) {
    if (!LANGS.includes(lang)) lang = DEFAULT_LANG;

    // Do NOT switch to English unless selected language truly does not exist in JSON
    if (!translations?.[lang]) {
      console.warn(`${lang} translations not found`);
      lang = DEFAULT_LANG;
    }

    document.documentElement.setAttribute("lang", getLangCode(lang));
    document.body.setAttribute("data-lang", getLangCode(lang));

    setActiveUI(lang);

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");
      const value = translations?.[lang]?.[key];

      if (value == null) return;

      if (String(value).includes("<br")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    updateBoardText(lang);

    localStorage.setItem(LANG_KEY, lang);
    pendingLang = lang;

    document.documentElement.removeAttribute("data-lang-loading");
  }

  async function initLang() {
    document.body.setAttribute("data-lang", getLangCode(pendingLang));

    await loadTranslations();

    popSfx = document.getElementById("clickEffect");

    const savedLang = localStorage.getItem(LANG_KEY);
    const currentLang =
      savedLang && LANGS.includes(savedLang) && translations?.[savedLang]
        ? savedLang
        : DEFAULT_LANG;

    applyLanguage(currentLang);

    const englishBtn = document.querySelector(".english-button");
    const hindiBtn = document.querySelector(".hindi-button");
    const gujratiBtn = document.querySelector(".gujrati-button");

    englishBtn?.addEventListener("click", () => {
      playPop();
      applyLanguage("English");
    });

    hindiBtn?.addEventListener("click", () => {
      playPop();
      applyLanguage("Hindi");
    });

    gujratiBtn?.addEventListener("click", () => {
      playPop();
      applyLanguage("Gujarati");
    });

    window.setLanguage = applyLanguage;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLang);
  } else {
    initLang();
  }

  window.setLanguage = (lang) => {
    pendingLang = lang;
    if (translations) applyLanguage(lang);
  };
})();

// tooltip
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("pageTooltip");
  const tooltipText = tooltip?.querySelector(".tooltip-text");

  if (!tooltip || !tooltipText) return;

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