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
    setActiveUI(lang);
    if (!translations || !translations[lang]) return;

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      // ❌ this line can block updates if element has child tags
      // if (el.children.length > 0) return;

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

    // ✅ Always reset to English on refresh
    localStorage.removeItem(LANG_KEY);
    applyLanguage(DEFAULT_LANG);

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
  }

  document.addEventListener("DOMContentLoaded", initLang);
})();
