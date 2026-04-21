# 🏗️ 아키텍처 & 코드 구조

이 문서는 프로젝트의 폴더 구조, 파일별 역할, 데이터 흐름을 설명합니다.

---

## 📁 전체 폴더 구조

```
slime-game/
├── App.tsx                              # 진입점
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── game.ts                      # ✅ 모든 데이터 타입 정의
    │
    ├── constants/
    │   └── slimes.ts                    # ✅ 슬라임/먹이/VIP 레시피 상수
    │
    ├── store/
    │   └── gameStore.ts                 # ✅ Zustand 게임 상태 + 전체 게임 로직
    │
    ├── components/
    │   ├── farm/
    │   │   ├── FarmScreen.tsx           # ✅ 메인 농장 화면
    │   │   ├── SlimeCharacter.tsx       # ✅ 슬라임 (이동/애니메이션)
    │   │   └── VIPRoom.tsx              # 🚧 4단계 - VIP룸 UI
    │   │
    │   ├── shop/
    │   │   ├── ShopScreen.tsx           # 🚧 3단계 - 상점 화면
    │   │   ├── FoodShopTab.tsx          # 🚧 3단계 - 먹이 구매 탭
    │   │   ├── UnlockShopTab.tsx        # 🚧 3단계 - 먹이 해금 탭
    │   │   └── FarmExpansionTab.tsx     # 🚧 3단계 - 슬롯 확장
    │   │
    │   ├── inventory/
    │   │   ├── InventoryScreen.tsx      # 🚧 3단계 - 보유 슬라임/알 목록
    │   │   ├── SlimeListItem.tsx        # 🚧 3단계
    │   │   └── EggListItem.tsx          # 🚧 3단계
    │   │
    │   ├── compendium/
    │   │   └── CompendiumScreen.tsx     # 🚧 4단계 - 도감
    │   │
    │   ├── modal/
    │   │   ├── SlimeDetailModal.tsx     # 🚧 분리 예정 (현재 FarmScreen 내부)
    │   │   ├── FoodBagModal.tsx         # 🚧 분리 예정
    │   │   └── ConfirmModal.tsx         # 🚧 공용 확인 모달
    │   │
    │   └── ui/
    │       ├── TopBar.tsx               # ✅ 상단바
    │       ├── Button.tsx               # 🚧 공용 버튼
    │       └── ProgressBar.tsx          # 🚧 공용 진행도 바
    │
    ├── navigation/
    │   └── BottomTabs.tsx               # 🚧 3단계 - 하단 탭 네비게이션
    │
    ├── hooks/
    │   ├── useGameTick.ts               # 🚧 분리 예정 - 1초 틱 훅
    │   └── useNotifications.ts          # 🚧 알림 훅
    │
    └── utils/
        ├── pricing.ts                   # 🚧 가격 계산 유틸
        └── randomizer.ts                # 🚧 확률 계산 유틸
```

**범례:** ✅ 완료 (1단계) · 🚧 미작업

---

## 📄 파일별 상세 설명

### 1. `src/types/game.ts` ✅

모든 데이터 타입을 정의하는 핵심 파일.

```ts
// 주요 타입
type SlimeStage = 'egg' | 'baby' | 'adult' | 'elder'
type SlimeType = 'basic' | 'fire' | 'ice' | ... | 'hidden_lava' | string
type FoodId = 'basic_feed' | 'fire_herb' | ...

interface Slime {
  id, type, stage, name,
  x, y,                      // 농장 내 위치
  growthProgress, age,       // 성장
  hunger, happiness,         // 상태
  lastEggTime, eggCooldown,  // 알 생산
  vipRoomId,                 // VIP룸 소속
  fedFoodTypes              // 먹은 먹이 히스토리
}

interface Egg {
  id, type,
  isRare, isHidden,
  hatchTime, createdAt
}

interface Food {
  id, name, emoji,
  price, unlockCost, isUnlocked,
  producesType, description
}

interface GameState {
  gold, totalSpent,
  slimes, eggs,
  farmSlots, vipRooms,
  foods, foodInventory,
  compendium,
  lastSavedAt, createdAt
}
```

