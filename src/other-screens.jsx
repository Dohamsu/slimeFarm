// other-screens.jsx — 상점, 인벤토리, 도감, VIP룸 화면

// ─ 공용 화면 셸
function ScreenShell({ title, emoji, onBack, children, tabActive }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%',
      background: THEME.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ border: 'none', background: '#fff',
          width: 38, height: 38, borderRadius: 12, boxShadow: THEME.shadow, cursor: 'pointer',
          fontSize: 18, border: `2px solid ${THEME.line}` }}>←</button>
        <div style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 22, color: THEME.ink,
          display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22 }}>{emoji}</span><span>{title}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>{children}</div>
      <BottomTabsShell active={tabActive} onBack={onBack} />
    </div>
  );
}

function BottomTabsShell({ active, onBack }) {
  const tabs = [
    { id: 'farm', icon: '🏠', label: '농장' },
    { id: 'shop', icon: '🏪', label: '상점' },
    { id: 'inv',  icon: '📦', label: '인벤' },
    { id: 'comp', icon: '📖', label: '도감' },
    { id: 'vip',  icon: '👑', label: 'VIP' },
  ];
  return (
    <div style={{ background: '#fff', borderTop: `2px solid ${THEME.line}`,
      display: 'flex', padding: '8px 4px 14px' }}>
      {tabs.map(t => (
        <div key={t.id} onClick={() => t.id !== active && onBack && onBack(t.id)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            cursor: 'pointer', padding: '4px 0',
            color: t.id === active ? THEME.accentDk : THEME.inkFaint }}>
          <div style={{ fontSize: 22 }}>{t.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 800, fontFamily: FONT_DISP }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 상점 (먹이 구매 / 해금 / 확장)
// ═══════════════════════════════════════════════════════════════
function ShopScreen({ state, setState, onBack }) {
  const [tab, setTab] = React.useState('buy'); // buy | unlock | expand
  const tabs = [
    { id: 'buy', label: '먹이 구매' },
    { id: 'unlock', label: '해금' },
    { id: 'expand', label: '확장' },
  ];

  return (
    <ScreenShell title="상점" emoji="🏪" onBack={onBack} tabActive="shop">
      <GoldHeader gold={state.gold} />
      <div style={{ display: 'flex', background: THEME.card, borderRadius: 12, padding: 4,
        marginBottom: 14, boxShadow: THEME.shadow, border: `2px solid ${THEME.line}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, border: 'none', padding: '8px 0', borderRadius: 9,
            background: tab === t.id ? THEME.accent : 'transparent',
            color: tab === t.id ? '#fff' : THEME.inkSoft,
            fontFamily: FONT_DISP, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'buy' && <BuyFoodTab state={state} setState={setState} />}
      {tab === 'unlock' && <UnlockFoodTab state={state} setState={setState} />}
      {tab === 'expand' && <ExpandTab state={state} setState={setState} />}
    </ScreenShell>
  );
}

function GoldHeader({ gold }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${THEME.gold} 0%, ${THEME.coin} 100%)`,
      borderRadius: 16, padding: '10px 14px', color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
      boxShadow: '0 4px 12px rgba(232,181,71,0.3)' }}>
      <div style={{ fontSize: 22 }}>💰</div>
      <div style={{ fontFamily: FONT_DISP, fontSize: 12, opacity: 0.9 }}>보유 골드</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: FONT_NUM, fontSize: 22, fontWeight: 800 }}>{gold.toLocaleString()}G</div>
    </div>
  );
}

function BuyFoodTab({ state, setState }) {
  const buyFood = (foodId, qty) => {
    const f = FOODS.find(x => x.id === foodId);
    const cost = f.price * qty;
    if (state.gold < cost) return;
    setState(s => ({ ...s, gold: s.gold - cost,
      foodInv: { ...s.foodInv, [foodId]: (s.foodInv[foodId] || 0) + qty } }));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FOODS.filter(f => f.unlocked).map(f => (
        <SoftCard key={f.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, background: THEME.cardAlt, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              border: `2px solid ${SLIMES[f.produces]?.ring || THEME.line}` }}>{f.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISP, fontSize: 16, fontWeight: 700, color: THEME.ink }}>{f.name}</div>
              <div style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: FONT }}>
                → {SLIMES[f.produces]?.name}
              </div>
              <div style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONT_NUM, marginTop: 2 }}>
                보유 {state.foodInv[f.id] || 0}개 · 개당 {f.price}G
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <PopButton small onClick={() => buyFood(f.id, 1)} disabled={state.gold < f.price} bg={THEME.accent}>×1</PopButton>
              <PopButton small onClick={() => buyFood(f.id, 10)} disabled={state.gold < f.price * 10} bg={THEME.sky}>×10</PopButton>
            </div>
          </div>
        </SoftCard>
      ))}
    </div>
  );
}

