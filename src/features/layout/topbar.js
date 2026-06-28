import { supabase } from '../../lib/supabase.js';
import { fullReset } from '../../core/state.js';
import { goScreen } from '../../core/navigation.js';
import { showToast } from '../../core/toast.js';
import { clearForm } from '../review/form.js';

function toggleDropdown(e) {
  e.stopPropagation();
  document.getElementById('dropdown').classList.toggle('show');
}

export function openModal(id) {
  document.getElementById('dropdown').classList.remove('show');
  document.getElementById(id).classList.add('show');
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

export async function logout() {
  document.getElementById('dropdown').classList.remove('show');
  await supabase.auth.signOut();
  fullReset();
  clearForm();
  document.body.classList.remove('authed');
  // Reset login UI directly to avoid circular import with login.js
  const loginErr = document.getElementById('loginErr');
  if (loginErr) loginErr.style.display = 'none';
  const loginIdentifier = document.getElementById('loginIdentifier');
  if (loginIdentifier) loginIdentifier.value = '';
  const otpCode = document.getElementById('otpCode');
  if (otpCode) otpCode.value = '';
  const step1 = document.getElementById('loginStep1');
  const step2 = document.getElementById('loginStep2');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  document.getElementById('ct_company')?.classList.add('on');
  document.getElementById('ct_individual')?.classList.remove('on');
  goScreen(0);
  showToast('You have been logged out');
}

export function updateTopbarProfile(profile) {
  const initials = profile.full_name
    ?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  document.querySelectorAll('.avatar').forEach((el) => (el.textContent = initials));
  const pname = document.querySelector('.pname');
  const prole = document.querySelector('.prole');
  const nm = document.querySelector('.nm');
  if (pname) pname.textContent = profile.full_name || 'User';
  if (prole) prole.textContent = profile.role || 'Credit Analyst';
  if (nm) nm.textContent = profile.full_name || 'User';
}

export function initLayout() {
  document.querySelector('.profile-btn')?.addEventListener('click', toggleDropdown);
  document.addEventListener('click', () => document.getElementById('dropdown').classList.remove('show'));

  document.querySelector('[data-action="open-profile"]')?.addEventListener('click', () => openModal('profileModal'));
  document.querySelector('[data-action="open-settings"]')?.addEventListener('click', () => openModal('settingsModal'));
  document.querySelector('[data-action="help"]')?.addEventListener('click', () => showToast('Help centre opening…'));
  document.querySelector('[data-action="logout"]')?.addEventListener('click', logout);

  document.querySelectorAll('.modal-bg').forEach((bg) => {
    bg.addEventListener('click', (e) => {
      if (e.target === bg) closeModal(bg.id);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.querySelector('[data-action="save-settings"]')?.addEventListener('click', () => {
    closeModal('settingsModal');
    showToast('Settings saved');
  });

  document.querySelector('[data-action="save-profile"]')?.addEventListener('click', () => {
    closeModal('profileModal');
    showToast('Profile updated');
  });

  document.querySelectorAll('.toggle[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => btn.classList.toggle('on'));
  });
}
