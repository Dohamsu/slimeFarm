// 전체 UI 렌더링

import { getState, currentFarmSlots } from '../state.js';
import {
  SLIME_VISUALS, slimeSellPrice, eggSellPrice,
  FOODS, FARM_SLOT_EXPANSION, VIP_ROOM_TEMPLATES,
  VIP_HIDDEN_RECIPES, GROWTH_DURATION,
} from '../constants.js';
import {
  feedSlime, sellSlime, sellEgg,
  buyFood, unlockFood, expandFarm,
  unlockVIPRoom, addSlimeToVIP, removeSlimeFromVIP,
} from '../game.js';

function q(sel) { return document.querySelector(sel); }
function qa(sel) { return [...document.querySelectorAll(sel)]; }
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue; // null/undefined 속성은 무시
    if (k === 'class') e.className = v;
    else if (k === 'onclick') e.addEventListener('click', v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  }
  return e;
}

const STAGE_LABEL = { egg: '알', baby: '아기', adult: '어른', elder: '노인' };
const STAGE_SCALE = { egg: 0.6, baby: 0.8, adult: 1.0, elder: 1.0 };

// 모달 상태
let selectedSlimeId = null;

export function renderAll() {
  renderTopBar();
  renderFarm();
  renderEggStrip();
  renderTutorial();
  renderShop();
  renderInventory();
  renderCompendium();
  // 모달이 열려 있으면 내용 재렌더
  if (!q('#slime-modal').classList.contains('hidden') && selectedSlimeId) {
    openSlimeModal(selectedSlimeId);
  }
  if (!q('#food-modal').classList.contains('hidden')) {
    renderFoodModal();
  }
}

// ===== TopBar =====
function renderTopBar() {
  const s = getState();
  q('[data-v="gold"]').textContent = s.gold;
  q('[data-v="slimeCount"]').textContent = s.slimes.length;
  q('[data-v="eggCount"]').textContent = s.eggs.length;
  const total = Object.values(s.foodInventory).reduce((a, b) => a + b, 0);
  q('[data-v="foodTotal"]').textContent = total;
}

// ===== Farm =====
function renderFarm() {
  const s = getState();
  const area = q('#slime-area');
  area.innerHTML = '';

  const freeSlimes = s.slimes.filter(sl => !sl.vipRoomId);
  for (const slime of freeSlimes) {
    area.appendChild(renderSlime(slime));
  }

  // VIP Rooms
  const vipWrap = q('#vip-rooms');
  vipWrap.innerHTML = '';
  for (const room of s.vipRooms) {
    const tpl = VIP_ROOM_TEMPLATES.find(t => t.id === room.templateId);
    const slimesInRoom = s.slimes.filter(sl => sl.vipRoomId === room.id);
    const roomEl = el('div', { class: 'vip-room', dataset: { roomId: room.id } },
      el('div', { class: 'vip-room-label' }, `🏰 ${tpl.name} (${slimesInRoom.length}/${tpl.capacity})`),
      el('div', { class: 'vip-room-slots' },
        ...slimesInRoom.map(sl => renderSlime(sl, true)),
      ),
    );
    vipWrap.appendChild(roomEl);
  }

  // 슬롯 표시
  const slots = currentFarmSlots();
  const usage = freeSlimes.length;
  const label = el('div', { class: 'slot-indicator' }, `🏠 ${usage}/${slots}`);
  area.appendChild(label);
}

function renderSlime(slime, inVip = false) {
  const v = SLIME_VISUALS[slime.type] ?? { emoji: '❓', name: slime.type, color: '#888' };
  const stageEmoji = slime.stage === 'egg' ? '🥚' : slime.stage === 'elder' ? `${v.emoji}👴` : v.emoji;
  const scale = STAGE_SCALE[slime.stage];
  const hungry = slime.hunger >= 70 ? '😫' : '';
  const posStyle = inVip
    ? ''
    : `left:${Math.round(slime.x * 90)}%; top:${Math.round(slime.y * 80)}%;`;
  const e = el('button', {
    class: `slime stage-${slime.stage}`,
    dataset: { id: slime.id },
    style: `${posStyle} transform: scale(${scale});`,
    onclick: () => openSlimeModal(slime.id),
  },
    el('span', { class: 'slime-hungry' }, hungry),
    el('span', { class: 'slime-emoji' }, stageEmoji),
    renderGrowthBar(slime),
  );
  return e;
}