function UnlockFoodTab({ state, setState }) {
  const locked = FOODS.filter(f => !f.unlocked);
  const unlockFood = (id, cost) => {
    if (state.gold < cost) return;
    const f = FOODS.find(x => x.id === id);
    if (f) f.unlocked = true;
    setState(s => ({ ...s, gold: s.gold - cost, __rev: (s.__rev || 0) + 1 }));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {locked.map(f => (
        <SoftCard key={f.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, background: THEME.cardAlt, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              border: `2px solid ${THEME.line}`, filter: 'grayscale(0.5) opacity(0.6)' }}>
              <div style={{ position: 'relative' }}>
                {f.emoji}
                <div style={{ position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISP, fontSize: 16, fontWeight: 700, color: THEME.ink }}>{f.name}</div>
              <div style={{ fontSize: 12, color: THEME.inkSoft, fontFamily: FONT }}>
                → {SLIMES[f.produces]?.name} 생산
              </div>
              <div style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONT_NUM, marginTop: 2 }}>
                이후 개당 {f.price}G
              </div>
            </div>
            <PopButton onClick={() => unlockFood(f.id, f.unlockCost)}
              disabled={state.gold < f.unlockCost} bg={THEME.gold}>
              🔓 {f.unlockCost.toLocaleString()}G
            </PopButton>
          </div>
        </SoftCard>
      ))}
    </div>
  );
}

function ExpandTab({ state, setState }) {
  const slots = [
    { n: 4, cost: 0 }, { n: 6, cost: 500 }, { n: 9, cost: 2000 },
    { n: 12, cost: 5000 }, { n: 16, cost: 15000 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SoftCard>
        <div style={{ fontFamily: FONT_DISP, fontWeight: 700, color: THEME.ink, marginBottom: 6 }}>
          🏡 농장 슬롯
        </div>
        <div style={{ fontSize: 13, color: THEME.inkSoft, fontFamily: FONT }}>
          현재 <b style={{ color: THEME.accent }}>{state.farmSlots}칸</b> · 슬라임을 더 많이 키울 수 있어요
        </div>
      </SoftCard>
      {slots.map(s => {
        const done = state.farmSlots >= s.n;
        const next = state.farmSlots < s.n && !slots.find(x => x.n < s.n && x.n > state.farmSlots);
        return (
          <SoftCard key={s.n} style={{ opacity: done ? 0.55 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, background: done ? THEME.accent : THEME.cardAlt,
                color: done ? '#fff' : THEME.inkSoft,
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_DISP, fontWeight: 800, fontSize: 18 }}>
                {s.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISP, fontSize: 15, fontWeight: 700, color: THEME.ink }}>
                  {s.n}칸 농장
                </div>
                <div style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONT_NUM }}>
                  {done ? '보유 중' : `${s.cost.toLocaleString()}G`}
                </div>
              </div>
              {done ? (
                <Chip bg={THEME.accent} color="#fff">✓ 보유</Chip>
              ) : next ? (
                <PopButton bg={THEME.accent} disabled={state.gold < s.cost} small
                  onClick={() => {
                    if (state.gold < s.cost) return;
                    setState(st => ({ ...st, gold: st.gold - s.cost, farmSlots: s.n }));
                  }}>확장</PopButton>
              ) : (
                <Chip bg={THEME.cardAlt} color={THEME.inkFaint}>🔒</Chip>
              )}
            </div>
          </SoftCard>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 인벤토리
// ═══════════════════════════════════════════════════════════════
function InventoryScreen({ state, setState, onBack }) {
  const [tab, setTab] = React.useState('slimes');
  return (
    <ScreenShell title="인벤토리" emoji="📦" onBack={onBack} tabActive="inv">
      <GoldHeader gold={state.gold} />
      <div style={{ display: 'flex', background: THEME.card, borderRadius: 12, padding: 4,
        marginBottom: 14, boxShadow: THEME.shadow, border: `2px solid ${THEME.line}` }}>
        {[{id:'slimes',label:`🟢 슬라임 ${state.slimes.length}`},{id:'eggs',label:`🥚 알 ${state.eggs.length}`}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, border: 'none', padding: '8px 0', borderRadius: 9,
            background: tab === t.id ? THEME.accent : 'transparent',
            color: tab === t.id ? '#fff' : THEME.inkSoft,
            fontFamily: FONT_DISP, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'slimes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.slimes.map(sl => {
            const s = SLIMES[sl.type];
            const multi = sl.stage === 'adult' ? 1.0 : sl.stage === 'elder' ? 0.6 : 0.4;
            return (
              <SoftCard key={sl.id} padding={10}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: s.color, borderRadius: 12, padding: 4,
                    border: `2px solid ${s.ring}` }}>
                    <SlimeBody type={sl.type} stage={sl.stage} size={40} bouncing={false} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_DISP, fontSize: 15, fontWeight: 700, color: THEME.ink }}>
                      {s.name}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                      <Chip bg={s.color} color="#fff" style={{ fontSize: 10, padding: '2px 8px' }}>
                        {STAGES[sl.stage].korean}
                      </Chip>
                      {sl.hunger > 70 && <Chip bg={THEME.danger} color="#fff" style={{ fontSize: 10, padding: '2px 8px' }}>😫 배고픔</Chip>}
                    </div>
                  </div>
                  <PopButton small bg={THEME.danger}>{Math.round(s.price * multi)}G</PopButton>
                </div>
              </SoftCard>
            );
          })}
        </div>
      )}

      {tab === 'eggs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {state.eggs.map(e => {
            const s = SLIMES[e.type];
            return (
              <SoftCard key={e.id} padding={10} style={{ textAlign: 'center',
                border: e.rare ? `2px solid ${THEME.gold}` : undefined }}>
                <div style={{ marginBottom: 4 }}>
                  <SlimeBody type={e.type} stage="egg" size={44} bouncing={false} />
                </div>
                <div style={{ fontFamily: FONT_DISP, fontSize: 11, fontWeight: 700, color: THEME.ink }}>
                  {s.name} 알
                </div>
                <div style={{ margin: '4px 0' }}><ProgressBar value={e.progress} color={s.ring} height={4} /></div>
                <div style={{ fontSize: 10, color: THEME.inkFaint, fontFamily: FONT_NUM }}>
                  {e.rare ? '✨ 희귀' : `${Math.ceil((1-e.progress)*5)}분`}
                </div>
                <PopButton small bg={THEME.danger} style={{ marginTop: 6, width: '100%', padding: '4px' }}>
                  {Math.round(s.price * (e.rare ? 1 : 0.5))}G
                </PopButton>
              </SoftCard>
            );
          })}
        </div>
      )}
    </ScreenShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// 도감
