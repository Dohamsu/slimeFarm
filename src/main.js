// 진입점: 이벤트 바인딩 + 메인 루프

import { getState, setState, subscribe, resetState } from './state.js';
import { tick, setSpeed } from './game.js';
import { renderAll, openFoodModal, closeFoodModal, closeSlimeModal } from './ui/render.js';

// 탭 네비게이션
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(screenId)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === screenId));
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
});

// 상점/인벤토리 탭 전환
function bindInnerTabs(selector, attr, paneAttr) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.screen');
      parent.querySelectorAll(`[${attr}]`).forEach(b => b.classList.toggle('active', b === btn));
      parent.querySelectorAll(`[${paneAttr}]`).forEach(p => {
        p.classList.toggle('active', p.getAttribute(paneAttr) === btn.getAttribute(attr));
      });
    });
  });
}
bindInnerTabs('[data-shop-tab]', 'data-shop-tab', 'data-shop-pane');
bindInnerTabs('[data-inv-tab]', 'data-inv-tab', 'data-inv-pane');

// 먹이 가방 버튼
document.getElementById('btn-food-bag').addEventListener('click', openFoodModal);

// 모달 백드롭 닫기
document.querySelectorAll('.modal [data-close]').forEach(el => {
  el.addEventListener('click', () => {
    el.closest('.modal').classList.add('hidden');
  });
});

// 디버그: 배속
const speedSelect = document.getElementById('speed-select');
speedSelect.value = String(getState().speedMultiplier || 30);
speedSelect.addEventListener('change', () => setSpeed(speedSelect.value));

// 디버그: 초기화
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('정말로 모든 게임 진행을 초기화할까요?')) {
    resetState();
  }
});

// 상태 변화 → 렌더
subscribe(() => renderAll());
renderAll();

// 메인 틱 루프 (1초마다)
let lastNow = performance.now();
setInterval(() => {
  const now = performance.now();
  const dt = now - lastNow;
  lastNow = now;
  tick(dt);
}, 1000);
