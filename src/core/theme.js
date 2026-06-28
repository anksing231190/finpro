function applyTheme(mode) {
  const root = document.documentElement;
  let eff = mode;
  if (mode === 'system') {
    eff = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (eff === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
}

export function setTheme(mode) {
  try {
    localStorage.setItem('apex-theme', mode);
  } catch (e) {
    /* ignore */
  }
  applyTheme(mode);
  document.querySelectorAll('#themeSeg button').forEach((b) =>
    b.classList.toggle('on', b.dataset.theme === mode),
  );
}

export function initTheme() {
  let saved = 'light';
  try {
    saved = localStorage.getItem('apex-theme') || 'light';
  } catch (e) {
    /* ignore */
  }
  applyTheme(saved);
  document.querySelectorAll('#themeSeg button').forEach((b) =>
    b.classList.toggle('on', b.dataset.theme === saved),
  );
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    let cur = 'light';
    try {
      cur = localStorage.getItem('apex-theme') || 'light';
    } catch (e) {
      /* ignore */
    }
    if (cur === 'system') applyTheme('system');
  });

  document.querySelectorAll('#themeSeg button[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
}
