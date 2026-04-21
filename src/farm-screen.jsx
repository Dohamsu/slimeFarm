// farm-screen.jsx — 메인 농장 화면 (핵심 인터랙션)

function FarmScreen({ state, setState, onOpenShop, onOpenInv, onOpenCompendium, onOpenVIP }) {
  const [selected, setSelected] = React.useState(null);
  const [foodBagOpen, setFoodBagOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [fedFx, setFedFx] = React.useState(null); // {x,y,emoji}
  const [dragFood, setDragFood] = React.useState(null); // {foodId, x, y}

  const showToast = (txt) => {
    setToast(txt);
    setTimeout(() => setToast(null), 1800);
  };

  const feedSlime = (slimeId, foodId) => {
    const food = FOODS.find(f => f.id === foodId);
    if (!food) return;
    if ((state.foodInv[foodId] || 0) <= 0) { showToast('먹이가 부족해요!'); return; }
    setState(s => ({
      ...s,
      foodInv: { ...s.foodInv, [foodId]: s.foodInv[foodId] - 1 },
      slimes: s.slimes.map(sl => sl.id === slimeId
        ? { ...sl, hunger: Math.max(0, sl.hunger - 40), happiness: Math.min(100, sl.happiness + 10), lastFood: foodId }
        : sl),
    }));
    const sl = state.slimes.find(x => x.id === slimeId);
    setFedFx({ id: Math.random(), slimeId, emoji: food.emoji });
    setTimeout(() => setFedFx(null), 1500);
    showToast(`${food.emoji} ${food.name} 먹였어요!`);
  };

  const sellSlime = (slimeId) => {
    const sl = state.slimes.find(x => x.id === slimeId);
    if (!sl) return;
    const multi = sl.stage === 'adult' ? 1.0 : sl.stage === 'elder' ? 0.6 : 0.4;
    const gold = Math.round((SLIMES[sl.type]?.price || 100) * multi);
    setState(s => ({ ...s, gold: s.gold + gold, slimes: s.slimes.filter(x => x.id !== slimeId) }));
    setSelected(null);
    showToast(`💰 +${gold}G`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: THEME.bg, overflow: 'hidden' }}>
      {/* 하늘 + 농장 배경 */}
      <FarmBackground />

      {/* 상단바 */}
      <TopBar state={state} onFoodBag={() => setFoodBagOpen(true)} />

      {/* 슬라임들 */}
      <div style={{ position: 'absolute', inset: '120px 0 120px 0' }}>
        {state.slimes.map((sl, i) => (
          <SlimeOnFarm key={sl.id} slime={sl}
            delay={i * 0.3}
            fedEmoji={fedFx?.slimeId === sl.id ? fedFx.emoji : null}
            onTap={() => setSelected(sl)} />
        ))}

        {/* VIP룸 */}
        {state.vipRooms.filter(r => r.unlocked).map(room => (
          <VIPRoomOnFarm key={room.id} room={room} slimes={state.slimes} />
        ))}
      </div>

      {/* 알 목록 (하단) */}
      <EggTray eggs={state.eggs} />

      {/* 하단 탭 */}
      <BottomTabs onShop={onOpenShop} onInv={onOpenInv} onCompendium={onOpenCompendium} onVIP={onOpenVIP} />

      {/* 슬라임 상세 모달 */}
      {selected && (
        <SlimeDetailModal slime={selected} foodInv={state.foodInv}
          onClose={() => setSelected(null)}
          onFeed={(fid) => feedSlime(selected.id, fid)}
          onSell={() => sellSlime(selected.id)} />
      )}

      {/* 먹이 가방 모달 */}
      {foodBagOpen && (
        <FoodBagModal foodInv={state.foodInv} onClose={() => setFoodBagOpen(false)}
          onDragStart={(foodId, x, y) => { setFoodBagOpen(false); setDragFood({ foodId, x, y }); }} />
      )}

      {/* 드래그 중 먹이 */}
      {dragFood && (
        <DragFoodLayer foodId={dragFood.foodId} initial={dragFood}
          slimes={state.slimes}
          onDrop={(slimeId) => {
            if (slimeId) feedSlime(slimeId, dragFood.foodId);
            else showToast('가까운 슬라임이 없어요');
            setDragFood(null);
          }} />
      )}

      {/* 토스트 */}
      {toast && <Toast text={toast} />}
    </div>
  );
}

