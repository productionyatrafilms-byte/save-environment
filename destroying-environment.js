(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "English";
  let translations = null;

  async function loadTranslations() {
    if (translations) return translations;
    try {
      const res = await fetch("./json/data.json");
      if (!res.ok) throw new Error("JSON not found");
      translations = await res.json();
    } catch (err) {
      translations = {};
    }
    return translations;
  }

  function setActiveUI(lang) {
    const container = document.querySelector(".navbar-language");
    if (!container) return;

    container.classList.remove("lang-left", "lang-right");
    if (lang === "English") container.classList.add("lang-left");
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

  function applyLanguage(lang) {
    setActiveUI(lang);
    if (!translations || !translations[lang]) return;

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      if (el.children.length > 0) return;
      const key = el.getAttribute("data-lang-key");
      const value = translations[lang][key];
      if (value == null) return;
      if (String(value).includes("<br")) el.innerHTML = value;
      else el.textContent = value;
    });

    localStorage.setItem(LANG_KEY, lang);

    if (window.swiper && typeof window.swiper.realIndex === "number") {
      const idx = window.swiper.realIndex + 1;
      const board1 = document.getElementById("boardText");
      const slideKey = `board1.slide${Math.min(idx, 5)}`;
      const txt = translations[lang][slideKey];
      if (board1 && txt) board1.innerHTML = `<h2>${txt}</h2>`;
    }
  }

  async function initLang() {
    await loadTranslations();

    const saved = DEFAULT_LANG;
    localStorage.setItem(LANG_KEY, saved);
    setActiveUI(saved);

    const waitIntro = () => {
      if (!document.body.classList.contains("intro")) {
        applyLanguage(saved);
        return;
      }
      requestAnimationFrame(waitIntro);
    };
    waitIntro();

    document
      .querySelector(".english-button")
      ?.addEventListener("click", () => applyLanguage("English"));
    document
      .querySelector(".hindi-button")
      ?.addEventListener("click", () => applyLanguage("Hindi"));
    document
      .querySelector(".gujrati-button")
      ?.addEventListener("click", () => applyLanguage("Gujarati"));
  }

  document.addEventListener("DOMContentLoaded", initLang);
  window.setLanguage = (lang) => applyLanguage(lang);
})();

//  tooltip
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("pageTooltip");
  const tooltipText = tooltip.querySelector(".tooltip-text");

  const tooltipColors = {
    destroy: "rgba(173, 147, 197, 0.65)",
    nature:  "rgba(250, 162, 44, 0.65)",
    save:    "rgba(246, 157, 155, 0.65)"
  };

  function placeTooltipToIcon(link){
    const rect = link.getBoundingClientRect();
    const topVH = ((rect.top + rect.height / 2) / window.innerHeight) * 99;
    tooltip.style.top = `${topVH}vh`;
    tooltip.style.right = `1vw`;
    tooltip.style.left = `auto`;
  }

  document.querySelectorAll(".pages a").forEach(link => {
    link.addEventListener("mouseenter", () => {
      const tipId = link.querySelector("img")?.dataset.tip;
      const source = document.getElementById(tipId);
      if (!source) return;

      tooltipText.textContent = source.textContent;
      tooltip.style.background = tooltipColors[tipId] || "rgba(96, 97, 159, 0.75)";

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
// page load

    window.addEventListener("DOMContentLoaded", () => {
      const body = document.body;
      const html = document.documentElement;          
      const title = document.querySelector(".title");

      body.classList.add("intro");
      html.classList.add("intro");                 


      function measureFinalTitlePosition() {
        body.classList.add("measure-final");
        body.classList.remove("intro");             
        html.classList.remove("intro");              

        const finalRect = title.getBoundingClientRect();

        // restore intro state
        body.classList.add("intro");                
        html.classList.add("intro");                 
        body.classList.remove("measure-final");

        return finalRect;
      }

      // Create CSS for measuring (injected once)
      const style = document.createElement("style");
      style.textContent = `
    body.measure-final .title{
      position: relative !important;
      left: auto !important;
      top: auto !important;
      transform: none !important;
      visibility: hidden !important;
    }
    body.measure-final .home-btn,
    body.measure-final .navbar-language,
    body.measure-final .page-content{
      visibility: hidden !important;
    }
  `;
      document.head.appendChild(style);

      // Measure where it should land
      const finalRect = measureFinalTitlePosition();

      // Current center position (fixed)
      const startRect = title.getBoundingClientRect();

      // Compute delta from center -> final
      const dx = (finalRect.left - startRect.left) + "px";
      const dy = (finalRect.top - startRect.top) + "px";

      // Store deltas as CSS vars
      title.style.setProperty("--dx", dx);
      title.style.setProperty("--dy", dy);

      // Start intro: after 2s fly up smoothly
      setTimeout(() => {
        body.classList.add("intro-fly");

        // When animation ends:
        title.addEventListener("animationend", () => {
          body.classList.add("intro-done");

          body.classList.remove("intro");
          body.classList.remove("intro-fly");
          html.classList.remove("intro");             

        }, { once: true });

      }, 1000);
    });