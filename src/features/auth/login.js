import { supabase } from '../../lib/supabase.js';
import { state, loginType, setLoginType } from '../../core/state.js';
import { goScreen } from '../../core/navigation.js';
import { showToast } from '../../core/toast.js';
import { buildDocs } from '../upload/upload.js';
import { updateTopbarProfile } from '../layout/topbar.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function showLoginErr(msg) {
  const box = document.getElementById('loginErr');
  document.getElementById('loginErrMsg').textContent = msg;
  box.style.display = 'flex';
}

function clearLoginErr() {
  document.getElementById('loginErr').style.display = 'none';
}

function setBtnLoading(action, loading) {
  const btn = document.querySelector(`[data-action="${action}"]`);
  if (!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.7' : '';
}

function pickCustomerType(t) {
  setLoginType(t);
  document.getElementById('ct_company').classList.toggle('on', t === 'company');
  document.getElementById('ct_individual').classList.toggle('on', t === 'individual');
}

async function sendOtp() {
  clearLoginErr();
  const val = document.getElementById('loginIdentifier').value.trim();
  const isEmail = EMAIL_RE.test(val);
  const isMobile = MOBILE_RE.test(val);

  if (!isEmail && !isMobile) {
    showLoginErr('Enter a valid email address or 10-digit mobile number (starting 6–9).');
    return;
  }
  if (isMobile) {
    showLoginErr('SMS OTP coming soon — please use your email address for now.');
    return;
  }

  setBtnLoading('send-otp', true);
  const { error } = await supabase.auth.signInWithOtp({ email: val });
  setBtnLoading('send-otp', false);

  if (error) {
    showLoginErr(error.message);
    return;
  }

  document.getElementById('otpSentTo').textContent = val;
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep2').style.display = 'block';
  startResendCountdown();
}

async function verifyOtp() {
  clearLoginErr();
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const token = document.getElementById('otpCode').value.trim();

  if (token.length !== 6 || !/^\d{6}$/.test(token)) {
    showLoginErr('Enter the 6-digit code sent to your email.');
    return;
  }

  setBtnLoading('verify-otp', true);
  const { data, error } = await supabase.auth.verifyOtp({
    email: identifier,
    token,
    type: 'email',
  });
  setBtnLoading('verify-otp', false);

  if (error) {
    showLoginErr('Invalid or expired code. Try again or resend.');
    return;
  }

  await onAuthSuccess(data.user);
}

export async function onAuthSuccess(user) {
  state.user = user;
  state.userType = loginType;
  document.body.classList.add('authed');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profile) updateTopbarProfile(profile);

  await buildDocs();
  goScreen(1);

  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
  showToast(`Welcome back, ${name}`);
}

function goBackToStep1() {
  clearLoginErr();
  document.getElementById('otpCode').value = '';
  document.getElementById('loginStep2').style.display = 'none';
  document.getElementById('loginStep1').style.display = 'block';
}

function startResendCountdown() {
  let secs = 60;
  const timerEl = document.getElementById('resendTimer');
  const btn = document.querySelector('[data-action="resend-otp"]');
  btn.disabled = true;
  timerEl.textContent = `(${secs}s)`;
  const iv = setInterval(() => {
    secs--;
    if (secs <= 0) {
      clearInterval(iv);
      btn.disabled = false;
      timerEl.textContent = '';
    } else {
      timerEl.textContent = `(${secs}s)`;
    }
  }, 1000);
}

export function resetLoginUI() {
  clearLoginErr();
  document.getElementById('loginIdentifier').value = '';
  document.getElementById('otpCode').value = '';
  document.getElementById('loginStep1').style.display = 'block';
  document.getElementById('loginStep2').style.display = 'none';
  pickCustomerType('company');
}

export function initLogin() {
  document.getElementById('ct_company')?.addEventListener('click', () => pickCustomerType('company'));
  document.getElementById('ct_individual')?.addEventListener('click', () => pickCustomerType('individual'));
  document.querySelector('[data-action="send-otp"]')?.addEventListener('click', sendOtp);
  document.querySelector('[data-action="verify-otp"]')?.addEventListener('click', verifyOtp);
  document.querySelector('[data-action="otp-back"]')?.addEventListener('click', goBackToStep1);
  document.querySelector('[data-action="resend-otp"]')?.addEventListener('click', sendOtp);

  document.getElementById('loginIdentifier')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendOtp();
  });
  document.getElementById('otpCode')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyOtp();
  });
}
