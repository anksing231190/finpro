export function goScreen(i) {
  document.querySelectorAll('.screen').forEach((s, j) => s.classList.toggle('active', i === j));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function initNavigation() {
  document.querySelectorAll('[data-screen]').forEach((el) => {
    el.addEventListener('click', () => goScreen(Number(el.dataset.screen)));
  });
}