// ═══════════════════════════════════════════════════════════════
function CompendiumScreen({ state, onBack }) {
  const allTypes = Object.keys(SLIMES);
  const discovered = allTypes.filter(t => state.discovered[t]).length;
  return (
    <ScreenShell title="슬라임 도감" emoji="📖" onBack={onBack} tabActive="comp">
      <SoftCard style={{ marginBottom: 14, background: `linear-gradient(135deg, ${THEME.lavender} 0%, ${THEME.sky} 100%)`,
        color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 30 }}>🔍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISP, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>
              발견한 슬라임
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 26, fontWeight: 800 }}>
              {discovered} <span style={{ opacity: 0.7, fontSize: 18 }}>/ {allTypes.length}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <ProgressBar value={discovered / allTypes.length} color="#fff" bg="rgba(255,255,255,0.3)" height={6} />
        </div>
      </SoftCard>

      <div style={{ fontFamily: FONT_DISP, fontSize: 14, fontWeight: 700, color: THEME.inkSoft, marginBottom: 8 }}>
        기본 슬라임
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {['basic','grass','water','fire','ice','electric','dark','light'].map(type => (
          <CompendiumCard key={type} type={type} discovered={state.discovered[type]} />
        ))}
      </div>

      <div style={{ fontFamily: FONT_DISP, fontSize: 14, fontWeight: 700, color: THEME.inkSoft, marginBottom: 8 }}>
        🔒 히든 슬라임 (VIP룸 조합)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <CompendiumCard type="lava" discovered={state.discovered.lava} hint="🔥 + 🧊" hidden />
        <CompendiumCard type="storm" discovered={state.discovered.storm} hint="⚡ + 💧" hidden />
        <CompendiumCard type="???" discovered={false} hint="? + ?" hidden mystery />
      </div>
    </ScreenShell>
  );
}

function CompendiumCard({ type, discovered, hint, hidden = false, mystery = false }) {
  const s = SLIMES[type];
  return (
    <SoftCard padding={10} style={{ textAlign: 'center',
      border: hidden ? `2px dashed ${THEME.gold}` : undefined,
      opacity: discovered ? 1 : 0.9 }}>
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: discovered ? 'none' : 'brightness(0.1) opacity(0.6)' }}>
        {mystery ? (
          <div style={{ fontSize: 34, fontFamily: FONT_DISP, fontWeight: 800, color: THEME.inkFaint }}>?</div>
        ) : s ? (
          <SlimeBody type={type} stage="adult" size={40} bouncing={false} />
        ) : null}
      </div>
      <div style={{ fontFamily: FONT_DISP, fontSize: 11, fontWeight: 700,
        color: discovered ? THEME.ink : THEME.inkFaint, marginTop: 4 }}>
        {discovered ? (s?.name || '???') : '???'}
      </div>
      {hint && (
        <div style={{ fontSize: 9, color: THEME.inkFaint, fontFamily: FONT, marginTop: 2 }}>{hint}</div>
      )}
    </SoftCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// VIP룸
