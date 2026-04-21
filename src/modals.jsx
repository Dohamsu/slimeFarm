// modals.jsx — 슬라임 상세 모달, 먹이 가방, 드래그 레이어

function SlimeDetailModal({ slime, foodInv, onClose, onFeed, onSell }) {
  const s = SLIMES[slime.type] || SLIMES.basic;
  const stage = STAGES[slime.stage];
  const multi = slime.stage === 'adult' ? 1.0 : slime.stage === 'elder' ? 0.6 : 0.4;
  const sellPrice = Math.round(s.price * multi);

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: THEME.card, borderRadius: '24px 24px 0 0',
        padding: '16px 16px 22px', boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
        animation: 'popIn .25s ease-out',
      }}>
        {/* 핸들 */}
        <div style={{ width: 40, height: 4, background: THEME.line, borderRadius: 999,
          margin: '0 auto 12px' }} />

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ background: s.color, borderRadius: 16, padding: 8,
            border: `2px solid ${s.ring}` }}>
            <SlimeBody type={slime.type} stage={slime.stage} size={60} bouncing={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISP, fontSize: 22, fontWeight: 700, color: THEME.ink }}>
              {s.name}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <Chip bg={s.color} color="#fff">{stage.korean}</Chip>
              <Chip bg={THEME.cardAlt}>💰 {sellPrice}G</Chip>
            </div>
          </div>
        </div>

        {/* 상태 바 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <StatRow label="🍖 배고픔" value={slime.hunger / 100} color={slime.hunger > 70 ? THEME.danger : THEME.gold} text={`${Math.round(slime.hunger)}%`} />
          <StatRow label="💖 행복도" value={slime.happiness / 100} color="#ec7aa8" text={`${Math.round(slime.happiness)}%`} />
          {slime.stage !== 'egg' && slime.stage !== 'elder' && (
            <StatRow label="🌱 성장" value={slime.growth} color={THEME.accent} text={`${Math.round(slime.growth * 100)}%`} />
          )}
          {slime.stage === 'adult' && (
            <StatRow label="🥚 알 생산" value={slime.eggReady} color={THEME.sky} text={slime.eggReady >= 1 ? '준비 완료' : `${Math.ceil((1-slime.eggReady)*10)}분`} />
          )}
        </div>

        {/* 먹이 가로 스크롤 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISP, fontSize: 14, fontWeight: 700, color: THEME.inkSoft, marginBottom: 6 }}>
            먹이 주기
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {FOODS.filter(f => f.unlocked).map(f => {
              const count = foodInv[f.id] || 0;
              const disabled = count <= 0;
              return (
                <button key={f.id} onClick={() => !disabled && onFeed(f.id)} disabled={disabled} style={{
                  border: `2px solid ${disabled ? THEME.line : SLIMES[f.produces]?.ring || THEME.accent}`,
                  background: disabled ? '#f5efdd' : '#fff',
                  borderRadius: 14, padding: '8px 6px', minWidth: 64,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}>
                  <div style={{ fontSize: 24 }}>{f.emoji}</div>
                  <div style={{ fontSize: 10, fontFamily: FONT_DISP, fontWeight: 700, color: THEME.ink }}>{f.name}</div>
                  <div style={{ fontSize: 10, fontFamily: FONT_NUM, fontWeight: 700, color: THEME.inkSoft }}>×{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 액션 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <PopButton bg={THEME.danger} onClick={onSell} style={{ flex: 1 }}>
            💰 판매 · {sellPrice}G
          </PopButton>
          <PopButton bg={THEME.gold} onClick={onClose} style={{ flex: 1 }}>
            👑 VIP룸 이동
          </PopButton>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color, text }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3,
        fontFamily: FONT_DISP, fontSize: 12, color: THEME.inkSoft }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ fontWeight: 700, fontFamily: FONT_NUM }}>{text}</span>
      </div>
      <ProgressBar value={value} color={color} height={8} />
    </div>
  );
}

function FoodBagModal({ foodInv, onClose, onDragStart }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: THEME.card, borderRadius: '24px 24px 0 0',
        padding: '16px 16px 22px', animation: 'popIn .25s ease-out',
      }}>
        <div style={{ width: 40, height: 4, background: THEME.line, borderRadius: 999, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 26 }}>🎒</div>
          <div style={{ fontFamily: FONT_DISP, fontSize: 20, fontWeight: 700, color: THEME.ink }}>먹이 가방</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: THEME.inkFaint, fontFamily: FONT }}>길게 눌러 드래그</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {FOODS.filter(f => f.unlocked).map(f => {
            const count = foodInv[f.id] || 0;
            return (
              <div key={f.id}
                onPointerDown={(e) => { if (count > 0) onDragStart(f.id, e.clientX, e.clientY); }}
                style={{
                  background: count > 0 ? '#fff' : '#f5efdd',
                  border: `2px solid ${count > 0 ? SLIMES[f.produces]?.ring || THEME.line : THEME.line}`,
                  borderRadius: 14, padding: '10px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  cursor: count > 0 ? 'grab' : 'not-allowed', opacity: count > 0 ? 1 : 0.5,
                  touchAction: 'none',
                }}>
                <div style={{ fontSize: 28 }}>{f.emoji}</div>
                <div style={{ fontSize: 10, fontFamily: FONT_DISP, fontWeight: 700, color: THEME.ink }}>{f.name}</div>
                <div style={{ fontSize: 11, fontFamily: FONT_NUM, fontWeight: 800, color: THEME.inkSoft }}>×{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DragFoodLayer({ foodId, initial, slimes, onDrop }) {
  const [pos, setPos] = React.useState({ x: initial.x, y: initial.y });
  const food = FOODS.find(f => f.id === foodId);
  React.useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onUp = (e) => {
      // 가장 가까운 슬라임 DOM 찾기
      const els = document.querySelectorAll('[data-slime-id]');
      let best = null, bestDist = 80;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (d < bestDist) { bestDist = d; best = el.dataset.slimeId; }
      });
      onDrop(best);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, []);
  return (
    <div style={{ position: 'fixed', left: pos.x - 24, top: pos.y - 24,
      fontSize: 40, pointerEvents: 'none', zIndex: 300,
      filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))' }}>
      {food.emoji}
    </div>
  );
}

Object.assign(window, { SlimeDetailModal, FoodBagModal, DragFoodLayer });
