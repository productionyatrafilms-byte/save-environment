(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "English";
  let translations = null;
  let popSfx = null;

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
      const res = await fetch("/JSON/data.json");
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
    else if (lang === "Gujarati") container.classList.add("lang-right");
    else if (lang === "Hindi") container.classList.add("lang-middle");

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
    document.documentElement.setAttribute("lang", lang);
    document.body.setAttribute(
      "data-lang",
      lang === "Hindi" ? "hi" : lang === "Gujarati" ? "gu" : "en",
    );
    setActiveUI(lang);
    if (!translations || !translations[lang]) return;

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");
      const value = translations[lang][key];
      if (value == null) return;

      if (String(value).includes("<br")) el.innerHTML = value;
      else el.textContent = value;
    });

    localStorage.setItem(LANG_KEY, lang);
  }

  async function initLang() {
    await loadTranslations();

    localStorage.removeItem(LANG_KEY);
    popSfx = document.getElementById("flowerClickSfx"); // ✅ now it exists
    applyLanguage(DEFAULT_LANG);

    const englishBtn = document.querySelector(".english-button");
    const hindiBtn = document.querySelector(".hindi-button");
    const gujratiBtn = document.querySelector(".gujrati-button");
    [englishBtn, hindiBtn, gujratiBtn].forEach((btn) => {
      if (!btn) return;

      btn.addEventListener("click", () => {
        playPop();
        if (btn === englishBtn) applyLanguage("English");
        if (btn === hindiBtn) applyLanguage("Hindi");
        if (btn === gujratiBtn) applyLanguage("Gujarati");
      });
    });

    window.setLanguage = applyLanguage;
  }

  document.addEventListener("DOMContentLoaded", initLang);
})();