// ═══════════════════════════════════════════════════════════════
function VIPScreen({ state, setState, onBack }) {
  return (
    <ScreenShell title="VIP룸" emoji="👑" onBack={onBack} tabActive="vip">
      <SoftCard style={{ marginBottom: 14, background: `linear-gradient(135deg, ${THEME.gold} 0%, ${THEME.coin} 100%)`,
        color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 28 }}>✨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISP, fontSize: 16, fontWeight: 700 }}>히든 슬라임 연구소</div>
            <div style={{ fontSize: 12, opacity: 0.9, fontFamily: FONT }}>
              특정 조합을 찾으면 숨겨진 알이 생성돼요
            </div>
          </div>
        </div>
      </SoftCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.vipRooms.map(room => (
          <VIPRoomCard key={room.id} room={room} allSlimes={state.slimes}
            gold={state.gold}
            onUnlock={(cost) => {
              if (state.gold < cost) return;
              setState(s => ({ ...s, gold: s.gold - cost,
                vipRooms: s.vipRooms.map(r => r.id === room.id ? { ...r, unlocked: true } : r) }));
            }} />
        ))}
      </div>
    </ScreenShell>
  );
}

function VIPRoomCard({ room, allSlimes, gold, onUnlock }) {
  const unlockCost = room.id === 'vip_b' ? 8000 : room.id === 'vip_c' ? 20000 : 3000;
  const inside = allSlimes.filter(s => room.slimeIds.includes(s.id));
  const insideTypes = inside.map(s => s.type).sort().join('+');
  const recipeMatch = insideTypes === [...room.recipe].sort().join('+');

  return (
    <SoftCard padding={14} style={{ opacity: room.unlocked ? 1 : 0.7,
      border: recipeMatch ? `2.5px solid ${THEME.gold}` : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: FONT_DISP, fontSize: 17, fontWeight: 700, color: THEME.ink }}>
          👑 {room.name}
        </div>
        <Chip bg={THEME.cardAlt}>{room.capacity}마리</Chip>
        {!room.unlocked && <Chip bg={THEME.inkFaint} color="#fff">🔒</Chip>}
        <div style={{ flex: 1 }} />
        {recipeMatch && <Chip bg={THEME.gold} color="#fff">✨ 히든 조합!</Chip>}
      </div>

      {room.unlocked ? (
        <>
          {/* 슬롯 */}
          <div style={{ background: THEME.cardAlt, borderRadius: 14, padding: 14,
            display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
            border: `2px dashed ${recipeMatch ? THEME.gold : THEME.line}`, marginBottom: 10 }}>
            {inside.map(sl => (
              <div key={sl.id} style={{ background: SLIMES[sl.type].color, borderRadius: 12, padding: 6,
                border: `2px solid ${SLIMES[sl.type].ring}` }}>
                <SlimeBody type={sl.type} stage={sl.stage} size={42} />
              </div>
            ))}
            {Array.from({ length: room.capacity - inside.length }).map((_, i) => (
              <div key={i} style={{ width: 54, height: 54, border: `2px dashed ${THEME.inkFaint}`,
                borderRadius: 12, background: 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: THEME.inkFaint, fontSize: 22 }}>+</div>
            ))}
          </div>
          {/* 힌트 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: THEME.inkSoft, fontFamily: FONT }}>
            <span>💡 힌트:</span>
            <span style={{ fontSize: 16 }}>
              {room.recipe.map((t, i) => (
                <React.Fragment key={i}>
                  {i > 0 && ' + '}
                  {SLIMES[t]?.emoji || '?'}
                </React.Fragment>
              ))}
            </span>
            <span style={{ color: THEME.inkFaint }}>= ???</span>
          </div>
        </>
      ) : (
        <div style={{ padding: '14px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: THEME.inkSoft, fontFamily: FONT, marginBottom: 8 }}>
            해금 시 {room.capacity}마리 조합 가능
          </div>
          <PopButton bg={THEME.gold} small disabled={gold < unlockCost}
            onClick={() => onUnlock && onUnlock(unlockCost)}>
            🔓 {unlockCost.toLocaleString()}G 해금
          </PopButton>
        </div>
      )}
    </SoftCard>
  );
}

Object.assign(window, { ShopScreen, InventoryScreen, CompendiumScreen, VIPScreen });