function renderGrowthBar(slime) {
  if (slime.stage === 'elder') return null;
  const pct = Math.round((slime.growthProgress || 0) * 100);
  return el('span', { class: 'growth-bar' },
    el('span', { class: 'growth-bar-fill', style: `width:${pct}%` }),
  );
}

// ===== Egg strip =====
function renderEggStrip() {
  const s = getState();
  const list = q('#egg-list');
  list.innerHTML = '';
  if (s.eggs.length === 0) {
    list.appendChild(el('div', { class: 'muted' }, '알 없음'));
    return;
  }
  for (const egg of s.eggs) {
    const visual = SLIME_VISUALS[egg.type] ?? {};
    const remain = Math.max(0, Math.ceil((egg.hatchTime - (egg._virtualAge ?? 0)) / 1000));
    const mark = egg.isHidden ? '🌟' : (egg.isRare ? '✨' : '');
    const e = el('button', {
      class: 'egg-item',
      onclick: () => confirmSellEgg(egg.id),
      title: `${visual.name ?? egg.type} 알 (남은: ${remain}s)`,
    },
      el('span', { class: 'egg-emoji' }, '🥚'),
      el('span', { class: 'egg-type' }, visual.emoji ?? '?'),
      el('span', { class: 'egg-mark' }, mark),
      el('span', { class: 'egg-time' }, `${formatTime(remain)} · ${eggSellPrice(egg.type, egg.isHidden)}G`),
    );
    list.appendChild(e);
  }
}

function confirmSellEgg(eggId) {
  const s = getState();
  const egg = s.eggs.find(e => e.id === eggId);
  if (!egg) return;
  const price = eggSellPrice(egg.type, egg.isHidden);
  if (confirm(`이 알을 ${price}G에 팔까요?`)) sellEgg(eggId);
}

