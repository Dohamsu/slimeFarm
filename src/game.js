// 게임 로직: tick + 액션

import {
  SLIME_VISUALS, slimeSellPrice, eggSellPrice,
  GROWTH_DURATION, HIDDEN_EGG_HATCH,
  EGG_COOLDOWN, RARE_EGG_CHANCE,
  VIP_HIDDEN_TICK_CHANCE, VIP_HIDDEN_RECIPES,
  HUNGER_PER_SEC, FEED_HUNGER_RECOVERY, FEED_GROWTH_BOOST,
  FOODS, FARM_SLOT_EXPANSION, VIP_ROOM_TEMPLATES,
} from './constants.js';
import {
  getState, setState, uid,
  currentFarmSlots, canAddMoreSlimes,
} from './state.js';
import { toast } from './ui/toast.js';

const RARE_TYPES = ['dark', 'light'];

// 새 슬라임 생성
function spawnSlime(type, stage = 'baby') {
  const name = SLIME_VISUALS[type]?.name ?? type;
  return {
    id: uid(),
    type,
    stage,
    name,
    x: Math.random(),   // 0~1 정규화 좌표 (렌더 시 농장 크기에 곱)
    y: Math.random(),
    growthProgress: 0,
    age: 0,
    hunger: 0,
    happiness: 50,
    lastEggTime: Date.now(),
    vipRoomId: null,
    lastFedFoodType: null,
    createdAt: Date.now(),
  };
}

function nextStage(stage) {
  switch (stage) {
    case 'egg': return 'baby';
    case 'baby': return 'adult';
    case 'adult': return 'elder';
    case 'elder': return 'elder';
    default: return stage;
  }
}

function stageDuration(stage) {
  if (stage === 'baby') return GROWTH_DURATION.baby_to_adult;
  if (stage === 'adult') return GROWTH_DURATION.adult_to_elder;
  return Infinity;
}

export function discoverSlime(s, type) {
  const entry = s.compendium.slimes[type] ?? { firstDiscoveredAt: Date.now(), count: 0 };
  entry.count += 1;
  s.compendium.slimes[type] = entry;
}

export function discoverEgg(s, type) {
  const entry = s.compendium.eggs[type] ?? { firstDiscoveredAt: Date.now(), count: 0 };
  entry.count += 1;
  s.compendium.eggs[type] = entry;
}

