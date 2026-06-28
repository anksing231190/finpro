import { BREAKDOWN, RATIOS, TREND, FINAL_SCORE } from '../../config/docs.js';
import { state } from '../../core/state.js';
import { goScreen } from '../../core/navigation.js';
import { showToast } from '../../core/toast.js';
import { newAssessment } from '../upload/upload.js';

export function renderAssessment() {
  const bd = document.getElementById('breakdown');
  bd.innerHTML = '';
  BREAKDOWN.forEach(([k, v, full]) => {
    const d = document.createElement('div');
    d.className = 'bd-row';
    d.innerHTML = `<span class="k">${k}</span><span class="v ${full ? 'full' : 'part'}">${v}</span>`;
    bd.appendChild(d);
  });

  const rt = document.getElementById('ratios');
  rt.innerHTML = '';
  RATIOS.forEach(([n, v, s]) => {
    const r = document.createElement('div');
    r.className = 'ratio';
    r.innerHTML = `<div class="rn">${n}</div><div class="rv">${v}</div><div class="rs ${s}">${s === 'ok' ? 'Normal' : 'Watch'}</div>`;
    rt.appendChild(r);
  });

  const tb = document.getElementById('trendBody');
  tb.innerHTML = '';
  TREND.forEach((row) => {
    const tr = document.createElement('tr');
    const arrow = row[5] === 'up' ? '<span class="up">↑</span>' : '<span class="down">↓</span>';
    tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${arrow}</td>`;
    tb.appendChild(tr);
  });

  const arc = document.getElementById('gaugeArc');
  const circ = 452;
  const off = circ - (FINAL_SCORE / 100) * circ;
  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.3,1)';
    arc.style.strokeDashoffset = off;
  }, 200);

  let n = 0;
  const t = setInterval(() => {
    n += 2;
    if (n >= FINAL_SCORE) {
      n = FINAL_SCORE;
      clearInterval(t);
    }
    document.getElementById('scoreNum').textContent = n;
    document.getElementById('topScoreVal').textContent = `${n}/100`;
  }, 28);

  setTimeout(() => {
    document.getElementById('bandName').textContent = 'B — Low risk';
    const segs = document.querySelectorAll('#bandScale .band-seg');
    ['#F26D6D', '#F59E0B', '#FACC15', '#10B981', '#10B981'].forEach((c, i) => {
      setTimeout(() => {
        if (i < 4) segs[i].style.background = c;
      }, i * 120);
    });
  }, 900);
}

export function goToAssessment() {
  goScreen(3);
  document.getElementById('topScore').classList.add('show');
  if (!state.assessmentDone) {
    state.assessmentDone = true;
    renderAssessment();
  }
}

export function initAssessment() {
  document.querySelector('[data-action="go-assessment"]')?.addEventListener('click', goToAssessment);
  document.querySelector('[data-action="new-assessment"]')?.addEventListener('click', newAssessment);
  document.querySelector('[data-action="export-cam"]')?.addEventListener('click', () =>
    showToast('CAM report exported as PDF'),
  );
}
