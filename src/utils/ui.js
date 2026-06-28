export function toggleChk(el) {
  el.querySelector('.chk').classList.toggle('on');
}

export function initCheckboxes() {
  document.querySelectorAll('.check[data-toggle-chk]').forEach((el) => {
    el.addEventListener('click', () => toggleChk(el));
  });
}
