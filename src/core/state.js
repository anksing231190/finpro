export const state = {
  userType: 'company',
  uploaded: new Set(),
  activeDocTab: null,
  assessmentDone: false,
  extracted: {},
  user: null,
  currentAssessmentId: null,
};

export let loginType = 'company';

export function setLoginType(type) {
  loginType = type;
}

export function fullReset() {
  state.userType = 'company';
  state.uploaded = new Set();
  state.activeDocTab = null;
  state.assessmentDone = false;
  state.extracted = {};
  state.user = null;
  state.currentAssessmentId = null;
  loginType = 'company';
}
