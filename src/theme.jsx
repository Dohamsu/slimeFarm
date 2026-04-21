// theme.jsx — 디자인 시스템 (색상/타이포/기본 컴포넌트)

const THEME = {
  // 파스텔 크림 + 이끼 그린 톤. 동물의 숲 영감
  bg:       '#f7f1e3',   // 따뜻한 크림
  card:     '#ffffff',
  cardAlt:  '#fbf6ea',
  ink:      '#3d3427',   // 따뜻한 다크 브라운 (텍스트)
  inkSoft:  '#8b7d65',
  inkFaint: '#bfb29a',
  line:     '#e8dec7',
  accent:   '#6cc47a',   // 이끼 그린
  accentDk: '#4ea25d',
  gold:     '#e8b547',   // 골드/재화
  coin:     '#f5d158',
  danger:   '#e26850',
  sky:      '#8cc8e8',
  lavender: '#c5b0f0',
  // 농장 배경
  grass1:   '#a8d98a',
  grass2:   '#8ecf6e',
  grass3:   '#7bc058',
  // 하늘
  sky1:     '#cfe8f5',
  sky2:     '#b4dcee',
  // 기타
  shadow:   '0 2px 0 rgba(61,52,39,0.08), 0 6px 16px rgba(61,52,39,0.06)',
  pop:      '0 2px 0 rgba(61,52,39,0.12), 0 8px 24px rgba(61,52,39,0.12)',
};

