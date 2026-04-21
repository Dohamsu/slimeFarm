# 🟢 슬라임 키우기 게임 (Slime Tycoon)

React Native 기반의 캐주얼 슬라임 농장 키우기 게임 프로젝트입니다.
알을 부화시키고, 슬라임을 키우고, 먹이를 먹여 다양한 속성의 새로운 슬라임을 만들어내는 순환형 수집 게임입니다.

---

## 📚 문서 인덱스

이 프로젝트의 모든 설계와 작업 계획은 아래 문서로 나뉘어 있습니다. **순서대로 읽으면 전체 그림을 파악할 수 있습니다.**

| 문서 | 내용 |
|------|------|
| [`README.md`](./README.md) | 프로젝트 개요, 시작 가이드 (이 문서) |
| [`GAME_DESIGN.md`](./GAME_DESIGN.md) | 게임 시스템 상세 설계 (성장/먹이/VIP/도감/경제) |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 폴더 구조, 파일별 역할, 데이터 흐름 |
| [`ROADMAP.md`](./ROADMAP.md) | 5단계 개발 로드맵 + 현재 진행 상황 |
| [`HANDOFF.md`](./HANDOFF.md) | Claude Code로 작업 이어가기 위한 인수인계 가이드 |

---

## 🎮 게임 한 줄 요약

> 알 → 아기 → 어른 → 노인 슬라임으로 키우고, **먹이에 따라 속성이 달라지는 새 알을 낳게 해서 팔고**, 그 돈으로 더 좋은 먹이를 해금하는 **수집형 키우기 게임**.

---

## ✨ 핵심 차별 포인트

1. **먹이 = 속성 결정 시스템** — 슬라임이 먹은 먹이가 어떤 알을 낳을지 결정
2. **혼합 유전자** — A 슬라임에게 B 먹이를 주면 A알/B알 50:50 확률로 생산
3. **노인 슬라임의 딜레마** — 식충이지만 로또성 희귀알을 낳음 ("팔까 vs 키울까")
4. **VIP룸 히든 조합** — 특정 슬라임끼리 모으면 숨겨진 종류 발견
5. **누적 도감** — 발견한 모든 슬라임/알 자동 기록으로 수집 욕구 자극

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | **React Native** (TypeScript) |
| 상태관리 | **Zustand** + Immer |
| 저장소 | **AsyncStorage** (로컬, 추후 클라우드 마이그레이션 예정) |
| 애니메이션 | React Native **Animated API** |
| 네비게이션 | **React Navigation** (Bottom Tabs, 3단계에서 도입) |
| 고유 ID | `react-native-uuid` |

---

## 🚀 빠른 시작

### 1. 패키지 설치

```bash
npm install zustand immer @react-native-async-storage/async-storage react-native-uuid
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# iOS
npx pod-install
```

### 2. 실행

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### 3. 앱 진입점

`App.tsx` → `<FarmScreen />`

---

## 📂 현재 프로젝트 구조 (1단계 완료 시점)

```
slime-game/
├── App.tsx                            # 진입점
└── src/
    ├── types/
    │   └── game.ts                    # 모든 데이터 타입 정의
    ├── constants/
    │   └── slimes.ts                  # 슬라임/먹이/VIP 레시피 상수
    ├── store/
    │   └── gameStore.ts               # Zustand 게임 상태 + 로직
    └── components/
        ├── farm/
        │   ├── FarmScreen.tsx         # 메인 농장 화면
        │   └── SlimeCharacter.tsx     # 슬라임 (이동/애니메이션)
        └── ui/
            └── TopBar.tsx             # 상단바 (재화/먹이가방)
```

---

## 🎯 출시 목표

**앱스토어 정식 출시까지** 진행을 목표로 합니다.
초기에는 로컬 저장으로 빠르게 만들고, 안정화 후 클라우드 저장으로 확장합니다.

---

## 👤 협업 스타일

- **비개발자도 이해할 수 있는** 구현 위주 설명
- 구현 방향은 **문답 형식 + 선택지** 제공
- 한국어 소통

---

## 📌 다음 작업

[`ROADMAP.md`](./ROADMAP.md)의 **2단계** 또는 **3단계**부터 진행 예정.
자세한 인수인계 내용은 [`HANDOFF.md`](./HANDOFF.md) 참고.
