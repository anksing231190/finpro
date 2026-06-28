import { state } from '../../core/state.js';
import { showToast } from '../../core/toast.js';

let autofilled = false;

export function switchFormTab(i, btn) {
  document.querySelectorAll('.ft-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach((p, j) => p.classList.toggle('active', i === j));
}

export function buildBankTable() {
  const months = ['Oct-25', 'Sep-25', 'Aug-25', 'Jul-25', 'Jun-25', 'May-25'];
  const body = document.getElementById('bankBody');
  body.innerHTML = '';

  months.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="m">${m}</td><td><input class="tinp ai" value="SBI / 4521xx" style="text-align:left"></td><td><input class="tinp ai" value="${(12 + i * 0.4).toFixed(2)}"></td><td><input class="tinp" placeholder="0"></td><td><input class="tinp" placeholder="—" style="text-align:left"></td><td><input class="tinp" placeholder="0"></td><td><input class="tinp ai" value="${i === 2 ? 1 : i === 4 ? 2 : 0}"></td><td><input class="tinp" placeholder="0"></td><td><input class="tinp ai" value="25.00"></td><td><input class="tinp ai" value="${(1.2 + i * 0.1).toFixed(2)}"></td>`;
    body.appendChild(tr);
  });

  const tot = document.createElement('tr');
  tot.className = 'total';
  tot.innerHTML =
    '<td>TOTAL</td><td>—</td><td>74.40</td><td colspan="7" style="text-align:left;font-family:var(--sans);font-weight:400;color:var(--txt2);font-size:10.5px">Excludes FD maturities, loan disbursements and sweep transactions</td>';
  body.appendChild(tot);
}

function animateCount(el, target, dec) {
  let cur = 0;
  const steps = 22;
  const inc = target / steps;
  let n = 0;
  const t = setInterval(() => {
    cur += inc;
    n++;
    if (n >= steps) {
      cur = target;
      clearInterval(t);
    }
    el.value = cur.toFixed(dec);
  }, 24);
}

export function animateAutofill() {
  if (autofilled) return;
  autofilled = true;

  const list = Array.from(document.querySelectorAll('input.ai[data-auto]'));
  list.forEach((el, i) => {
    setTimeout(() => {
      const target = el.dataset.auto;
      el.classList.add('ai-filled', 'ai-pop');
      if (/^[0-9.]+$/.test(target)) {
        animateCount(el, parseFloat(target), target.includes('.') ? 2 : 0);
      } else {
        el.value = target;
      }
      setTimeout(() => el.classList.remove('ai-pop'), 600);
    }, i * 55);
  });

  showToast(`AI populated ${list.length} fields from your documents`);
}

export function clearForm() {
  autofilled = false;
  document.querySelectorAll('input.ai[data-auto]').forEach((el) => {
    el.value = '';
    el.classList.remove('ai-filled');
  });
  document.getElementById('topScore')?.classList.remove('show');
}

export function initReview() {
  document.querySelectorAll('.ft-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchFormTab(Number(btn.dataset.tab), btn));
  });
}
