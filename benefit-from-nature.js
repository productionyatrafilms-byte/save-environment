(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "English";
  const BOARD_PREFIX = "board2";

  let translations = {};
  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  let popSfx = null;
  let swiper = null;

  function normalizeLang(lang) {
    if (["English", "Hindi", "Gujarati"].includes(lang)) return lang;
    return DEFAULT_LANG;
  }

  function langCode(lang) {
    if (lang === "Hindi") return "hi";
    if (lang === "Gujarati") return "gu";
    return "en";
  }

  function setLangAttributes(lang) {
    const code = langCode(lang);

    document.documentElement.setAttribute("lang", code);
    document.documentElement.setAttribute("data-lang", code);

    if (document.body) {
      document.body.setAttribute("data-lang", code);
    }
  }

  setLangAttributes(currentLang);

  function playAudio(audio) {
    try {
      if (!audio) return;
      audio.currentTime = 0;
      audio.play();
    } catch (_) {}
  }

  function playPop() {
    playAudio(popSfx);
  }

  async function loadTranslations() {
    try {
      const res = await fetch("/JSON/data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("data.json not found");
      translations = await res.json();
    } catch (err) {
      console.error("Translation loading failed:", err);
      translations = {};
    }
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

    const btnMap = {
      English: ".english-button",
      Hindi: ".hindi-button",
      Gujarati: ".gujrati-button",
    };

    document.querySelector(btnMap[lang])?.classList.add("lang-active");
  }

  function setText(el, value) {
    if (value == null) return;

    if (String(value).includes("<br")) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  }

  function updateStaticTexts(lang) {
    const data = translations[lang];
    if (!data) return;

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");
      const value = data[key];

      if (value == null) return;
      setText(el, value);
    });
  }

  function updateBoardText() {
    const boardText = document.getElementById("boardText");
    if (!boardText) return;

    const lang = normalizeLang(currentLang);
    const data = translations[lang];
    if (!data) return;

    const activeIndex = swiper ? swiper.realIndex || swiper.activeIndex || 0 : 0;
    const slideKey = `${BOARD_PREFIX}.slide${activeIndex + 1}`;
    const value = data[slideKey];

    if (!value) return;

    boardText.innerHTML = `<h2 data-lang-key="${slideKey}">${value}</h2>`;
  }

  function applyLanguage(lang) {
    currentLang = normalizeLang(lang);

    localStorage.setItem(LANG_KEY, currentLang);
    setLangAttributes(currentLang);
    setActiveUI(currentLang);
    updateStaticTexts(currentLang);
    updateBoardText();
  }

  function showPageAfterLanguageApplied() {
    document.documentElement.classList.remove("lang-loading");
    document.documentElement.classList.add("lang-ready");
  }

  function initLanguageButtons() {
    popSfx = document.getElementById("clickEffect");

    document.querySelector(".english-button")?.addEventListener("click", () => {
      playPop();
      applyLanguage("English");
    });

    document.querySelector(".hindi-button")?.addEventListener("click", () => {
      playPop();
      applyLanguage("Hindi");
    });

    document.querySelector(".gujrati-button")?.addEventListener("click", () => {
      playPop();
      applyLanguage("Gujarati");
    });
  }

  function initTooltip() {
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
      tooltip.style.left = "auto";
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
  }

  function initSwiperAndAudio() {
    const navClick = document.getElementById("NavigateClick");
    const homeAudio = document.getElementById("HomePage");
    const swipeEffect = document.getElementById("SwipeEffect");

    const playSwipe = () => playAudio(swipeEffect);

    const boardText = document.getElementById("boardText");

    swiper = new Swiper(".imageSwiper", {
      loop: false,
      speed: 600,
      pagination: {
        el: ".env-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".env-next",
        prevEl: ".env-prev",
      },
      on: {
        init: function () {
          window.swiper = this;

          const updateNavState = () => {
            const prevBtn = this.navigation?.prevEl;
            const nextBtn = this.navigation?.nextEl;

            if (prevBtn) {
              const disabled = this.isBeginning;
              prevBtn.disabled = disabled;
              prevBtn.style.opacity = disabled ? "0.4" : "1";
              prevBtn.style.pointerEvents = disabled ? "none" : "auto";
            }

            if (nextBtn) {
              const disabled = this.isEnd;
              nextBtn.disabled = disabled;
              nextBtn.style.opacity = disabled ? "0.4" : "1";
              nextBtn.style.pointerEvents = disabled ? "none" : "auto";
            }
          };

          this._updateNavState = updateNavState;
          updateNavState();

          updateBoardText();

          this.navigation?.nextEl?.addEventListener("click", playSwipe);
          this.navigation?.prevEl?.addEventListener("click", playSwipe);

          this.pagination?.el?.addEventListener("click", (e) => {
            if (e.target.closest(".swiper-pagination-bullet")) {
              playSwipe();
            }
          });
        },

        slideChange: function () {
          this._updateNavState?.();
          updateBoardText();
        },

        touchEnd: function () {
          if (this.touches && this.touches.diff !== 0) {
            playSwipe();
          }
        },
      },
    });

    const pages = document.querySelector(".pages");
    const homeLink = document.querySelector(".home-btn a");

    if (pages && navClick) {
      pages.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a || !pages.contains(a)) return;
        if (document.body.classList.contains("intro")) return;

        e.preventDefault();

        const href = a.getAttribute("href");
        if (!href) return;

        playAudio(navClick);

        setTimeout(() => {
          window.location.href = href;
        }, 500);
      });
    }

    if (homeLink && homeAudio) {
      homeLink.addEventListener("click", (e) => {
        if (document.body.classList.contains("intro")) return;

        e.preventDefault();

        const href = homeLink.getAttribute("href");
        if (!href) return;

        playAudio(homeAudio);

        setTimeout(() => {
          window.location.href = href;
        }, 800);
      });
    }

    const unlock = async () => {
      try {
        if (!navClick) return;

        navClick.muted = true;
        await navClick.play();
        navClick.pause();
        navClick.currentTime = 0;
        navClick.muted = false;
      } catch (_) {}

      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("touchstart", unlock);
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
  }

  function initIntroAnimation() {
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
  }

  async function init() {
    currentLang = normalizeLang(localStorage.getItem(LANG_KEY) || DEFAULT_LANG);
    setLangAttributes(currentLang);

    await loadTranslations();

    initLanguageButtons();
    initTooltip();
    initSwiperAndAudio();

    applyLanguage(currentLang);
    showPageAfterLanguageApplied();

    initIntroAnimation();

    window.setLanguage = applyLanguage;
  }

  document.addEventListener("DOMContentLoaded", init);
})();