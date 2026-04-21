// main.jsx — 단일 앱 진입점 (DesignCanvas 없이 바로 마운트)

function SlimeGameApp({ initialScreen = 'farm' }) {
  const [screen, setScreen] = React.useState(initialScreen);
  const [state, setState] = React.useState(() => {
    try {
      const saved = localStorage.getItem('slime-game-demo');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(SAMPLE_STATE));
  });

  React.useEffect(() => {
    try { localStorage.setItem('slime-game-demo', JSON.stringify(state)); } catch (e) {}
  }, [state]);

  // 게임 틱: 배고픔 증가 + 알 부화 진행 + 어른 슬라임 알 생산 준비
  React.useEffect(() => {
    const t = setInterval(() => {
      setState(s => ({
        ...s,
        slimes: s.slimes.map(sl => ({
          ...sl,
          hunger: Math.min(100, sl.hunger + 0.3),
          eggReady: sl.stage === 'adult' ? Math.min(1, (sl.eggReady || 0) + 0.008) : sl.eggReady,
        })),
        eggs: s.eggs.map(e => ({ ...e, progress: Math.min(1, e.progress + 0.003) })),
      }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const nav = (to) => setScreen(to);
  const back = (to) => setScreen(to || 'farm');

  switch (screen) {
    case 'farm':
      return <FarmScreen state={state} setState={setState}
        onOpenShop={() => nav('shop')} onOpenInv={() => nav('inv')}
        onOpenCompendium={() => nav('comp')} onOpenVIP={() => nav('vip')} />;
    case 'shop':
      return <ShopScreen state={state} setState={setState} onBack={back} />;
    case 'inv':
      return <InventoryScreen state={state} setState={setState} onBack={back} />;
    case 'comp':
      return <CompendiumScreen state={state} onBack={back} />;
    case 'vip':
      return <VIPScreen state={state} setState={setState} onBack={back} />;
    default:
      return null;
  }
}

// iOS 스타일 모바일 프레임 (데스크톱에서만 프레임, 모바일은 풀스크린)
function PhoneFrame({ children }) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth <= 500
  );
  React.useEffect(() => {
    const on = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  if (isMobile) {
    // 모바일: 풀스크린
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative',
        background: '#f7f1e3', overflow: 'hidden' }}>
        {children}
      </div>
    );
  }

  // 데스크톱: 아이폰 프레임
  return (
    <div style={{ width: 380, height: 780, position: 'relative', background: '#000',
      borderRadius: 44, overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.15)' }}>
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 112, height: 32, borderRadius: 20, background: '#000', zIndex: 100 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', fontFamily: '-apple-system, system-ui',
        fontSize: 15, fontWeight: 600, color: '#000', zIndex: 50 }}>
        <span>9:41</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <span>📶</span><span>🔋</span>
        </span>
      </div>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 44, background: '#f7f1e3' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 130, height: 4, borderRadius: 100, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PhoneFrame>
    <SlimeGameApp initialScreen="farm" />
  </PhoneFrame>
);