// ─ 배경
function FarmBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 하늘 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42%',
        background: `linear-gradient(180deg, ${THEME.sky1} 0%, ${THEME.sky2} 100%)` }} />
      {/* 구름 */}
      <div style={{ position: 'absolute', top: 90, left: 30, fontSize: 32, opacity: 0.9 }}>☁️</div>
      <div style={{ position: 'absolute', top: 140, right: 50, fontSize: 28, opacity: 0.7 }}>☁️</div>
      {/* 먼 언덕 */}
      <svg viewBox="0 0 400 100" style={{ position: 'absolute', top: '28%', left: 0, width: '100%', height: 100 }}>
        <path d="M 0 80 Q 100 30 200 60 Q 300 90 400 50 L 400 100 L 0 100 Z" fill="#c5e7b4" opacity="0.7"/>
      </svg>
      {/* 잔디 */}
      <div style={{ position: 'absolute', top: '36%', left: 0, right: 0, bottom: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${THEME.grass1} 0%, ${THEME.grass2} 60%, ${THEME.grass3} 100%)` }} />
      {/* 잔디 패턴 */}
      <div style={{ position: 'absolute', top: '36%', left: 0, right: 0, bottom: 0,
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 3%),
                          radial-gradient(circle at 70% 60%, rgba(0,0,0,0.05) 0%, transparent 3%),
                          radial-gradient(circle at 45% 80%, rgba(255,255,255,0.1) 0%, transparent 3%)`,
        backgroundSize: '80px 80px' }} />
      {/* 장식 */}
      <div style={{ position: 'absolute', top: '58%', left: 20, fontSize: 22 }}>🌻</div>
      <div style={{ position: 'absolute', top: '72%', right: 30, fontSize: 20 }}>🌳</div>
      <div style={{ position: 'absolute', top: '82%', left: 50, fontSize: 16 }}>🍄</div>
    </div>
  );
}

// ─ 상단바
function TopBar({ state, onFoodBag }) {
  const foodCount = Object.values(state.foodInv).reduce((a, b) => a + b, 0);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 12, zIndex: 10,
      display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        <PillStat icon="💰" value={`${state.gold}G`} color={THEME.gold} />
        <PillStat icon="🟢" value={state.slimes.length} />
        <PillStat icon="🥚" value={state.eggs.length} />
      </div>
      <div onClick={onFoodBag} style={{
        background: '#fff', borderRadius: 16, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        boxShadow: THEME.shadow, border: `2px solid ${THEME.line}`,
      }}>
        <div style={{ fontSize: 22 }}>🎒</div>
        <div style={{ fontFamily: FONT_DISP, fontWeight: 700, color: THEME.ink, fontSize: 16 }}>{foodCount}</div>
      </div>
    </div>
  );
}

function PillStat({ icon, value, color = THEME.ink }) {
  return (
    <div style={{ background: '#fff', borderRadius: 999, padding: '6px 12px',
      display: 'flex', alignItems: 'center', gap: 5, boxShadow: THEME.shadow, border: `2px solid ${THEME.line}` }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontFamily: FONT_DISP, fontWeight: 700, color, fontSize: 14 }}>{value}</span>
    </div>
  );
}

// ─ 농장 위 슬라임
function SlimeOnFarm({ slime, onTap, fedEmoji, delay = 0 }) {
  const hungry = slime.hunger >= 70;
  const [pos, setPos] = React.useState({ x: slime.x, y: slime.y });
  React.useEffect(() => {
    // 느슨한 자유이동 시뮬
    const id = setInterval(() => {
      setPos(p => ({
        x: Math.max(0.05, Math.min(0.9, p.x + (Math.random() - 0.5) * 0.08)),
        y: Math.max(0.1, Math.min(0.85, p.y + (Math.random() - 0.5) * 0.06)),
      }));
    }, 3500 + delay * 1000);
    return () => clearInterval(id);
  }, []);
  const hasRoom = !!slime.vipRoomId;
  return (
    <div
      data-slime-id={slime.id}
      onClick={onTap}
      style={{
        position: 'absolute', left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 3s ease-in-out, top 3s ease-in-out',
        cursor: 'pointer', zIndex: Math.floor(pos.y * 10),
        animationDelay: `${delay}s`,
      }}>
      <SlimeBody type={slime.type} stage={slime.stage} size={64} hungry={hungry} />
      {/* 진행도 바 (머리 위) */}
      {slime.stage !== 'adult' && slime.stage !== 'elder' && (
        <div style={{ position: 'absolute', top: -10, left: 0, right: 0, padding: '0 8px' }}>
          <ProgressBar value={slime.growth} color={THEME.accent} height={3} />
        </div>
      )}
      {/* 알 생산 임박 */}
      {slime.stage === 'adult' && slime.eggReady > 0.7 && (
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          fontSize: 14, animation: 'pulse 1s infinite' }}>🥚</div>
      )}
      {/* 먹이 이펙트 */}
      {fedEmoji && (
        <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          fontSize: 22, animation: 'floatUp 1.5s ease-out' }}>{fedEmoji}</div>
      )}
      {/* VIP 배지 */}
      {hasRoom && (
        <div style={{ position: 'absolute', top: -8, right: -6, background: THEME.gold, color: '#fff',
          fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 6, fontFamily: FONT_DISP }}>VIP</div>
      )}
    </div>
  );
}

