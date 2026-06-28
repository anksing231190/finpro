import './styles/index.css';
import { supabase, ENV } from './lib/supabase.js';
import { initTheme } from './core/theme.js';
import { initNavigation } from './core/navigation.js';
import { initLogin, onAuthSuccess } from './features/auth/login.js';
import { initLayout } from './features/layout/topbar.js';
import { initUpload } from './features/upload/upload.js';
import { initReview, buildBankTable } from './features/review/form.js';
import { initAssessment } from './features/assessment/assessment.js';
import { initCheckboxes } from './utils/ui.js';

initTheme();
initNavigation();
initLogin();
initLayout();
initUpload();
initReview();
initAssessment();
initCheckboxes();
buildBankTable();

if (ENV === 'staging') {
  const badge = document.getElementById('envBadge');
  if (badge) {
    badge.textContent = 'STAGING';
    badge.style.display = 'flex';
  }
}

(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await onAuthSuccess(session.user);
  }
})();
