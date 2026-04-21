// data.jsx — 게임 상수 & 샘플 데이터 (GAME_DESIGN.md 기반)

const SLIMES = {
  basic:    { emoji: '🟢', color: '#8fd98f', ring: '#5fb55f', name: '기본 슬라임',  price: 100 },
  grass:    { emoji: '💚', color: '#7fd48c', ring: '#4cae5b', name: '풀 슬라임',    price: 250 },
  water:    { emoji: '💧', color: '#7fb8f0', ring: '#3d8bd9', name: '물 슬라임',    price: 250 },
  fire:     { emoji: '🔴', color: '#ff9a73', ring: '#e85a2e', name: '불 슬라임',    price: 300 },
  ice:      { emoji: '🔵', color: '#a8d8f5', ring: '#69b3e3', name: '얼음 슬라임',  price: 300 },
  electric: { emoji: '🟡', color: '#ffe169', ring: '#f5c518', name: '전기 슬라임',  price: 350 },
  dark:     { emoji: '🟣', color: '#b89cf5', ring: '#8866dd', name: '어둠 슬라임',  price: 500 },
  light:    { emoji: '⚪', color: '#ffe8cc', ring: '#f5c88c', name: '빛 슬라임',    price: 500 },
  lava:     { emoji: '🌋', color: '#ff7a4d', ring: '#c93d10', name: '용암 슬라임',  price: 2000 },
  storm:    { emoji: '⛈️', color: '#9a8fd9', ring: '#5b4ec7', name: '폭풍 슬라임',  price: 2000 },
};

const FOODS = [
  { id: 'basic_feed', emoji: '🌾', name: '기본 먹이',    price: 10,  unlockCost: 0,     produces: 'basic',    unlocked: true  },
  { id: 'grass',      emoji: '🌿', name: '풀잎',        price: 25,  unlockCost: 500,   produces: 'grass',    unlocked: true  },
  { id: 'water',      emoji: '💧', name: '정화수',      price: 30,  unlockCost: 1000,  produces: 'water',    unlocked: true  },
  { id: 'fire',       emoji: '🔥', name: '화염초',      price: 60,  unlockCost: 3000,  produces: 'fire',     unlocked: false },
  { id: 'ice',        emoji: '🧊', name: '얼음 결정',   price: 60,  unlockCost: 3000,  produces: 'ice',      unlocked: false },
  { id: 'electric',   emoji: '⚡', name: '번개 열매',   price: 100, unlockCost: 8000,  produces: 'electric', unlocked: false },
  { id: 'dark',       emoji: '🍄', name: '어둠 버섯',   price: 150, unlockCost: 20000, produces: 'dark',     unlocked: false },
  { id: 'light',      emoji: '🌸', name: '빛의 꽃잎',   price: 150, unlockCost: 20000, produces: 'light',    unlocked: false },
];

// 샘플 농장 상태 (프로토타입 목업용)
const SAMPLE_SLIMES = [
  { id: 's1', type: 'basic',    stage: 'adult', x: 0.22, y: 0.30, hunger: 42, happiness: 78, growth: 0.55, eggReady: 0.4 },
  { id: 's2', type: 'fire',     stage: 'adult', x: 0.68, y: 0.20, hunger: 82, happiness: 45, growth: 0.72, eggReady: 0.9 },
  { id: 's3', type: 'water',    stage: 'baby',  x: 0.42, y: 0.52, hunger: 28, happiness: 90, growth: 0.35, eggReady: 0   },
  { id: 's4', type: 'grass',    stage: 'adult', x: 0.80, y: 0.48, hunger: 55, happiness: 65, growth: 0.88, eggReady: 0.6 },
  { id: 's5', type: 'electric', stage: 'elder', x: 0.15, y: 0.62, hunger: 70, happiness: 50, growth: 1.0,  eggReady: 0.1 },
];

const SAMPLE_EGGS = [
  { id: 'e1', type: 'fire',  progress: 0.8, hidden: false, rare: false },
  { id: 'e2', type: 'water', progress: 0.3, hidden: false, rare: false },
  { id: 'e3', type: 'dark',  progress: 0.5, hidden: false, rare: true  },
];

const SAMPLE_FOOD_INVENTORY = {
  basic_feed: 12,
  grass: 5,
  water: 3,
};

const SAMPLE_STATE = {
  gold: 2420,
  slimes: SAMPLE_SLIMES,
  eggs: SAMPLE_EGGS,
  foodInv: SAMPLE_FOOD_INVENTORY,
  farmSlots: 9,
  vipRooms: [
    { id: 'vip_a', name: 'VIP룸 A', capacity: 2, unlocked: true,  slimeIds: ['s2'], recipe: ['fire', 'ice'] },
    { id: 'vip_b', name: 'VIP룸 B', capacity: 3, unlocked: false, slimeIds: [],     recipe: ['electric', 'water'] },
    { id: 'vip_c', name: 'VIP룸 C', capacity: 4, unlocked: false, slimeIds: [],     recipe: ['dark', 'light'] },
  ],
  discovered: { basic: true, grass: true, water: true, fire: true, electric: true, ice: false, dark: false, light: false, lava: false, storm: false },
};

const STAGES = {
  egg:   { label: '알',   scale: 0.6, korean: '알' },
  baby:  { label: '아기', scale: 0.72, korean: '아기' },
  adult: { label: '어른', scale: 1.0, korean: '어른' },
  elder: { label: '노인', scale: 1.0, korean: '노인' },
};

Object.assign(window, { SLIMES, FOODS, SAMPLE_STATE, STAGES });
