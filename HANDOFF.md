# 🤝 Claude Code 인수인계 가이드

이 문서는 Claude.ai 채팅에서 작업하던 내용을 **Claude Code 세션으로 이어받기 위한 가이드**입니다.

---

## 🚀 빠른 시작 (Claude Code에서)

### 1. 프로젝트 폴더로 이동
```bash
cd slime-game
```

### 2. Claude Code 실행
```bash
claude
```

### 3. 첫 메시지로 아래 프롬프트 붙여넣기

````markdown
이 프로젝트는 React Native 기반 슬라임 키우기 게임입니다.
Claude.ai 채팅에서 1단계까지 작업했고, Claude Code로 이어 작업하려고 합니다.

**먼저 다음 문서들을 순서대로 읽어주세요:**

1. `docs/README.md` - 프로젝트 개요
2. `docs/GAME_DESIGN.md` - 게임 시스템 상세 설계
3. `docs/ARCHITECTURE.md` - 코드 구조와 파일별 역할
4. `docs/ROADMAP.md` - 5단계 개발 로드맵
5. `docs/HANDOFF.md` - 이 인수인계 가이드

그리고 `src/` 폴더의 현재 코드도 한 번 훑어봐주세요.

**다 읽으신 뒤, 다음 두 가지를 알려주세요:**
1. 프로젝트 현재 상태에 대한 간단한 요약
2. 다음 작업(2단계 또는 3단계) 중 어느 것부터 시작할지 선택지 제시

**협업 스타일:**
- 비개발자도 이해할 수 있게 구현 위주로 설명
- 구현 방향은 문답 형식으로 선택지 제공
- 한국어로 소통
````

---

## 📋 프로젝트 현재 상태

### 완료된 1단계
**기능적으로 동작하는 농장 화면 + 핵심 게임 루프 뼈대**

- 슬라임이 농장에서 자유롭게 돌아다님
- 알이 자동 부화 → 아기 → 어른 → 노인으로 성장
- 어른 슬라임이 알을 자동 생산
- 먹이를 주면 속성이 결정됨 (드래그앤드롭 + 버튼)
- 슬라임/알 판매로 골드 획득
- 노인 슬라임은 극소 확률로 희귀알 생산
- 모든 데이터 자동 저장 (AsyncStorage)

### 미작업 영역
- 상점 화면 (먹이 구매/해금)
- 인벤토리 화면
- VIP룸 시각/배치 UI
- 도감 화면
- 하단 탭 네비게이션
- 시각 피드백 (성장 진행도, 부화 이펙트)
- 사운드
- 알림/토스트
- 출시 준비 작업

---

## 🎯 권장 다음 작업

### 옵션 1: 2단계 (시각 피드백 보강) — 짧고 가벼움
플레이어가 게임 상황을 더 잘 인지할 수 있도록 알림/이펙트 추가.
- 알 부화 애니메이션
- 토스트 알림
- 성장 진행도 바
- 빈 상태 튜토리얼

→ 약 2~3일 작업

### 옵션 2: 3단계 (경제 시스템) — 핵심 루프 완성 ⭐
게임의 본질인 "팔고 → 사고 → 키우고" 사이클 완성.
- React Navigation 도입
- 상점 화면 (먹이 구매/해금/슬롯 확장)
- 인벤토리 화면 (슬라임/알 목록 + 일괄 판매)

→ 약 4~5일 작업, **추천!**

---

## 🛠 작업 시작 전 체크리스트

Claude Code에게 작업 시작 전 확인해달라고 할 항목:

- [ ] `package.json`에 필요한 패키지가 모두 있는지
- [ ] iOS의 경우 `Podfile.lock` 최신 상태인지
- [ ] `App.tsx`가 `<FarmScreen />`을 렌더링하는지
- [ ] AsyncStorage 권한이 정상 작동하는지
- [ ] 시뮬레이터/에뮬레이터 실행 가능한지

---

## 📦 필요 패키지 (전체)

### 1단계까지 (이미 사용 중)
```bash
npm install zustand immer @react-native-async-storage/async-storage react-native-uuid react-native-safe-area-context
```

### 3단계 추가 예정
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens
```

### 5단계 추가 가능
```bash
# 사운드
npm install react-native-sound
# 또는
npm install expo-av

# 클라우드 저장
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/auth
```

---

## 💡 Claude Code 작업 시 유의사항

### ✅ 잘 활용하기
- **파일 직접 읽기/수정 가능** → 구조적인 리팩토링도 부탁 가능
- **빌드/실행 가능** → "지금 빌드해서 에러 없는지 확인해줘" 가능
- **여러 파일 동시 편집** → 화면 추가 시 라우팅까지 한 번에 처리 가능

### ⚠️ 조심할 점
- 큰 변경 전에는 **현재 코드 백업** (git commit)
- 새 기능 추가 시 **타입 정의부터 업데이트** (`src/types/game.ts`)
- 게임 밸런스 수정 시 **`src/constants/slimes.ts`만** 수정
- 상태 로직은 **반드시 `src/store/gameStore.ts`** 안에서 처리

---

## 🔄 Git 사용 권장 흐름

```bash
# 작업 시작 전
git status
git checkout -b feature/stage-2

# 작업 후
git add .
git commit -m "Stage 2: Add toast notifications"
git push origin feature/stage-2
```

Claude Code에게도 "각 작업 단위마다 커밋해줘" 부탁하면 자동으로 처리해줍니다.

---

## 📞 도움이 필요할 때

### Claude Code에서 막히면
1. 에러 메시지 전체를 복붙해서 보여주기
2. 어떤 의도로 무엇을 하려 했는지 설명
3. 시도해본 것들 알려주기

### 설계/방향 결정이 필요하면
- Claude Code 세션 안에서 "이거 A안 vs B안 어떻게 할까?" 형태로 물어보면 됨
- 또는 다시 Claude.ai 채팅으로 와서 설계 단계 논의

---

## 📂 프로젝트 파일 구조 (현재)

```
slime-game/
├── App.tsx                          ← 진입점
├── package.json
├── docs/                            ← 이 문서들
│   ├── README.md
│   ├── GAME_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── HANDOFF.md
└── src/
    ├── types/game.ts
    ├── constants/slimes.ts
    ├── store/gameStore.ts
    └── components/
        ├── farm/
        │   ├── FarmScreen.tsx
        │   └── SlimeCharacter.tsx
        └── ui/
            └── TopBar.tsx
```

---

## 🎮 마지막으로

이 게임은 **출시까지 가는 것이 목표**입니다.
완벽함보다는 **빠른 사이클**로 동작하는 버전을 먼저 만들고,
유저 피드백을 받으며 개선해나가는 방향을 추천합니다.

> 💪 화이팅! 좋은 슬라임 농장이 되길 🟢