---

### 2. `src/constants/slimes.ts` ✅

게임 상수 모음. 밸런싱 시 이 파일만 수정하면 됨.

| 상수 | 용도 |
|------|------|
| `SLIME_VISUALS` | 타입별 이모지/색상/이름 |
| `SLIME_BASE_PRICE` | 타입별 기본 판매가 |
| `SLIME_SELL_PRICE` | 단계별 판매가 계산 함수 |
| `GROWTH_DURATION` | 단계별 성장 시간 |
| `EGG_COOLDOWN` | 알 생산 쿨다운 |
| `RARE_EGG_CHANCE` | 희귀알 확률 |
| `MIXED_EGG_RATIO` | 혼합 알 비율 (50:50) |
| `VIP_HIDDEN_RECIPES` | 히든 조합 레시피 |
| `FOODS` | 전체 먹이 목록 |
| `FARM_SLOT_EXPANSION` | 농장 확장 단계 |
| `VIP_ROOM_TEMPLATES` | VIP룸 템플릿 |

---

### 3. `src/store/gameStore.ts` ✅

**Zustand 기반 게임 상태 + 모든 비즈니스 로직.**

#### 사용 미들웨어
- `persist` + `AsyncStorage` → 자동 저장
- `immer` → 불변성 자동 처리

#### 액션 목록

| 액션 | 설명 |
|------|------|
| `tick()` | 1초마다 호출. 성장/배고픔/알 생산/부화 처리 |
| `feedSlime(slimeId, foodId)` | 슬라임에게 먹이 주기 |
| `buyFood(foodId, amount)` | 먹이 구매 |
| `unlockFood(foodId)` | 먹이 해금 (일회성 비용) |
| `sellSlime(slimeId)` | 슬라임 판매 |
| `sellEgg(eggId)` | 알 판매 |
| `expandFarm()` | 농장 슬롯 확장 |
| `unlockVIPRoom(templateIndex)` | VIP룸 해금 |
| `addSlimeToVIP(slimeId, roomId)` | VIP룸에 슬라임 배치 |
| `removeSlimeFromVIP(slimeId, roomId)` | VIP룸에서 빼기 |
| `discoverSlime(type)` / `discoverEgg(type)` | 도감 등록 |

#### `tick()` 함수의 역할 (핵심)
1. **알 부화 체크** — `createdAt + hatchTime <= now`인 알 → 슬라임으로 변환
2. **슬라임 성장** — 단계별 진행도 업데이트, 단계 전환
3. **배고픔 증가** — 모든 슬라임 hunger += 0.05
4. **알 생산 체크** — 어른 슬라임 쿨다운 만료 시 알 생성
5. **노인 희귀알 시도** — 노인 슬라임 5% 확률 굴림
6. **VIP룸 히든알 체크** — 정확한 조합이면 0.1% 확률

#### 사용 예시
```tsx
const { gold, slimes, feedSlime } = useGameStore();
feedSlime('slime-id-123', 'fire_herb');
```

---

### 4. `src/components/farm/FarmScreen.tsx` ✅

메인 농장 화면. 1단계의 핵심.

#### 구성 요소
- 배경 (잔디 패턴)
- `<TopBar />` — 상단바
- 슬라임 목록 (`slimes.map`)
- 알 목록 (하단 줄)
- 먹이 가방 모달
- 슬라임 상세 모달
- 드래그 중인 먹이 표시

#### 주요 로직
- `useEffect`로 1초마다 `tick()` 호출
- 슬라임 탭 → 상세 모달 오픈
- 먹이 가방 PanResponder로 드래그앤드롭 구현
  - 드롭 위치에서 80px 이내 가장 가까운 슬라임 찾아 먹이기

#### 향후 분리 작업 (리팩토링)
- 모달 2개를 별도 파일로 분리 (`SlimeDetailModal.tsx`, `FoodBagModal.tsx`)
- `useGameTick` 훅으로 틱 로직 분리

---

### 5. `src/components/farm/SlimeCharacter.tsx` ✅

개별 슬라임 컴포넌트.

