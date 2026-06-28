import { supabase } from '../../lib/supabase.js';
import { DOCS, SCAN_STEPS } from '../../config/docs.js';
import { state } from '../../core/state.js';
import { goScreen } from '../../core/navigation.js';
import { showToast } from '../../core/toast.js';
import { animateAutofill, clearForm } from '../review/form.js';

let scanning = false;

export async function buildDocs() {
  const docs = DOCS[state.userType];
  const list = document.getElementById('docList');
  list.innerHTML = '';
  state.uploaded.clear();
  state.extracted = {};

  // Create a new assessment row in the database
  if (state.user) {
    const { data, error } = await supabase
      .from('assessments')
      .insert({ user_id: state.user.id, customer_type: state.userType, status: 'draft' })
      .select('id')
      .single();
    if (!error && data) state.currentAssessmentId = data.id;
  }

  docs.forEach((d, i) => {
    const item = document.createElement('div');
    item.className = `doc-item${i === 0 ? ' active' : ''}`;
    item.id = `doc_${d.id}`;
    item.addEventListener('click', () => selectDoc(d.id, i));
    item.innerHTML = `<div class="scan-line"></div><div class="di-ic"><i class="ti ${d.ic}"></i></div><div><div class="di-name">${d.name}</div><div class="di-sub">${d.sub}</div></div><div class="di-status ${d.req ? 'req' : 'pending'}">${d.req ? 'Required' : 'Optional'}</div>`;
    list.appendChild(item);
  });

  state.activeDocTab = docs[0].id;
  updateProgress();
  showDropzone(docs[0]);
}

function selectDoc(id, i) {
  if (scanning) return;
  state.activeDocTab = id;
  document.querySelectorAll('.doc-item').forEach((it) => it.classList.remove('active'));
  document.getElementById(`doc_${id}`).classList.add('active');
  const d = DOCS[state.userType][i];
  if (state.uploaded.has(id)) showExtracted(d);
  else showDropzone(d);
}

function setBar(d, done) {
  document.getElementById('umIc').innerHTML = `<i class="ti ${d.ic}"></i>`;
  document.getElementById('umTitle').textContent = d.name;
  document.getElementById('umSub').textContent = done ? 'Read — review the values below' : d.sub;
  document.getElementById('umStep').textContent = done ? '✓ Extracted' : '';
}

function showDropzone(d) {
  setBar(d, false);
  document.getElementById('dropzone').style.display = 'flex';
  document.getElementById('extractedView').classList.remove('show');
  document.getElementById('dzTitle').textContent = `Upload your ${d.name.toLowerCase()}`;
  document.getElementById('dzDesc').textContent = `${d.sub} — drag & drop or click to browse. The AI reads PDF, Word and image scans automatically.`;
}

function showExtracted(d) {
  setBar(d, true);
  document.getElementById('dropzone').style.display = 'none';
  const view = document.getElementById('extractedView');
  view.classList.add('show');
  document.getElementById('exTitle').textContent = `Extracted from ${d.name}`;
  document.getElementById('exSub').textContent = `${d.fields.length} fields read · all editable`;
  const grid = document.getElementById('exGrid');
  grid.innerHTML = '';
  const saved = state.extracted[d.id] || {};

  d.fields.forEach((f) => {
    const val = saved[f.k] !== undefined ? saved[f.k] : f.v;
    const wrap = document.createElement('div');
    wrap.className = 'ex-field';
    wrap.innerHTML = `<label>${f.k} <span class="tag ai">✦ AI</span></label><input class="inp" value="${val}">`;
    const inp = wrap.querySelector('input');
    inp.addEventListener('input', () => {
      if (!state.extracted[d.id]) state.extracted[d.id] = {};
      state.extracted[d.id][f.k] = inp.value;
    });
    grid.appendChild(wrap);
  });
}

function triggerActiveUpload() {
  const input = document.getElementById('realFileInput');
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    input.value = '';
    const docs = DOCS[state.userType];
    const idx = docs.findIndex((d) => d.id === state.activeDocTab);
    uploadDoc(state.activeDocTab, idx, file);
  };
  input.click();
}

function reupload() {
  const docs = DOCS[state.userType];
  const idx = docs.findIndex((d) => d.id === state.activeDocTab);
  showDropzone(docs[idx]);
}

