(function () {
  "use strict";
  var KEY = "rl_theme", root = document.documentElement, bound = false;
  function apply(t) {
    root.dataset.theme = t;
    var btn = document.getElementById("theme"); if (!btn) return;
    btn.setAttribute("aria-pressed", String(t === "dark"));
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    var u = btn.querySelector("use"); if (u) u.setAttribute("href", t === "dark" ? "#i-sun" : "#i-moon");
  }
  window.initTheme = function () {
    var btn = document.getElementById("theme");
    apply(root.dataset.theme || "light");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        var t = root.dataset.theme === "dark" ? "light" : "dark";
        try { localStorage.setItem(KEY, t); } catch (e) {}
        apply(t);
      });
    }
    if (!bound) {
      bound = true;
      try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) { if (!localStorage.getItem(KEY)) apply(e.matches ? "dark" : "light"); }); } catch (e) {}
    }
  };
  window.initTheme();
})();
