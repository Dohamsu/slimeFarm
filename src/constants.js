// 게임 상수 — GAME_DESIGN.md 기준
// 밸런싱 시 이 파일만 수정

export const SLIME_VISUALS = {
  basic:    { name: '기본 슬라임', emoji: '🟢', color: '#6fcf6f' },
  grass:    { name: '풀 슬라임',   emoji: '💚', color: '#51cf66' },
  water:    { name: '물 슬라임',   emoji: '💧', color: '#339af0' },
  fire:     { name: '불 슬라임',   emoji: '🔴', color: '#ff6b35' },
  ice:      { name: '얼음 슬라임', emoji: '🔵', color: '#74c0fc' },
  electric: { name: '전기 슬라임', emoji: '🟡', color: '#ffd43b' },
  dark:     { name: '어둠 슬라임', emoji: '🟣', color: '#9775fa' },
  light:    { name: '빛 슬라임',   emoji: '⚪', color: '#ffe8cc' },
  hidden_lava:  { name: '용암 슬라임', emoji: '🌋', color: '#ff4d00' },
  hidden_storm: { name: '폭풍 슬라임', emoji: '⛈️', color: '#5c7cfa' },
};

export const SLIME_BASE_PRICE = {
  basic: 100,
  grass: 250,
  water: 250,
  fire: 300,
  ice: 300,
  electric: 350,
  dark: 500,
  light: 500,
  hidden_lava: 2000,
  hidden_storm: 2000,
};

// 단계별 판매가 계산
export function slimeSellPrice(type, stage) {
  const base = SLIME_BASE_PRICE[type] ?? 100;
  switch (stage) {
    case 'adult': return Math.round(base * 1.0);
    case 'elder': return Math.round(base * 0.6);
    case 'baby':  return Math.round(base * 0.4);
    default:      return Math.round(base * 0.5);
  }
}

export function eggSellPrice(type, isHidden) {
  const base = SLIME_BASE_PRICE[type] ?? 100;
  return isHidden ? base : Math.round(base * 0.5);
}

// 성장 시간 (ms). 프로토타입에서는 speedMultiplier로 조절
export const GROWTH_DURATION = {
  egg_to_baby:   1000 * 60 * 5,   // 5분
  baby_to_adult: 1000 * 60 * 15,  // 15분
  adult_to_elder: 1000 * 60 * 30, // 30분
};

// 히든 알 부화 시간 (2배)
export const HIDDEN_EGG_HATCH = 1000 * 60 * 10;

export const EGG_COOLDOWN = {
  adult: 1000 * 60 * 10, // 10분
  elder: 1000 * 60 * 60, // 1시간
};

export const RARE_EGG_CHANCE = 0.05; // 노인 슬라임 희귀알 5%

export const VIP_HIDDEN_TICK_CHANCE = 0.001; // 0.1% per tick

export const HUNGER_PER_SEC = 0.05;   // 초당 +0.05 (0~1 범위 아닌 %단위 100 기준)
export const FEED_HUNGER_RECOVERY = 40; // 먹이 1번에 -40
export const FEED_GROWTH_BOOST = 0.05; // +5% 진행도

export const FOODS = [
  { id: 'basic_feed', name: '기본 먹이', emoji: '🌾', price: 10,  unlockCost: 0,     isUnlocked: true,  producesType: 'basic' },
  { id: 'grass_leaf', name: '풀잎',     emoji: '🌿', price: 25,  unlockCost: 500,   isUnlocked: false, producesType: 'grass' },
  { id: 'pure_water', name: '정화수',   emoji: '💧', price: 30,  unlockCost: 1000,  isUnlocked: false, producesType: 'water' },
  { id: 'fire_herb',  name: '화염초',   emoji: '🔥', price: 60,  unlockCost: 3000,  isUnlocked: false, producesType: 'fire' },
  { id: 'ice_crystal',name: '얼음 결정', emoji: '🧊', price: 60,  unlockCost: 3000,  isUnlocked: false, producesType: 'ice' },
  { id: 'thunder_fruit',name:'번개 열매', emoji: '⚡', price: 100, unlockCost: 8000,  isUnlocked: false, producesType: 'electric' },
  { id: 'dark_mushroom',name:'어둠 버섯', emoji: '🍄', price: 150, unlockCost: 20000, isUnlocked: false, producesType: 'dark' },
  { id: 'light_petal',name: '빛의 꽃잎', emoji: '🌸', price: 150, unlockCost: 20000, isUnlocked: false, producesType: 'light' },
];

export const FARM_SLOT_EXPANSION = [
  { slots: 4,  cost: 0 },
  { slots: 6,  cost: 500 },
  { slots: 9,  cost: 2000 },
  { slots: 12, cost: 5000 },
  { slots: 16, cost: 15000 },
];

export const VIP_ROOM_TEMPLATES = [
  { id: 'vip_a', name: 'VIP룸 A', capacity: 2, cost: 3000 },
  { id: 'vip_b', name: 'VIP룸 B', capacity: 3, cost: 8000 },
  { id: 'vip_c', name: 'VIP룸 C', capacity: 4, cost: 20000 },
];

export const VIP_HIDDEN_RECIPES = [
  { types: ['fire', 'ice'],       result: 'hidden_lava',  hint: '🔥 + 🧊 = ???', visibleHint: true },
  { types: ['electric', 'water'], result: 'hidden_storm', hint: '⚡ + 💧 = ???', visibleHint: true },
  { types: ['dark', 'light'],     result: 'hidden_secret',hint: '??? + ??? = ???', visibleHint: false },
];

export const INITIAL_GOLD = 200;
export const INITIAL_FOOD = { id: 'basic_feed', count: 5 };