async function uploadDoc(id, i, file) {
  if (scanning || !state.userType) return;
  const doc = DOCS[state.userType][i];
  scanning = true;

  document.getElementById('dropzone').style.display = 'flex';
  document.getElementById('extractedView').classList.remove('show');
  document.getElementById(`doc_${id}`).classList.add('scanning');

  const overlay = document.getElementById('scanOverlay');
  overlay.classList.add('show');
  document.getElementById('scanTitle').textContent = `Reading ${doc.name.toLowerCase()}…`;

  const foundBox = document.getElementById('foundFields');
  foundBox.innerHTML = '';
  const statusEl = document.getElementById('scanStatus');

  let s = 0;
  const stepTimer = setInterval(() => {
    statusEl.textContent = SCAN_STEPS[s % SCAN_STEPS.length];
    s++;
  }, 380);

  let f = 0;
  const fieldTimer = setInterval(() => {
    if (f < doc.fields.length) {
      const el = document.createElement('div');
      el.className = 'found-field';
      el.innerHTML = `<i class="ti ti-circle-check"></i> ${doc.fields[f].k}: ${doc.fields[f].v}`;
      foundBox.appendChild(el);
      f++;
    }
  }, 400);

  // Start real upload in parallel with the animation
  let uploadPromise = Promise.resolve({ data: null, error: null });
  if (file && state.user && state.currentAssessmentId) {
    const storagePath = `${state.user.id}/${state.currentAssessmentId}/${id}/${file.name}`;
    uploadPromise = supabase.storage
      .from('documents')
      .upload(storagePath, file, { upsert: true })
      .then(async (result) => {
        if (!result.error) {
          await supabase.from('documents').upsert({
            assessment_id: state.currentAssessmentId,
            doc_type: id,
            file_name: file.name,
            storage_path: storagePath,
            extracted_data: Object.fromEntries(doc.fields.map((fi) => [fi.k, fi.v])),
          });
        }
        return result;
      });
  }

  setTimeout(async () => {
    clearInterval(stepTimer);
    clearInterval(fieldTimer);

    const { error: uploadErr } = await uploadPromise;
    overlay.classList.remove('show');

    if (uploadErr) {
      document.getElementById(`doc_${id}`).classList.remove('scanning');
      scanning = false;
      showToast('Upload failed — check your connection and try again.');
      return;
    }

    const item = document.getElementById(`doc_${id}`);
    item.classList.remove('scanning');
    item.classList.add('done');
    const status = item.querySelector('.di-status');
    status.className = 'di-status ok';
    status.innerHTML = '<i class="ti ti-check"></i> Read';

    state.uploaded.add(id);
    if (!state.extracted[id]) {
      state.extracted[id] = {};
      doc.fields.forEach((field) => {
        state.extracted[id][field.k] = field.v;
      });
    }

    showExtracted(doc);
    scanning = false;
    updateProgress();
    showToast(`${doc.fields.length} fields read from ${doc.name}`);
  }, 2600);
}

function updateProgress() {
  const docs = DOCS[state.userType];
  const total = docs.length;
  const done = state.uploaded.size;
  const allDone = done === total;

  document.getElementById('progLabel').textContent = `${done} / ${total}`;
  document.getElementById('progFill').style.width = `${(done / total) * 100}%`;

  const btn = document.getElementById('toReviewBtn');
  btn.style.display = allDone ? '' : 'none';

  document.getElementById('uploadNote').textContent = allDone
    ? 'All documents read. You can continue to review.'
    : `${total - done} document${total - done === 1 ? '' : 's'} remaining — all documents are required to continue.`;
}

export function goToReview() {
  goScreen(2);
  setTimeout(animateAutofill, 350);
}

export async function newAssessment() {
  state.uploaded = new Set();
  state.extracted = {};
  state.assessmentDone = false;
  clearForm();
  await buildDocs();
  goScreen(1);
  showToast('Started a new assessment');
}

export function initUpload() {
  document.getElementById('dropzone')?.addEventListener('click', triggerActiveUpload);
  document.querySelector('[data-action="reupload"]')?.addEventListener('click', reupload);
  document.getElementById('toReviewBtn')?.addEventListener('click', goToReview);
}
