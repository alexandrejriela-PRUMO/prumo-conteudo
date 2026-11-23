import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, FONT, clamp} from './brand';

// Fundo verde da marca com partículas douradas
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 70) * 12;
  const gy = 30 + Math.cos(frame / 90) * 6;
  const dots = new Array(44).fill(0).map((_, i) => {
    const x = random(`x${i}`) * 1080;
    const y0 = random(`y${i}`) * 1920;
    const speed = 0.4 + random(`s${i}`) * 0.9;
    const size = 3 + random(`r${i}`) * 5;
    const op = 0.1 + random(`o${i}`) * 0.3;
    const y = (((y0 - frame * speed) % 1920) + 1920) % 1920;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: '50%',
          background: C.gold,
          opacity: op,
          boxShadow: `0 0 ${size * 2}px ${C.gold}`,
        }}
      />
    );
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${gx}% ${gy}%, ${C.greenGlow} 0%, ${C.green} 42%, ${C.greenDeep} 100%)`,
      }}
    >
      {dots}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// Entrada e saída suaves de cada cena
export const SceneFade: React.FC<{dur: number; noIn?: boolean; children: React.ReactNode}> = ({dur, noIn, children}) => {
  const frame = useCurrentFrame();
  const inO = noIn ? 1 : interpolate(frame, [0, 8], [0, 1], clamp);
  const outO = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const outS = interpolate(frame, [dur - 10, dur], [1, 0.96], clamp);
  return (
    <AbsoluteFill style={{opacity: Math.min(inO, outO), transform: `scale(${outS})`}}>
      {children}
    </AbsoluteFill>
  );
};

// Legenda do topo (última linha em dourado)
export const Caption: React.FC<{lines: string[]; gold?: number; top?: number; size?: number; delay?: number}> = ({
  lines,
  gold,
  top = 290,
  size = 76,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = gold ?? lines.length - 1;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.16,
        letterSpacing: -1,
      }}
    >
      {lines.map((l, i) => {
        const s = spring({frame: frame - 2 - delay - i * 6, fps, config: {damping: 200}});
        return (
          <div
            key={i}
            style={{
              color: i === g ? C.gold : C.white,
              opacity: s,
              transform: `translateY(${(1 - s) * 34}px)`,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

// Painel com print real do PRUMO (entra com mola). Filhos ficam por cima, em %.
export const Panel: React.FC<{
  src: string;
  srcW: number;
  srcH: number;
  width: number;
  top: number;
  delay?: number;
  radius?: number;
  dim?: number;
  enter?: 'bottom' | 'right';
  exitAt?: number;
  rotate?: number;
  children?: React.ReactNode;
}> = ({src, srcW, srcH, width, top, delay = 0, radius = 22, dim = 1, enter = 'bottom', exitAt, rotate = 0, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 16, mass: 0.9}});
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 14], [0, 1], {...clamp});
  const h = (width * srcH) / srcW;
  const tx = (enter === 'right' ? (1 - s) * 1100 : 0) - out * 1150;
  const ty = enter === 'bottom' ? (1 - s) * 260 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - width) / 2,
        top,
        width,
        height: h,
        borderRadius: radius,
        overflow: 'visible',
        transform: `translate(${tx}px, ${ty}px) scale(${(0.94 + 0.06 * s) * dim}) rotate(${rotate * s}deg)`,
        opacity: Math.min(1, s * 1.4) * (1 - out * 0.3),
        filter: dim < 1 ? `brightness(${0.4 + 0.6 * dim})` : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 34px 80px rgba(0,0,0,0.5), 0 0 0 3px rgba(235,203,94,0.28)',
          background: '#fff',
        }}
      >
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', display: 'block'}} />
      </div>
      {children}
    </div>
  );
};

// Anel de destaque que pulsa (posição em % do painel)
export const Ring: React.FC<{
  l: number;
  t: number;
  w: number;
  h: number;
  start: number;
  color?: string;
  radius?: number;
}> = ({l, t, w, h, start, color = C.gold, radius = 16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - start, fps, config: {damping: 12, mass: 0.6}});
  const pulse = 0.75 + 0.25 * Math.sin((frame - start) / 4);
  if (frame < start) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${l}%`,
        top: `${t}%`,
        width: `${w}%`,
        height: `${h}%`,
        borderRadius: radius,
        border: `6px solid ${color}`,
        boxShadow: `0 0 28px ${color}, inset 0 0 18px ${color}55`,
        opacity: Math.min(1, s) * pulse,
        transform: `scale(${1.25 - 0.25 * s})`,
      }}
    />
  );
};

// Selo "Vencida" no estilo do sistema
export const VencidaBadge: React.FC<{size?: number}> = ({size = 64}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.28,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      color: '#B91C1C',
      background: '#FEF2F2',
      border: `${Math.round(size / 12)}px solid #DC2626`,
      borderRadius: size * 0.3,
      padding: `${size * 0.22}px ${size * 0.5}px`,
      boxShadow: '0 20px 50px rgba(220,38,38,0.45)',
    }}
  >
    <WarnIcon size={size * 0.9} color="#DC2626" />
    Vencida
  </div>
);

export const WarnIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path d="M12 9v5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="12" cy="17.3" r="1.3" fill={color} />
  </svg>
);

// Cartão final com logo e chamada
export const EndCard: React.FC<{lines: string[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logoS = spring({frame: frame - 2, fps, config: {damping: 14, mass: 0.8}});
  const tagS = spring({frame: frame - 12, fps, config: {damping: 200}});
  const ctaS = spring({frame: frame - 22, fps, config: {damping: 12, mass: 0.7}});
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, frame - 32) / 4);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <Img
        src={staticFile('logo-branco.svg')}
        style={{
          width: 280,
          transform: `scale(${0.7 + 0.3 * logoS})`,
          opacity: Math.min(1, logoS * 1.3),
          marginBottom: 64,
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 80,
          lineHeight: 1.16,
          color: C.white,
          textAlign: 'center',
          letterSpacing: -1,
          opacity: tagS,
          transform: `translateY(${(1 - tagS) * 30}px)`,
        }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{color: i === lines.length - 1 ? C.gold : C.white}}>
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 76,
          transform: `scale(${ctaS * pulse})`,
          opacity: Math.min(1, ctaS * 1.5),
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 50,
          color: C.white,
          background: `linear-gradient(90deg, ${C.orangeA}, ${C.orangeB})`,
          padding: '34px 70px',
          borderRadius: 999,
          boxShadow: '0 20px 50px rgba(249,115,22,0.45)',
          whiteSpace: 'nowrap',
        }}
      >
        Agende uma demonstração
      </div>
      <div
        style={{
          marginTop: 32,
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 38,
          color: 'rgba(255,255,255,0.8)',
          opacity: Math.min(1, ctaS),
        }}
      >
        hub.prumo.site
      </div>
    </AbsoluteFill>
  );
};