// ─ VIP룸 (농장 내 표시)
function VIPRoomOnFarm({ room, slimes }) {
  const inside = slimes.filter(s => room.slimeIds.includes(s.id));
  return (
    <div style={{ position: 'absolute', right: 16, bottom: 20,
      width: 120, height: 86,
      background: 'rgba(255,255,255,0.55)',
      border: `2.5px dashed ${THEME.gold}`, borderRadius: 14,
      padding: 6, display: 'flex', flexDirection: 'column', gap: 4,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, fontFamily: FONT_DISP, color: THEME.gold,
        display: 'flex', alignItems: 'center', gap: 3 }}>
        <span>👑</span><span>{room.name}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {inside.map(sl => <SlimeBody key={sl.id} type={sl.type} stage={sl.stage} size={32} />)}
        {Array.from({ length: room.capacity - inside.length }).map((_, i) => (
          <div key={i} style={{ width: 28, height: 24, border: `1.5px dashed ${THEME.inkFaint}`,
            borderRadius: 10, background: 'rgba(255,255,255,0.4)' }} />
        ))}
      </div>
    </div>
  );
}

// ─ 알 트레이
function EggTray({ eggs }) {
  return (
    <div style={{ position: 'absolute', bottom: 78, left: 12, right: 12,
      background: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: '8px 12px',
      display: 'flex', gap: 8, alignItems: 'center', boxShadow: THEME.shadow,
      border: `2px solid ${THEME.line}`, backdropFilter: 'blur(8px)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: THEME.inkSoft, fontFamily: FONT_DISP }}>부화 중</div>
      <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto' }}>
        {eggs.map(e => <EggCard key={e.id} egg={e} />)}
        {eggs.length === 0 && <div style={{ fontSize: 12, color: THEME.inkFaint, fontFamily: FONT }}>빈 둥지…</div>}
      </div>
    </div>
  );
}

function EggCard({ egg }) {
  const s = SLIMES[egg.type] || SLIMES.basic;
  const remain = Math.ceil((1 - egg.progress) * 5);
  return (
    <div style={{ minWidth: 54, background: THEME.cardAlt, borderRadius: 12, padding: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      border: egg.rare ? `2px solid ${THEME.gold}` : `1.5px solid ${THEME.line}`,
      position: 'relative',
    }}>
      {egg.rare && <div style={{ position: 'absolute', top: -6, right: -4, fontSize: 12 }}>✨</div>}
      <div style={{ animation: 'eggWiggle 1.2s ease-in-out infinite' }}>
        <SlimeBody type={egg.type} stage="egg" size={32} />
      </div>
      <div style={{ width: '100%' }}><ProgressBar value={egg.progress} height={3} color={s.ring} /></div>
      <div style={{ fontSize: 10, fontWeight: 700, color: THEME.inkSoft, fontFamily: FONT_NUM }}>{remain}분</div>
    </div>
  );
}

// ─ 하단 탭
function BottomTabs({ onShop, onInv, onCompendium, onVIP, active = 'farm' }) {
  const tabs = [
    { id: 'farm', icon: '🏠', label: '농장',   on: () => {} },
    { id: 'shop', icon: '🏪', label: '상점',   on: onShop },
    { id: 'inv',  icon: '📦', label: '인벤',   on: onInv },
    { id: 'comp', icon: '📖', label: '도감',   on: onCompendium },
    { id: 'vip',  icon: '👑', label: 'VIP',    on: onVIP },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: `2px solid ${THEME.line}`,
      display: 'flex', padding: '8px 4px 14px', zIndex: 20 }}>
      {tabs.map(t => (
        <div key={t.id} onClick={t.on} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          cursor: 'pointer', padding: '4px 0',
          color: t.id === active ? THEME.accentDk : THEME.inkFaint,
        }}>
          <div style={{ fontSize: 22, filter: t.id === active ? 'none' : 'grayscale(0.3)' }}>{t.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 800, fontFamily: FONT_DISP }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─ 토스트
function Toast({ text }) {
  return (
    <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(61,52,39,0.92)', color: '#fff',
      padding: '8px 16px', borderRadius: 999, fontFamily: FONT_DISP, fontWeight: 700, fontSize: 13,
      zIndex: 100, animation: 'popIn .2s ease-out', whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
}

Object.assign(window, { FarmScreen });