#### 구현 내용
- **자유 이동**: `Animated.timing`으로 랜덤 위치로 2~5초간 이동 → 도착 후 1~3초 휴식 → 반복
- **통통 튀기**: `Animated.loop`으로 -6px ~ 0px 반복
- **단계별 크기**: `STAGE_SCALE`에 따라 0.6 ~ 1.0
- **배고픔 표시**: hunger > 70 시 머리 위 😫
- **탭 처리**: `TouchableOpacity` → `onPress(slime)` 콜백

#### Props
```ts
{
  slime: Slime,
  farmWidth: number,
  farmHeight: number,
  onPress: (slime: Slime) => void,
}
```

---

### 6. `src/components/ui/TopBar.tsx` ✅

상단바. 항상 표시되는 글로벌 정보.

#### 표시 정보
- 💰 골드
- 🟢 슬라임 수
- 🥚 알 수
- 🎒 먹이 가방 (탭하면 모달)
- (선택 시) 슬라임 기본 정보

#### Props
```ts
{
  selectedSlime: Slime | null,
  onFoodBagOpen: () => void,
}
```

---

## 🔄 데이터 흐름

```
┌─────────────────┐
│   사용자 액션   │  (탭, 드래그, 시간 경과)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  컴포넌트       │  (FarmScreen, SlimeCharacter 등)
│  (UI Layer)     │
└────────┬────────┘
         │ useGameStore() 호출
         ▼
┌─────────────────┐
│  Zustand Store  │  (gameStore.ts)
│  (State Layer)  │  → 액션 실행 → 상태 업데이트
└────────┬────────┘
         │ 자동 persist
         ▼
┌─────────────────┐
│  AsyncStorage   │  (로컬 저장)
└─────────────────┘
```

### 자동 저장
- Zustand `persist` 미들웨어가 상태 변경 시 자동으로 AsyncStorage에 저장
- 앱 재시작 시 자동으로 복원
- 키: `slime-game-storage`

---

## 🧩 외부 라이브러리

| 라이브러리 | 용도 | 1단계 사용 |
|-----------|------|-----------|
| `zustand` | 상태 관리 | ✅ |
| `immer` | 불변성 처리 | ✅ |
| `@react-native-async-storage/async-storage` | 로컬 저장소 | ✅ |
| `react-native-uuid` | 고유 ID 생성 | ✅ |
| `react-native-safe-area-context` | 노치 대응 | ✅ |
| `@react-navigation/native` | 화면 네비게이션 | 🚧 3단계 |
| `@react-navigation/bottom-tabs` | 하단 탭 | 🚧 3단계 |
| `react-native-reanimated` | 고급 애니메이션 (선택) | 🚧 5단계 |

---

## 🎨 스타일 컨벤션

### 색상 팔레트
```
배경:     #1a2a1a (어두운 녹색)
농장 BG:  #2d5a27 (잔디 녹색)
모달 BG:  #1e1e2e (다크)
강조 칩:  rgba(255,255,255,0.08)
강조색:   #ffd43b (골드/노랑)
판매 버튼: #e03131 (빨강)
```

### 폰트 사이즈
- 큰 제목: 20
- 중간 제목: 14~15
- 본문: 13
- 메타: 11~12
- 캡션: 10

### 둥근 모서리
- 카드: 12~14
- 모달: 24~28 (위쪽만)
- 칩: 20 (완전 둥근)

---

## 🧪 향후 테스트 전략 (선택)

- **Jest** + **React Native Testing Library**
- 우선순위:
  1. `gameStore` 액션 단위 테스트 (가장 중요)
  2. 가격 계산/확률 유틸 테스트
  3. 컴포넌트 스냅샷 테스트

---

## 🔌 클라우드 마이그레이션 (5단계)

현재 `AsyncStorage`를 사용하지만, 향후 **Firebase/Supabase**로 전환 가능하도록 구조화됨.

전환 시 변경 영역:
- `gameStore.ts`의 `persist` 미들웨어 부분만 교체
- 나머지 코드는 변경 불필요
- 사용자 인증 (로그인) UI 추가 필요