// ===== tick =====
export function tick(realDtMs) {
  setState(s => {
    const speed = s.speedMultiplier || 1;
    const dtMs = realDtMs * speed;
    const dtSec = dtMs / 1000;
    const now = Date.now();

    // 1) 알 부화
    const stillEggs = [];
    for (const egg of s.eggs) {
      const elapsed = (now - egg.createdAt) * speed; // 가상 경과
      // 간단히: 생성 이후 누적 가상경과를 egg에 기록
      egg._virtualAge = (egg._virtualAge ?? 0) + dtMs;
      if (egg._virtualAge >= egg.hatchTime) {
        // 농장 슬롯 여유가 있으면 부화
        const freeSlimes = s.slimes.filter(sl => !sl.vipRoomId).length;
        if (freeSlimes < FARM_SLOT_EXPANSION[s.farmSlotsIndex].slots) {
          const baby = spawnSlime(egg.type, 'baby');
          s.slimes.push(baby);
          discoverSlime(s, egg.type);
          toast(`🐣 ${SLIME_VISUALS[egg.type]?.name ?? egg.type} 부화!`);
          continue; // 알 제거
        }
      }
      stillEggs.push(egg);
    }
    s.eggs = stillEggs;

    // 2) 슬라임 성장 + 배고픔 + 알 생산
    for (const slime of s.slimes) {
      // 배고픔 증가 (0~100)
      slime.hunger = Math.min(100, slime.hunger + HUNGER_PER_SEC * dtSec);
      // 나이
      slime.age += dtMs;

      // 성장
      if (slime.stage !== 'elder') {
        const dur = stageDuration(slime.stage);
        if (Number.isFinite(dur)) {
          slime.growthProgress += dtMs / dur;
          if (slime.growthProgress >= 1) {
            slime.stage = nextStage(slime.stage);
            slime.growthProgress = 0;
            discoverSlime(s, slime.type);
            if (slime.stage === 'adult') toast(`🟢 ${slime.name}이(가) 어른이 되었어요!`);
            if (slime.stage === 'elder') toast(`👴 ${slime.name}이(가) 노인이 되었어요.`);
          }
        }
      }

      // 알 생산 체크
      const virtualSinceEgg = (now - slime.lastEggTime) * 0; // fallback 안 씀
      slime._virtualEggTimer = (slime._virtualEggTimer ?? 0) + dtMs;
      if (slime.stage === 'adult') {
        if (slime._virtualEggTimer >= EGG_COOLDOWN.adult && slime.lastFedFoodType) {
          produceAdultEgg(s, slime);
          slime._virtualEggTimer = 0;
        }
      } else if (slime.stage === 'elder') {
        if (slime._virtualEggTimer >= EGG_COOLDOWN.elder) {
          if (Math.random() < RARE_EGG_CHANCE) {
            const rareType = RARE_TYPES[Math.floor(Math.random() * RARE_TYPES.length)];
            s.eggs.push({
              id: uid(), type: rareType,
              isRare: true, isHidden: false,
              hatchTime: GROWTH_DURATION.egg_to_baby,
              createdAt: Date.now(), _virtualAge: 0,
            });
            discoverEgg(s, rareType);
            toast(`✨ 희귀알 발견! (${SLIME_VISUALS[rareType]?.name})`);
          }
          slime._virtualEggTimer = 0;
        }
      }
    }

    // 3) VIP룸 히든알 판정
    for (const room of s.vipRooms) {
      const slimes = s.slimes.filter(sl => sl.vipRoomId === room.id);
      if (slimes.length < 2) continue;
      const types = new Set(slimes.map(sl => sl.type));
      for (const recipe of VIP_HIDDEN_RECIPES) {
        if (recipe.types.every(t => types.has(t))) {
          // 틱당 확률 — dt를 고려해 약간 가중
          const chance = VIP_HIDDEN_TICK_CHANCE * (dtMs / 1000);
          if (Math.random() < chance) {
            s.eggs.push({
              id: uid(), type: recipe.result,
              isRare: true, isHidden: true,
              hatchTime: HIDDEN_EGG_HATCH,
              createdAt: Date.now(), _virtualAge: 0,
            });
            discoverEgg(s, recipe.result);
            toast(`🌟 히든 알 발견! (${SLIME_VISUALS[recipe.result]?.name ?? recipe.result})`);
          }
        }
      }
    }

    s.lastTickAt = now;
  });
}

function produceAdultEgg(s, slime) {
  const foodType = slime.lastFedFoodType;
  let eggType;
  if (slime.type === 'basic') {
    eggType = foodType;
  } else {
    // X 슬라임 + Y 먹이 → X 50% / Y 50%
    eggType = Math.random() < 0.5 ? slime.type : foodType;
  }
  s.eggs.push({
    id: uid(), type: eggType,
    isRare: false, isHidden: false,
    hatchTime: GROWTH_DURATION.egg_to_baby,
    createdAt: Date.now(), _virtualAge: 0,
  });
  discoverEgg(s, eggType);
  toast(`🥚 ${slime.name}이(가) 알을 낳았어요! (${SLIME_VISUALS[eggType]?.name ?? eggType})`);
}

// ===== 액션 =====

export function feedSlime(slimeId, foodId) {
  setState(s => {
    const slime = s.slimes.find(sl => sl.id === slimeId);
    if (!slime) return;
    const inv = s.foodInventory[foodId] ?? 0;
    if (inv <= 0) { toast('먹이가 부족합니다.'); return; }
    const food = s.foods.find(f => f.id === foodId);
    if (!food) return;
    s.foodInventory[foodId] = inv - 1;
    slime.hunger = Math.max(0, slime.hunger - FEED_HUNGER_RECOVERY);
    slime.lastFedFoodType = food.producesType;
    slime.growthProgress = Math.min(1, slime.growthProgress + FEED_GROWTH_BOOST);
    slime.happiness = Math.min(100, slime.happiness + 5);
  });
}