const FONT = `'Gaegu', 'Nunito', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const FONT_DISP = `'Jua', 'Gaegu', 'Nunito', system-ui, sans-serif`;
const FONT_NUM = `'Nunito', -apple-system, system-ui, sans-serif`;

// Google Fonts inject (once)
if (typeof document !== 'undefined' && !document.getElementById('slime-fonts')) {
  const l = document.createElement('link');
  l.id = 'slime-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Jua&family=Nunito:wght@400;600;700;800&display=swap';
  document.head.appendChild(l);
}

// 공용 유틸 컴포넌트
function Chip({ children, bg = THEME.cardAlt, color = THEME.ink, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999, background: bg, color,
      fontSize: 13, fontWeight: 700, fontFamily: FONT_DISP,
      boxShadow: '0 1px 0 rgba(61,52,39,0.06)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function SoftCard({ children, style = {}, padding = 14 }) {
  return (
    <div style={{
      background: THEME.card, borderRadius: 18, padding,
      boxShadow: THEME.shadow, ...style,
    }}>{children}</div>
  );
}

function ProgressBar({ value = 0.5, color = THEME.accent, bg = '#eee4cc', height = 6, rounded = 999 }) {
  return (
    <div style={{ width: '100%', height, background: bg, borderRadius: rounded, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        height: '100%', background: color, borderRadius: rounded,
        transition: 'width .3s',
      }} />
    </div>
  );
}

function PopButton({ children, onClick, bg = THEME.accent, color = '#fff', disabled, style = {}, small = false }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      border: 'none', padding: small ? '8px 12px' : '12px 18px',
      borderRadius: small ? 12 : 14,
      background: disabled ? '#d9cfb8' : bg, color,
      fontFamily: FONT_DISP, fontSize: small ? 14 : 16, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : `0 3px 0 rgba(0,0,0,0.12)`,
      transition: 'transform .08s',
      ...style,
    }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(2px)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>
      {children}
    </button>
  );
}

// 슬라임 캐릭터 (SVG body)
function SlimeBody({ type = 'basic', stage = 'adult', size = 56, hungry = false, bouncing = true }) {
  const s = SLIMES[type] || SLIMES.basic;
  const scale = STAGES[stage]?.scale || 1;
  const w = size * scale;
  const h = w * 0.88;
  const isElder = stage === 'elder';
  const isEgg = stage === 'egg';

  if (isEgg) {
    return (
      <div style={{ position: 'relative', width: w * 0.7, height: h * 0.95, display: 'inline-block' }}>
        <svg viewBox="0 0 60 75" width="100%" height="100%">
          <ellipse cx="30" cy="40" rx="26" ry="32" fill={s.color}/>
          <ellipse cx="22" cy="28" rx="8" ry="12" fill="#fff" opacity="0.55"/>
          <path d="M 10 48 Q 14 40 20 46 Q 26 52 32 46 Q 38 40 44 46 Q 50 52 54 46"
            fill="none" stroke={s.ring} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative', width: w, height: h, display: 'inline-block',
      animation: bouncing ? 'slimeBounce 1.8s ease-in-out infinite' : 'none',
    }}>
      <svg viewBox="0 0 100 88" width="100%" height="100%">
        {/* body */}
        <path d="M 50 8 C 78 8 92 36 92 60 C 92 76 78 84 50 84 C 22 84 8 76 8 60 C 8 36 22 8 50 8 Z"
          fill={s.color} stroke={s.ring} strokeWidth="3"/>
        {/* shine */}
        <ellipse cx="32" cy="28" rx="12" ry="16" fill="#fff" opacity="0.55"/>
        <ellipse cx="28" cy="22" rx="4" ry="5" fill="#fff" opacity="0.9"/>
        {/* eyes */}
        <circle cx="38" cy="48" r="4" fill="#2a2116"/>
        <circle cx="62" cy="48" r="4" fill="#2a2116"/>
        <circle cx="39" cy="47" r="1.2" fill="#fff"/>
        <circle cx="63" cy="47" r="1.2" fill="#fff"/>
        {/* mouth */}
        {hungry ? (
          <path d="M 44 62 Q 50 68 56 62" fill="none" stroke="#2a2116" strokeWidth="2.2" strokeLinecap="round"/>
        ) : (
          <path d="M 44 60 Q 50 66 56 60" fill="none" stroke="#2a2116" strokeWidth="2.2" strokeLinecap="round"/>
        )}
        {/* cheek */}
        <circle cx="32" cy="58" r="3" fill="#ff9fb3" opacity="0.6"/>
        <circle cx="68" cy="58" r="3" fill="#ff9fb3" opacity="0.6"/>
        {/* elder beard */}
        {isElder && (
          <g>
            <path d="M 42 68 Q 50 78 58 68" fill="#fff" stroke="#b8a892" strokeWidth="1.5"/>
            <path d="M 46 72 L 48 80 M 50 73 L 50 82 M 54 72 L 52 80" stroke="#b8a892" strokeWidth="1.2" strokeLinecap="round"/>
          </g>
        )}
      </svg>
      {hungry && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>😫</div>
      )}
    </div>
  );
}

// Global animation CSS
if (typeof document !== 'undefined' && !document.getElementById('slime-anim')) {
  const st = document.createElement('style');
  st.id = 'slime-anim';
  st.textContent = `
    @keyframes slimeBounce {
      0%, 100% { transform: translateY(0) scaleY(1); }
      45%      { transform: translateY(-4px) scaleY(1.04); }
      50%      { transform: translateY(-5px) scaleY(0.96); }
      55%      { transform: translateY(-4px) scaleY(1.04); }
    }
    @keyframes slimeWander {
      0%   { transform: translate(0,0); }
      50%  { transform: translate(20px, -8px); }
      100% { transform: translate(0,0); }
    }
    @keyframes eggWiggle {
      0%, 100% { transform: rotate(-2deg); }
      50%      { transform: rotate(2deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.5; }
    }
    @keyframes popIn {
      0%   { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes floatUp {
      0%   { transform: translateY(0);   opacity: 0; }
      20%  { opacity: 1; }
      100% { transform: translateY(-24px); opacity: 0; }
    }
    body { margin: 0; background: #2a251f; font-family: ${FONT}; }
    * { -webkit-font-smoothing: antialiased; }
  `;
  document.head.appendChild(st);
}

Object.assign(window, { THEME, FONT, FONT_DISP, FONT_NUM, Chip, SoftCard, ProgressBar, PopButton, SlimeBody });
