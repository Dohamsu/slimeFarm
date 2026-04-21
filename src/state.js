// 게임 상태 저장소 + localStorage persist

import {
  FOODS, INITIAL_GOLD, INITIAL_FOOD, FARM_SLOT_EXPANSION,
} from './constants.js';

const STORAGE_KEY = 'slime-game-state-v1';

const listeners = new Set();

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function defaultState() {
  const now = Date.now();
  return {
    gold: INITIAL_GOLD,
    totalSpent: 0,
    slimes: [],
    eggs: [
      { id: uid(), type: 'basic', isRare: false, isHidden: false, hatchTime: 1000 * 60 * 5, createdAt: now },
    ],
    farmSlotsIndex: 0, // FARM_SLOT_EXPANSION index
    vipRooms: [], // { id, templateId, slimeIds: [] }
    foods: FOODS.map(f => ({ ...f })),
    foodInventory: { [INITIAL_FOOD.id]: INITIAL_FOOD.count },
    compendium: {
      slimes: {}, // type -> { firstDiscoveredAt, count }
      eggs: {},
    },
    speedMultiplier: 30, // 프로토타입 배속
    lastTickAt: now,
    createdAt: now,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // 새 필드 마이그레이션 (기본값 병합)
    return { ...defaultState(), ...parsed };
  } catch (e) {
    console.warn('load failed', e);
    return defaultState();
  }
}

let state = loadState();

export function getState() {
  return state;
}

export function setState(mutator) {
  mutator(state);
  persist();
  emit();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(state);
}

let persistTimer = null;
function persist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('save failed', e);
    }
  }, 200);
}

export function resetState() {
  state = defaultState();
  localStorage.removeItem(STORAGE_KEY);
  emit();
}

// 헬퍼
export function currentFarmSlots() {
  return FARM_SLOT_EXPANSION[state.farmSlotsIndex].slots;
}

export function occupiedFarmSlots() {
  // VIP룸 밖에 있는 슬라임 + 알 수
  const freeSlimes = state.slimes.filter(s => !s.vipRoomId).length;
  return freeSlimes;
}

export function canAddMoreSlimes() {
  return occupiedFarmSlots() < currentFarmSlots();
}

export { uid };