export function buyFood(foodId, amount = 1) {
  setState(s => {
    const food = s.foods.find(f => f.id === foodId);
    if (!food) return;
    if (!food.isUnlocked) { toast('먼저 해금이 필요합니다.'); return; }
    const total = food.price * amount;
    if (s.gold < total) { toast('골드가 부족합니다.'); return; }
    s.gold -= total;
    s.totalSpent += total;
    s.foodInventory[foodId] = (s.foodInventory[foodId] ?? 0) + amount;
    toast(`${food.emoji} ${food.name} ${amount}개 구매`);
  });
}

export function unlockFood(foodId) {
  setState(s => {
    const food = s.foods.find(f => f.id === foodId);
    if (!food) return;
    if (food.isUnlocked) return;
    if (s.gold < food.unlockCost) { toast('골드가 부족합니다.'); return; }
    s.gold -= food.unlockCost;
    s.totalSpent += food.unlockCost;
    food.isUnlocked = true;
    toast(`🔓 ${food.name} 해금!`);
  });
}

export function sellSlime(slimeId) {
  setState(s => {
    const idx = s.slimes.findIndex(sl => sl.id === slimeId);
    if (idx < 0) return;
    const slime = s.slimes[idx];
    const price = slimeSellPrice(slime.type, slime.stage);
    s.gold += price;
    // VIP 룸에 있었다면 제거
    if (slime.vipRoomId) {
      const room = s.vipRooms.find(r => r.id === slime.vipRoomId);
      if (room) room.slimeIds = room.slimeIds.filter(id => id !== slime.id);
    }
    s.slimes.splice(idx, 1);
    toast(`💰 +${price}G`);
  });
}

export function sellEgg(eggId) {
  setState(s => {
    const idx = s.eggs.findIndex(e => e.id === eggId);
    if (idx < 0) return;
    const egg = s.eggs[idx];
    const price = eggSellPrice(egg.type, egg.isHidden);
    s.gold += price;
    s.eggs.splice(idx, 1);
    toast(`💰 +${price}G`);
  });
}

export function expandFarm() {
  setState(s => {
    const next = s.farmSlotsIndex + 1;
    if (next >= FARM_SLOT_EXPANSION.length) { toast('최대 확장 단계입니다.'); return; }
    const cost = FARM_SLOT_EXPANSION[next].cost;
    if (s.gold < cost) { toast('골드가 부족합니다.'); return; }
    s.gold -= cost;
    s.totalSpent += cost;
    s.farmSlotsIndex = next;
    toast(`🏠 농장 확장 → ${FARM_SLOT_EXPANSION[next].slots}칸`);
  });
}

export function unlockVIPRoom(templateId) {
  setState(s => {
    const tpl = VIP_ROOM_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    if (s.vipRooms.some(r => r.templateId === templateId)) { toast('이미 해금됨'); return; }
    if (s.gold < tpl.cost) { toast('골드가 부족합니다.'); return; }
    s.gold -= tpl.cost;
    s.totalSpent += tpl.cost;
    s.vipRooms.push({ id: uid(), templateId: tpl.id, slimeIds: [] });
    toast(`🏰 ${tpl.name} 해금!`);
  });
}

export function addSlimeToVIP(slimeId, roomId) {
  setState(s => {
    const slime = s.slimes.find(sl => sl.id === slimeId);
    const room = s.vipRooms.find(r => r.id === roomId);
    if (!slime || !room) return;
    const tpl = VIP_ROOM_TEMPLATES.find(t => t.id === room.templateId);
    if (room.slimeIds.length >= tpl.capacity) { toast('VIP룸이 가득 찼습니다.'); return; }
    if (slime.vipRoomId) { toast('이미 VIP룸에 있습니다.'); return; }
    slime.vipRoomId = room.id;
    room.slimeIds.push(slime.id);
  });
}

export function removeSlimeFromVIP(slimeId) {
  setState(s => {
    const slime = s.slimes.find(sl => sl.id === slimeId);
    if (!slime || !slime.vipRoomId) return;
    const room = s.vipRooms.find(r => r.id === slime.vipRoomId);
    if (room) room.slimeIds = room.slimeIds.filter(id => id !== slime.id);
    slime.vipRoomId = null;
  });
}

export function setSpeed(n) {
  setState(s => { s.speedMultiplier = Number(n) || 1; });
}