function formatTime(sec) {
  if (sec <= 0) return '곧';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function renderTutorial() {
  const s = getState();
  const banner = q('#tutorial-banner');
  if (s.slimes.length === 0 && s.eggs.length === 0) {
    banner.classList.remove('hidden');
    banner.innerHTML = '슬라임도 알도 없습니다. 상점에서 알을 구하거나 초기화해보세요.';
  } else if (s.slimes.length === 0) {
    banner.classList.remove('hidden');
    banner.innerHTML = '🐣 알을 기다려보세요! 5분 뒤 아기 슬라임으로 부화합니다.<br><small>(아래 배속을 올리면 빠르게 테스트할 수 있어요)</small>';
  } else {
    banner.classList.add('hidden');
  }
}

// ===== 슬라임 상세 모달 =====
export function openSlimeModal(slimeId) {
  selectedSlimeId = slimeId;
  const s = getState();
  const slime = s.slimes.find(sl => sl.id === slimeId);
  if (!slime) return;
  const v = SLIME_VISUALS[slime.type] ?? {};
  const unlockedFoods = s.foods.filter(f => f.isUnlocked);
  const foodButtons = unlockedFoods.map(f => {
    const count = s.foodInventory[f.id] ?? 0;
    return el('button', {
      class: 'food-btn' + (count <= 0 ? ' disabled' : ''),
      onclick: () => { feedSlime(slime.id, f.id); },
      disabled: count <= 0 ? '' : null,
    }, `${f.emoji} ${f.name} (${count})`);
  });

  const vipButtons = [];
  if (slime.vipRoomId) {
    vipButtons.push(el('button', {
      class: 'btn',
      onclick: () => { removeSlimeFromVIP(slime.id); },
    }, 'VIP룸에서 빼기'));
  } else {
    for (const room of s.vipRooms) {
      const tpl = VIP_ROOM_TEMPLATES.find(t => t.id === room.templateId);
      const cur = s.slimes.filter(sl => sl.vipRoomId === room.id).length;
      vipButtons.push(el('button', {
        class: 'btn',
        onclick: () => { addSlimeToVIP(slime.id, room.id); },
        disabled: cur >= tpl.capacity ? '' : null,
      }, `→ ${tpl.name} (${cur}/${tpl.capacity})`));
    }
  }

  const body = q('#slime-modal-body');
  body.innerHTML = '';
  body.appendChild(
    el('div', { class: 'modal-content' },
      el('div', { class: 'modal-header' },
        el('span', { class: 'modal-emoji' }, v.emoji ?? '❓'),
        el('div', { class: 'modal-titles' },
          el('h3', {}, `${v.name ?? slime.type}`),
          el('p', { class: 'muted' }, `${STAGE_LABEL[slime.stage]} · ID: ${slime.id.slice(-4)}`),
        ),
      ),
      el('div', { class: 'bars' },
        barRow('배고픔', slime.hunger, 100, '#f06'),
        barRow('행복도', slime.happiness, 100, '#9cf'),
        slime.stage !== 'elder' ? barRow('성장', (slime.growthProgress || 0) * 100, 100, '#9f9') : null,
      ),
      el('div', { class: 'section' },
        el('h4', {}, '먹이 주기'),
        el('div', { class: 'food-row' }, ...(foodButtons.length ? foodButtons : [el('span', { class: 'muted' }, '해금된 먹이가 없습니다. 상점에서 구매하세요.')])),
        slime.lastFedFoodType
          ? el('p', { class: 'muted' }, `마지막 먹은 먹이: ${SLIME_VISUALS[slime.lastFedFoodType]?.emoji ?? ''} ${SLIME_VISUALS[slime.lastFedFoodType]?.name ?? slime.lastFedFoodType}`)
          : el('p', { class: 'muted' }, '아직 먹이를 주지 않았습니다. 어른이어도 알을 낳지 않습니다.'),
      ),
      s.vipRooms.length > 0 ? el('div', { class: 'section' },
        el('h4', {}, 'VIP룸'),
        el('div', { class: 'btn-row' }, ...vipButtons),
      ) : null,
      el('div', { class: 'section btn-row' },
        el('button', {
          class: 'btn sell',
          onclick: () => {
            if (confirm(`${v.name}을(를) ${slimeSellPrice(slime.type, slime.stage)}G에 팔까요?`)) {
              sellSlime(slime.id);
              closeSlimeModal();
            }
          },
        }, `💰 판매 (${slimeSellPrice(slime.type, slime.stage)}G)`),
        el('button', { class: 'btn', onclick: closeSlimeModal }, '닫기'),
      ),
    )
  );
  q('#slime-modal').classList.remove('hidden');
}

function closeSlimeModal() {
  selectedSlimeId = null;
  q('#slime-modal').classList.add('hidden');
}

function barRow(label, val, max, color) {
  const pct = Math.max(0, Math.min(100, Math.round((val / max) * 100)));
  return el('div', { class: 'bar-row' },
    el('span', { class: 'bar-label' }, label),
    el('span', { class: 'bar' },
      el('span', { class: 'bar-fill', style: `width:${pct}%; background:${color}` }),
    ),
    el('span', { class: 'bar-val' }, `${Math.round(val)}`),
  );
}

// ===== 먹이 가방 모달 =====
export function openFoodModal() {
  renderFoodModal();
  q('#food-modal').classList.remove('hidden');
}

function closeFoodModal() {
  q('#food-modal').classList.add('hidden');
}

function renderFoodModal() {
  const s = getState();
  const body = q('#food-modal-body');
  body.innerHTML = '';
  const items = s.foods.filter(f => f.isUnlocked).map(f => {
    const count = s.foodInventory[f.id] ?? 0;
    return el('div', { class: 'food-bag-item' },
      el('span', { class: 'food-emoji' }, f.emoji),
      el('span', { class: 'food-name' }, f.name),
      el('span', { class: 'food-count' }, `보유 ${count}`),
    );
  });
  body.appendChild(el('div', { class: 'modal-content' },
    el('h3', {}, '🎒 먹이 가방'),
    el('p', { class: 'muted' }, '슬라임을 탭해서 먹이를 줄 수 있습니다.'),
    el('div', { class: 'food-bag-list' }, ...(items.length ? items : [el('p', { class: 'muted' }, '먹이가 없습니다. 상점에서 구매하세요.')])),
    el('button', { class: 'btn', onclick: closeFoodModal }, '닫기'),
  ));
}

// ===== Shop =====
function renderShop() {
  renderShopBuy();
  renderShopUnlock();
  renderShopExpand();
  renderShopVIP();
}

function renderShopBuy() {
  const s = getState();
  const pane = q('[data-shop-pane="buy"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, '먹이 구매'));
  const list = el('div', { class: 'list' });
  for (const f of s.foods.filter(f => f.isUnlocked)) {
    const row = el('div', { class: 'shop-item' },
      el('span', { class: 'shop-icon' }, f.emoji),
      el('span', { class: 'shop-name' }, `${f.name} (${f.price}G)`),
      el('span', { class: 'shop-count' }, `보유 ${s.foodInventory[f.id] ?? 0}`),
      el('div', { class: 'btn-row' },
        buyBtn(f, 1),
        buyBtn(f, 10),
        buyBtn(f, 100),
      ),
    );
    list.appendChild(row);
  }
  pane.appendChild(list);
}

function buyBtn(f, amount) {
  const total = f.price * amount;
  return el('button', {
    class: 'btn',
    onclick: () => buyFood(f.id, amount),
    disabled: getState().gold < total ? '' : null,
  }, `x${amount} (${total}G)`);
}

function renderShopUnlock() {
  const s = getState();
  const pane = q('[data-shop-pane="unlock"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, '먹이 해금'));
  const locked = s.foods.filter(f => !f.isUnlocked);
  if (locked.length === 0) {
    pane.appendChild(el('p', { class: 'muted' }, '모든 먹이가 해금되었습니다.'));
    return;
  }
  const list = el('div', { class: 'list' });
  for (const f of locked) {
    list.appendChild(el('div', { class: 'shop-item' },
      el('span', { class: 'shop-icon' }, f.emoji),
      el('span', { class: 'shop-name' }, `${f.name}`),
      el('span', { class: 'shop-desc muted' }, `해금 후 개당 ${f.price}G로 구매 가능`),
      el('button', {
        class: 'btn primary',
        onclick: () => unlockFood(f.id),
        disabled: s.gold < f.unlockCost ? '' : null,
      }, `해금 (${f.unlockCost}G)`),
    ));
  }
  pane.appendChild(list);
}

function renderShopExpand() {
  const s = getState();
  const pane = q('[data-shop-pane="expand"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, '농장 확장'));
  const cur = FARM_SLOT_EXPANSION[s.farmSlotsIndex];
  const next = FARM_SLOT_EXPANSION[s.farmSlotsIndex + 1];
  pane.appendChild(el('p', {}, `현재: ${cur.slots}칸`));
  if (!next) {
    pane.appendChild(el('p', { class: 'muted' }, '최대 확장 완료!'));
    return;
  }
  pane.appendChild(el('button', {
    class: 'btn primary',
    onclick: () => expandFarm(),
    disabled: s.gold < next.cost ? '' : null,
  }, `다음 단계 ${next.slots}칸 (${next.cost}G)`));
}

function renderShopVIP() {
  const s = getState();
  const pane = q('[data-shop-pane="vip"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, 'VIP룸'));
  pane.appendChild(el('p', { class: 'muted' }, '히든 조합 슬라임을 두면 희귀한 히든 알을 얻을 수 있습니다.'));
  for (const tpl of VIP_ROOM_TEMPLATES) {
    const owned = s.vipRooms.some(r => r.templateId === tpl.id);
    pane.appendChild(el('div', { class: 'shop-item' },
      el('span', { class: 'shop-icon' }, '🏰'),
      el('span', { class: 'shop-name' }, `${tpl.name} (수용 ${tpl.capacity})`),
      owned
        ? el('span', { class: 'muted' }, '해금됨')
        : el('button', {
            class: 'btn primary',
            onclick: () => unlockVIPRoom(tpl.id),
            disabled: s.gold < tpl.cost ? '' : null,
          }, `해금 (${tpl.cost}G)`),
    ));
  }
  pane.appendChild(el('h4', {}, '힌트북'));
  for (const r of VIP_HIDDEN_RECIPES) {
    pane.appendChild(el('p', { class: 'muted' }, r.visibleHint ? r.hint : '??? (숨겨진 조합)'));
  }
}

// ===== Inventory =====
function renderInventory() {
  renderInvSlimes();
  renderInvEggs();
}

function renderInvSlimes() {
  const s = getState();
  const pane = q('[data-inv-pane="slimes"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, `슬라임 (${s.slimes.length})`));
  if (s.slimes.length === 0) {
    pane.appendChild(el('p', { class: 'muted' }, '보유 슬라임이 없습니다.'));
    return;
  }
  const list = el('div', { class: 'list' });
  for (const slime of s.slimes) {
    const v = SLIME_VISUALS[slime.type] ?? {};
    const price = slimeSellPrice(slime.type, slime.stage);
    list.appendChild(el('div', { class: 'inv-row' },
      el('span', { class: 'inv-icon' }, v.emoji ?? '❓'),
      el('span', { class: 'inv-name' }, `${v.name ?? slime.type}`),
      el('span', { class: 'inv-stage' }, STAGE_LABEL[slime.stage]),
      el('span', { class: 'muted' }, `배고픔 ${Math.round(slime.hunger)}`),
      el('button', {
        class: 'btn sell',
        onclick: () => {
          if (confirm(`${v.name}을(를) ${price}G에 팔까요?`)) sellSlime(slime.id);
        },
      }, `판매 ${price}G`),
      el('button', { class: 'btn', onclick: () => openSlimeModal(slime.id) }, '상세'),
    ));
  }
  pane.appendChild(list);
}

function renderInvEggs() {
  const s = getState();
  const pane = q('[data-inv-pane="eggs"]');
  pane.innerHTML = '';
  pane.appendChild(el('h3', {}, `알 (${s.eggs.length})`));
  if (s.eggs.length === 0) {
    pane.appendChild(el('p', { class: 'muted' }, '보유 알이 없습니다.'));
    return;
  }
  const list = el('div', { class: 'list' });
  for (const egg of s.eggs) {
    const v = SLIME_VISUALS[egg.type] ?? {};
    const remain = Math.max(0, Math.ceil((egg.hatchTime - (egg._virtualAge ?? 0)) / 1000));
    const price = eggSellPrice(egg.type, egg.isHidden);
    const mark = egg.isHidden ? ' 🌟' : (egg.isRare ? ' ✨' : '');
    list.appendChild(el('div', { class: 'inv-row' },
      el('span', { class: 'inv-icon' }, '🥚'),
      el('span', { class: 'inv-name' }, `${v.name ?? egg.type} 알${mark}`),
      el('span', { class: 'muted' }, `부화 ${formatTime(remain)}`),
      el('button', {
        class: 'btn sell',
        onclick: () => {
          if (confirm(`이 알을 ${price}G에 팔까요?`)) sellEgg(egg.id);
        },
      }, `판매 ${price}G`),
    ));
  }
  pane.appendChild(list);
}

// ===== Compendium =====
function renderCompendium() {
  const s = getState();
  const slimeBox = q('#compendium-slimes');
  const eggBox = q('#compendium-eggs');
  slimeBox.innerHTML = '';
  eggBox.innerHTML = '';

  const allTypes = Object.keys(SLIME_VISUALS);
  let discovered = 0;
  for (const type of allTypes) {
    const entry = s.compendium.slimes[type];
    const v = SLIME_VISUALS[type];
    if (entry) discovered++;
    slimeBox.appendChild(el('div', { class: 'comp-item' + (entry ? '' : ' locked') },
      el('div', { class: 'comp-emoji' }, entry ? v.emoji : '❓'),
      el('div', { class: 'comp-name' }, entry ? v.name : '???'),
      el('div', { class: 'muted' }, entry ? `보유: ${s.slimes.filter(sl => sl.type === type).length} / 발견 ${entry.count}` : '미발견'),
    ));
  }
  q('#compendium-progress').textContent = ` ${discovered}/${allTypes.length}`;

  for (const type of allTypes) {
    const entry = s.compendium.eggs[type];
    const v = SLIME_VISUALS[type];
    eggBox.appendChild(el('div', { class: 'comp-item' + (entry ? '' : ' locked') },
      el('div', { class: 'comp-emoji' }, entry ? '🥚' : '❓'),
      el('div', { class: 'comp-name' }, entry ? `${v.name} 알` : '???'),
      el('div', { class: 'muted' }, entry ? `발견 ${entry.count}회` : '미발견'),
    ));
  }
}

// ===== 외부 노출 =====
export { closeSlimeModal, closeFoodModal };
