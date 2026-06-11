(function () {
  var STORAGE_KEY = 'theme-preference';
  var btn, mediaQuery;

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  }

  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function nextMode(current) {
    var modes = ['system', 'light', 'dark'];
    var idx = modes.indexOf(current);
    return modes[(idx + 1) % modes.length];
  }

  function updateButton(mode) {
    if (!btn) return;
    var labels = { system: '🖥️', light: '🔆', dark: '🌙' };
    var names = { system: 'Auto', light: 'Claro', dark: 'Oscuro' };
    btn.textContent = labels[mode] || '\u25D0';
    btn.setAttribute('aria-label', 'Tema: ' + (names[mode] || 'Auto'));
    btn.setAttribute('title', 'Tema: ' + (names[mode] || 'Auto') + ' (clic para cambiar)');
  }

  function toggleTheme() {
    var current = getTheme();
    var next = nextMode(current);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    updateButton(next);
  }

  function init() {
    btn = document.getElementById('theme-toggle');
    var mode = getTheme();
    applyTheme(mode);
    if (btn) {
      updateButton(mode);
      btn.addEventListener('click', toggleTheme);
    }

    mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', function () {
      if (getTheme() === 'system') {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
