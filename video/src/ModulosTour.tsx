import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, FONT, clamp} from './brand';
import {Background, Caption, EndCard, Ring, SceneFade, WarnIcon} from './shared';

// Cores de interface (estilo do app)
const U = {
  ink: '#0F172A',
  sub: '#64748B',
  line: '#E2E8F0',
  bg: '#F8FAFC',
  green: '#059669',
  greenSoft: '#D1FAE5',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  amber: '#D97706',
  amberSoft: '#FEF3C7',
  blue: '#2563EB',
  blueSoft: '#DBEAFE',
};

const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};

const ICONS: Record<string, string> = {
  check: 'M5 12l4 4L19 6',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  scale: 'M12 3v18 M5 21h14 M3 7h18 M6 7l-3 7a3 3 0 0 0 6 0z M18 7l-3 7a3 3 0 0 0 6 0z',
  map: 'M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z M9 3v15 M15 6v15',
  sat: 'M13 7l4 4 M16 3l5 5-4 4-5-5z M8 13l3 3 M4 20l4-4 M7 11l6 6 M3 14c0 4 3 7 7 7',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6',
  cal: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  down: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  chart: 'M3 3v18h18 M7 16v-4 M12 16V8 M17 16v-7',
  gauge: 'M12 14l4-4 M3.34 19a10 10 0 1 1 17.32 0',
  pen: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  pin: 'M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z',
  sprout: 'M7 20h10 M10 20c5.5-2.5.8-6.4 3-10 M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
};

const Icon: React.FC<{n: string; size?: number; color?: string; sw?: number}> = ({n, size = 28, color = U.ink, sw = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[n]} />
  </svg>
);

const pop = (frame: number, fps: number, at: number, damping = 12) =>
  spring({frame: frame - at, fps, config: {damping, mass: 0.6}});

// Faixa de notificação (toast)
const Toast: React.FC<{at: number; icon: string; color: string; soft: string; title: string; sub?: string; top: number; left?: number; width?: number}> = ({
  at, icon, color, soft, title, sub, top, left = 40, width = 860,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps, at, 14);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute', left, top, width, boxSizing: 'border-box', padding: '20px 26px', borderRadius: 20,
        background: '#FFFFFF', border: `2px solid ${color}`, boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
        display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.5),
      }}
    >
      <div style={{width: 56, height: 56, borderRadius: 16, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <Icon n={icon} size={32} color={color} />
      </div>
      <div>
        <div style={{fontWeight: 700, fontSize: 28, color: U.ink}}>{title}</div>
        {sub ? <div style={{fontWeight: 500, fontSize: 22, color: U.sub, marginTop: 2}}>{sub}</div> : null}
      </div>
    </div>
  );
};

const Chip: React.FC<{label: string; color: string; soft: string; size?: number}> = ({label, color, soft, size = 22}) => (
  <span style={{display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: soft, color, fontWeight: 700, fontSize: size, fontFamily: FONT, whiteSpace: 'nowrap'}}>
    {label}
  </span>
);

// Cena padrão de módulo: legenda + caminho do menu + janela do app
const ModuleScene: React.FC<{cap: string[]; crumb: string; icon: string; title: string; h?: number; children: React.ReactNode}> = ({
  cap, crumb, icon, title, h = 760, children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 3, fps, config: {damping: 16, mass: 0.9}});
  const cs = spring({frame: frame - 8, fps, config: {damping: 200}});
  return (
    <AbsoluteFill>
      <Caption lines={cap} size={74} />
      <div style={{position: 'absolute', top: 478, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.gold, opacity: cs, textTransform: 'uppercase'}}>
        {crumb}
      </div>
      <div
        style={{
          position: 'absolute', left: 70, top: 530, width: 940, height: h, borderRadius: 30, background: '#FFFFFF', overflow: 'hidden',
          boxShadow: '0 40px 90px rgba(0,0,0,0.5), 0 0 0 3px rgba(235,203,94,0.28)',
          transform: `translateY(${(1 - s) * 260}px) scale(${0.94 + 0.06 * s})`, opacity: Math.min(1, s * 1.4),
        }}
      >
        <div style={{height: 88, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px', borderBottom: `2px solid ${U.line}`, fontFamily: FONT}}>
          <div style={{width: 52, height: 52, borderRadius: 14, background: U.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon n={icon} size={30} color={U.green} />
          </div>
          <div style={{fontWeight: 700, fontSize: 34, color: U.ink}}>{title}</div>
        </div>
        <div style={{position: 'relative', width: 940, height: h - 90, background: U.bg}}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// GANCHO — abas espalhadas que viram um lugar só
// ---------------------------------------------------------------------------
const WINS = [
  {t: 'Planilha de prazos.xlsx', c: '#16A34A'}, {t: 'WhatsApp (47)', c: '#22C55E'}, {t: 'SICAR', c: '#2563EB'},
  {t: 'Diário Oficial', c: '#64748B'}, {t: 'E-mail (128)', c: '#3B82F6'}, {t: 'Agenda', c: '#F59E0B'},
  {t: 'Contrato_final_v3.docx', c: '#1D4ED8'}, {t: 'Banco', c: '#EA580C'}, {t: 'Pasta do cliente', c: '#D97706'},
  {t: 'Laudo técnico.pdf', c: '#DC2626'}, {t: 'Mapa.kml', c: '#0D9488'}, {t: 'Boletos a receber', c: '#7C3AED'},
];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const collapse = interpolate(frame, [64, 82], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const qOut = interpolate(frame, [66, 76], [1, 0], clamp);
  const qIn = interpolate(frame, [0, 10], [1.06, 1], clamp);
  const logo = spring({frame: frame - 82, fps, config: {damping: 12, mass: 0.7}});
  const tag = spring({frame: frame - 92, fps, config: {damping: 200}});
  return (
    <AbsoluteFill>
      {WINS.map((w, i) => {
        const s = pop(frame, fps, 4 + i * 4, 11);
        const x0 = 30 + random(`wx${i}`) * 690;
        const y0 = 500 + random(`wy${i}`) * 950;
        const r = (random(`wr${i}`) - 0.5) * 14;
        const x = x0 + (375 - x0) * collapse;
        const y = y0 + (860 - y0) * collapse;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: 330, height: 190, borderRadius: 16, background: '#FFFFFF', overflow: 'hidden',
              boxShadow: '0 20px 44px rgba(0,0,0,0.45)', fontFamily: FONT,
              transform: `rotate(${r * (1 - collapse)}deg) scale(${s * (1 - 0.85 * collapse)})`,
              opacity: frame < 4 + i * 4 ? 0 : Math.min(1, s * 1.5) * (1 - collapse),
            }}
          >
            <div style={{height: 44, background: w.c, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px'}}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block'}} />
              ))}
              <span style={{marginLeft: 8, color: '#fff', fontWeight: 700, fontSize: 21, whiteSpace: 'nowrap'}}>{w.t}</span>
            </div>
            <div style={{padding: '18px 18px'}}>
              {[0.9, 0.7, 0.8, 0.5].map((wd, k) => (
                <div key={k} style={{height: 14, width: `${wd * 100}%`, background: '#E2E8F0', borderRadius: 7, marginBottom: 12}} />
              ))}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 250, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 78, lineHeight: 1.16, letterSpacing: -1, opacity: qOut, transform: `scale(${qIn})`}}>
        <div style={{color: C.white}}>Quantas abas você</div>
        <div style={{color: C.gold}}>abre pra trabalhar?</div>
      </div>
      {frame >= 82 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <Img src={staticFile('logo-branco.svg')} style={{width: 300, transform: `scale(${0.4 + 0.6 * logo})`, opacity: Math.min(1, logo * 1.4)}} />
          <div style={{marginTop: 60, fontFamily: FONT, fontWeight: 700, fontSize: 84, color: C.white, textAlign: 'center', lineHeight: 1.15, opacity: tag, transform: `translateY(${(1 - tag) * 30}px)`}}>
            Tudo num
            <br />
            <span style={{color: C.gold}}>lugar só.</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CRM — funil de clientes
// ---------------------------------------------------------------------------
const CRM: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cols = [
    {t: 'Contato', c: U.blue, soft: U.blueSoft},
    {t: 'Proposta', c: U.amber, soft: U.amberSoft},
    {t: 'Fechado', c: U.green, soft: U.greenSoft},
  ];
  const cards = [
    {col: 0, row: 0, name: 'Sítio Esperança', sub: 'CAR + PRAD'},
    {col: 0, row: 1, name: 'Granja Três Irmãos', sub: 'Licença de Operação'},
    {col: 1, row: 0, name: 'Fazenda Boa Vista', sub: 'Georreferenciamento', move: true},
    {col: 1, row: 1, name: 'Agropecuária Sul', sub: 'Outorga de água'},
    {col: 2, row: 0, name: 'Fazenda Santa Clara', sub: 'Inventário florestal'},
  ];
  const mv = interpolate(frame, [46, 64], [0, 1], ease);
  const lift = Math.sin(Math.PI * mv);
  const cnt = [2, mv > 0.5 ? 1 : 2, mv > 0.5 ? 2 : 1];
  return (
    <>
      {cols.map((c, i) => (
        <div key={c.t} style={{position: 'absolute', left: 28 + i * 300, top: 26, width: 284, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
          <Chip label={c.t} color={c.c} soft={c.soft} size={24} />
          <span style={{fontWeight: 700, fontSize: 24, color: U.sub}}>{cnt[i]}</span>
        </div>
      ))}
      {cards.map((k, i) => {
        const s = pop(frame, fps, 8 + i * 5);
        let x = 28 + k.col * 300;
        let y = 86 + k.row * 150;
        if (k.move) {
          x = x + 300 * mv;
          y = y + 150 * mv;
        }
        const done = k.move && mv > 0.98;
        return (
          <div
            key={k.name}
            style={{
              position: 'absolute', left: x, top: y, width: 284, height: 130, boxSizing: 'border-box', padding: '18px 20px', borderRadius: 18,
              background: '#FFFFFF', border: `2px solid ${done ? U.green : U.line}`, fontFamily: FONT,
              boxShadow: `0 ${8 + lift * 24}px ${18 + lift * 30}px rgba(15,23,42,${0.08 + lift * 0.18})`,
              transform: `scale(${s * (1 + lift * 0.06)}) rotate(${lift * -3}deg)`, opacity: Math.min(1, s * 1.5), zIndex: k.move ? 5 : 1,
            }}
          >
            <div style={{fontWeight: 700, fontSize: 25, color: U.ink, whiteSpace: 'nowrap'}}>{k.name}</div>
            <div style={{fontWeight: 500, fontSize: 21, color: U.sub, marginTop: 4}}>{k.sub}</div>
            {done ? (
              <div style={{position: 'absolute', right: 14, top: 14, width: 36, height: 36, borderRadius: '50%', background: U.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon n="check" size={24} color="#fff" sw={3} />
              </div>
            ) : null}
          </div>
        );
      })}
      <Toast at={70} icon="cal" color={U.amber} soft={U.amberSoft} title="Follow-up agendado" sub="Amanhã, 09:00 · Fazenda Boa Vista" top={470} />
    </>
  );
};

// ---------------------------------------------------------------------------
// CONTRATOS — documento, assinatura e orçamento
// ---------------------------------------------------------------------------
const Contrato: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sig = interpolate(frame, [48, 70], [1, 0], clamp);
  const stamp = pop(frame, fps, 72, 10);
  const lines = [0.92, 0.85, 0.9, 0.7, 0.88, 0.6];
  const fields = ['Contratante: Fazenda Boa Vista', 'Serviço: Licenciamento + CAR', 'Valor: R$ 4.800,00'];
  const quote = pop(frame, fps, 28);
  return (
    <>
      <div style={{position: 'absolute', left: 30, top: 26, width: 560, height: 620, background: '#fff', borderRadius: 18, border: `2px solid ${U.line}`, boxShadow: '0 10px 30px rgba(15,23,42,0.08)', fontFamily: FONT, padding: '30px 34px', boxSizing: 'border-box'}}>
        <div style={{fontWeight: 700, fontSize: 23, color: U.ink, letterSpacing: 0.5}}>CONTRATO DE PRESTAÇÃO</div>
        <div style={{fontWeight: 700, fontSize: 23, color: U.ink, letterSpacing: 0.5}}>DE SERVIÇOS AMBIENTAIS</div>
        <div style={{marginTop: 18}}>
          {fields.map((f, i) => {
            const n = Math.round(interpolate(frame, [8 + i * 10, 18 + i * 10], [0, f.length], clamp));
            return (
              <div key={i} style={{fontWeight: 500, fontSize: 22, color: U.ink, marginBottom: 8, whiteSpace: 'nowrap', background: n > 0 ? U.greenSoft : 'transparent', borderRadius: 8, padding: '2px 8px', display: 'inline-block'}}>
                {f.slice(0, n)}
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 14}}>
          {lines.map((w, i) => (
            <div key={i} style={{height: 12, borderRadius: 6, background: U.line, marginBottom: 12, width: `${w * interpolate(frame, [30 + i * 3, 42 + i * 3], [0, 100], clamp)}%`}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 34, right: 34, bottom: 40}}>
          <svg width="300" height="80" viewBox="0 0 300 80" style={{display: 'block'}}>
            <path d="M10 55 C 30 10, 55 12, 62 44 S 92 70, 112 36 S 150 6, 168 42 S 206 66, 226 30 S 262 18, 290 40" fill="none" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" strokeDasharray="420" strokeDashoffset={420 * sig} />
          </svg>
          <div style={{borderTop: `2px solid ${U.ink}`, width: 320, paddingTop: 6, fontWeight: 500, fontSize: 18, color: U.sub}}>Assinatura do contratante</div>
        </div>
        {frame >= 72 ? (
          <div style={{position: 'absolute', right: 30, bottom: 70, transform: `rotate(-8deg) scale(${1.8 - 0.8 * stamp})`, opacity: Math.min(1, stamp * 1.5)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: `4px solid ${U.green}`, color: U.green, fontWeight: 700, fontSize: 22, background: 'rgba(209,250,229,0.9)'}}>
              <Icon n="check" size={24} color={U.green} sw={3} />
              Assinado digitalmente
            </div>
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 612, top: 26, width: 300, background: '#fff', borderRadius: 18, border: `2px solid ${U.line}`, padding: '24px 22px', boxSizing: 'border-box', fontFamily: FONT, transform: `scale(${quote})`, opacity: Math.min(1, quote * 1.5), transformOrigin: 'top center'}}>
        <div style={{fontWeight: 700, fontSize: 24, color: U.ink}}>Orçamento #0241</div>
        <div style={{fontWeight: 500, fontSize: 20, color: U.sub, marginTop: 6}}>Licenciamento + CAR</div>
        <div style={{height: 2, background: U.line, margin: '16px 0'}} />
        <div style={{fontWeight: 500, fontSize: 20, color: U.sub}}>Total</div>
        <div style={{fontWeight: 700, fontSize: 34, color: U.ink}}>R$ 4.800,00</div>
        <div style={{marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, background: frame >= 40 ? U.green : U.line, color: '#fff', fontWeight: 700, fontSize: 22}}>
          {frame >= 40 ? <Icon n="check" size={22} color="#fff" sw={3} /> : null}
          {frame >= 40 ? 'Enviado' : 'Enviar'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 612, top: 372, width: 300, fontFamily: FONT, opacity: interpolate(frame, [52, 60], [0, 1], clamp)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 22, color: U.green}}>
          <Icon n="pen" size={26} color={U.green} />
          Assinatura digital
        </div>
        <div style={{fontWeight: 500, fontSize: 19, color: U.sub, marginTop: 6, lineHeight: 1.35}}>O cliente assina pelo celular, sem imprimir nada.</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// FINANCEIRO — receitas e cobranças
// ---------------------------------------------------------------------------
const Financeiro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = Math.round(interpolate(frame, [6, 40], [0, 38450], {...clamp, easing: Easing.out(Easing.cubic)}));
  const money = `R$ ${v.toLocaleString('pt-BR')}`;
  const bars = [0.42, 0.55, 0.5, 0.68, 0.8, 1];
  const months = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  const up = pop(frame, fps, 40);
  return (
    <>
      <div style={{position: 'absolute', left: 40, top: 30, fontFamily: FONT}}>
        <div style={{fontWeight: 500, fontSize: 24, color: U.sub}}>Receitas do mês</div>
        <div style={{fontWeight: 700, fontSize: 64, color: U.ink, letterSpacing: -1}}>{money}</div>
      </div>
      <div style={{position: 'absolute', right: 40, top: 60, transform: `scale(${up})`, opacity: Math.min(1, up * 1.5)}}>
        <Chip label="+18% no mês" color={U.green} soft={U.greenSoft} size={24} />
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 170, height: 250, display: 'flex', alignItems: 'flex-end', gap: 26}}>
        {bars.map((b, i) => {
          const g = interpolate(frame, [8 + i * 4, 30 + i * 4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
              <div style={{width: '100%', height: `${b * 88 * g}%`, borderRadius: '12px 12px 4px 4px', background: i === bars.length - 1 ? C.gold : U.green}} />
              <div style={{marginTop: 8, fontFamily: FONT, fontWeight: 500, fontSize: 20, color: U.sub}}>{months[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 40, top: 470, display: 'flex', gap: 16}}>
        {['Pix', 'Boleto', 'Cartão'].map((p, i) => {
          const s = pop(frame, fps, 46 + i * 6);
          return (
            <div key={p} style={{transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
              <span style={{display: 'inline-block', padding: '8px 22px', borderRadius: 999, background: '#FFFFFF', border: `2px solid ${U.line}`, color: U.ink, fontWeight: 700, fontSize: 26, fontFamily: FONT, boxShadow: '0 6px 14px rgba(15,23,42,0.08)'}}>{p}</span>
            </div>
          );
        })}
      </div>
      <Toast at={70} icon="check" color={U.green} soft={U.greenSoft} title="Pagamento recebido via Pix" sub="R$ 1.200,00 · Fazenda Santa Clara" top={540} />
    </>
  );
};

// ---------------------------------------------------------------------------
// MAPA — CAR, APP e Reserva Legal
// ---------------------------------------------------------------------------
const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [6, 34], [1, 0], ease);
  const fill = interpolate(frame, [32, 42], [0, 1], clamp);
  const area = interpolate(frame, [34, 54], [0, 152.4], {...clamp, easing: Easing.out(Easing.cubic)});
  const layers = [
    {t: 'CAR', c: C.gold, at: 38},
    {t: 'APP', c: '#3B82F6', at: 52},
    {t: 'Reserva Legal', c: '#16A34A', at: 66},
    {t: 'Uso consolidado', c: '#F59E0B', at: 80},
  ];
  const on = (i: number) => interpolate(frame, [layers[i].at, layers[i].at + 8], [0, 1], clamp);
  const poly = 'M120 110 L470 80 L560 300 L430 520 L170 480 L90 300 Z';
  const kml = pop(frame, fps, 86);
  return (
    <>
      <div style={{position: 'absolute', left: 24, top: 24, width: 620, height: 620, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,23,42,0.15)'}}>
        <svg width="620" height="620" viewBox="0 0 620 620">
          <defs>
            <pattern id="rl" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="rgba(22,163,74,0.35)" />
              <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(20,83,45,0.8)" strokeWidth="4" />
            </pattern>
          </defs>
          <rect width="620" height="620" fill="#4B7A34" />
          <path d="M0 0 L300 0 L260 210 L0 250 Z" fill="#5C8C3C" />
          <path d="M300 0 L620 0 L620 230 L330 260 Z" fill="#6E9A41" />
          <path d="M0 250 L260 210 L240 620 L0 620 Z" fill="#557F35" />
          <path d="M330 260 L620 230 L620 620 L360 620 Z" fill="#7FA24A" />
          <path d="M0 400 L620 340" stroke="#C9B28A" strokeWidth="10" />
          <path d="M-20 150 C 120 190, 200 90, 320 180 S 520 290, 660 230" fill="none" stroke="rgba(59,130,246,0.30)" strokeWidth={70} opacity={on(1)} />
          <path d="M-20 150 C 120 190, 200 90, 320 180 S 520 290, 660 230" fill="none" stroke="#2F6FB5" strokeWidth="14" />
          <path d="M380 330 L520 300 L470 470 L360 450 Z" fill="url(#rl)" opacity={on(2)} />
          <path d="M150 330 L300 300 L330 440 L180 460 Z" fill="rgba(245,158,11,0.45)" opacity={on(3)} />
          <path d={poly} fill={`rgba(235,203,94,${0.16 * fill})`} stroke={C.gold} strokeWidth="6" strokeLinejoin="round" strokeDasharray="1700" strokeDashoffset={1700 * draw} />
          {frame >= 34 ? (
            <g>
              <rect x="220" y="265" width="190" height="56" rx="28" fill="rgba(15,23,42,0.85)" />
              <text x="315" y="302" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="28" fill="#fff">{`${area.toFixed(1).replace('.', ',')} ha`}</text>
            </g>
          ) : null}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 664, top: 24, width: 252, fontFamily: FONT}}>
        <div style={{fontWeight: 700, fontSize: 26, color: U.ink, marginBottom: 14}}>Camadas</div>
        {layers.map((l, i) => {
          const o = on(i);
          return (
            <div key={l.t} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', marginBottom: 12, borderRadius: 14, background: '#fff', border: `2px solid ${o > 0.5 ? l.c : U.line}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{width: 16, height: 16, borderRadius: 4, background: l.c, display: 'inline-block'}} />
                <span style={{fontWeight: 700, fontSize: 19, color: U.ink, whiteSpace: 'nowrap'}}>{l.t}</span>
              </div>
              <div style={{width: 44, height: 24, borderRadius: 12, background: o > 0.5 ? l.c : '#CBD5E1', position: 'relative'}}>
                <div style={{position: 'absolute', top: 3, left: 3 + 20 * o, width: 18, height: 18, borderRadius: '50%', background: '#fff'}} />
              </div>
            </div>
          );
        })}
        <div style={{marginTop: 18, padding: '14px 0', textAlign: 'center', borderRadius: 14, border: `2px dashed ${U.green}`, color: U.green, fontWeight: 700, fontSize: 20, transform: `scale(${kml})`, opacity: Math.min(1, kml * 1.5)}}>
          Importar KML/KMZ
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// GEORREFERENCIAMENTO — do campo ao SIGEF
// ---------------------------------------------------------------------------
const Geo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pts = [[80, 90], [250, 52], [350, 118], [362, 250], [312, 360], [176, 384], [62, 300], [44, 180]];
  const edge = interpolate(frame, [6, 42], [0, 1], clamp);
  const path = 'M' + pts.map((p) => p.join(' ')).join(' L') + ' Z';
  const steps = ['Levantamento de campo (GNSS)', 'Processamento dos vértices', 'Memorial descritivo e planta', 'Envio ao SIGEF / INCRA', 'Parcela certificada'];
  const stepAt = [28, 38, 48, 58, 70];
  const cert = pop(frame, fps, 76, 11);
  return (
    <>
      <div style={{position: 'absolute', left: 24, top: 24, width: 420, height: 450, borderRadius: 18, background: '#0F2A1D', overflow: 'hidden'}}>
        <svg width="420" height="450" viewBox="0 0 420 450">
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <g key={k}>
              <line x1={k * 70} y1="0" x2={k * 70} y2="450" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
              <line x1="0" y1={k * 70} x2="420" y2={k * 70} stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
            </g>
          ))}
          <path d={path} fill={`rgba(235,203,94,${0.14 * edge})`} stroke={C.gold} strokeWidth="4" strokeLinejoin="round" strokeDasharray="1300" strokeDashoffset={1300 * (1 - edge)} />
          {pts.map(([x, y], i) => {
            const sc = pop(frame, fps, 6 + i * 4, 12);
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
                <circle r="11" fill="#FFFFFF" stroke={C.gold} strokeWidth="4" />
                <text x="15" y="-12" fill="#FFFFFF" fontSize="19" fontFamily={FONT} fontWeight={700}>{`V${i + 1}`}</text>
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 16, bottom: 14, display: 'flex', gap: 8, opacity: interpolate(frame, [40, 48], [0, 1], clamp)}}>
          <Chip label="SIRGAS 2000" color="#0B3B2A" soft={C.gold} size={18} />
          <Chip label="8 vértices" color="#FFFFFF" soft="rgba(255,255,255,0.18)" size={18} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 466, top: 24, width: 450, fontFamily: FONT}}>
        {steps.map((t, i) => {
          const done = frame >= stepAt[i];
          const s = pop(frame, fps, stepAt[i], 12);
          const last = i === steps.length - 1;
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, height: 84, padding: '0 16px', marginBottom: 7, borderRadius: 16, background: '#fff', border: `2px solid ${done ? (last ? U.green : '#A7F3D0') : U.line}`}}>
              <div style={{width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: done ? U.green : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? 0.7 + 0.3 * s : 1})`}}>
                {done ? <Icon n="check" size={24} color="#fff" sw={3} /> : <span style={{fontWeight: 700, fontSize: 18, color: U.sub}}>{i + 1}</span>}
              </div>
              <div style={{fontWeight: 700, fontSize: 21, color: done ? U.ink : U.sub, lineHeight: 1.2}}>{t}</div>
            </div>
          );
        })}
      </div>
      {frame >= 76 ? (
        <div style={{position: 'absolute', left: 24, right: 24, top: 500, height: 146, borderRadius: 20, background: '#0B3B2A', display: 'flex', alignItems: 'center', gap: 20, padding: '0 28px', boxSizing: 'border-box', fontFamily: FONT, transform: `scale(${0.85 + 0.15 * cert})`, opacity: Math.min(1, cert * 1.5)}}>
          <div style={{width: 74, height: 74, borderRadius: '50%', background: U.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon n="check" size={44} color="#fff" sw={3} />
          </div>
          <div>
            <div style={{fontWeight: 700, fontSize: 32, color: '#fff'}}>Parcela certificada no SIGEF</div>
            <div style={{fontWeight: 500, fontSize: 21, color: 'rgba(255,255,255,0.8)', marginTop: 4}}>Memorial, planta e ART guardados no PRUMO</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------------------
// SATÉLITE + TERMÔMETRO DE REGULARIDADE
// ---------------------------------------------------------------------------
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const Termometro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = pop(frame, fps, 6, 14);
  const g = interpolate(frame, [36, 80], [0, 1], ease);
  const pct = Math.round(38 + (86 - 38) * g);
  const ang = 180 + (pct / 100) * 180;
  const nx = 470 + 190 * Math.cos((ang * Math.PI) / 180);
  const ny = 560 + 190 * Math.sin((ang * Math.PI) / 180);
  const ok = pop(frame, fps, 82);
  const col = pct < 50 ? U.red : pct < 75 ? U.amber : U.green;
  return (
    <>
      <div style={{position: 'absolute', left: 30, right: 30, top: 26, height: 196, borderRadius: 18, background: '#fff', border: `2px solid ${U.line}`, padding: '18px 22px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateY(${(1 - card) * -40}px)`, opacity: Math.min(1, card * 1.5)}}>
        <div style={{fontWeight: 700, fontSize: 26, color: U.ink}}>Fazenda Boa Vista</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12}}>
          {[
            {t: 'CAR ativo', ok: true}, {t: 'Licenças em dia', ok: true},
            {t: 'Sem embargo', ok: true}, {t: '1 alerta em análise', ok: false},
          ].map((c, i) => {
            const s = pop(frame, fps, 8 + i * 6);
            return (
              <div key={c.t} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: c.ok ? U.greenSoft : U.amberSoft, transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
                <Icon n={c.ok ? 'check' : 'alert'} size={24} color={c.ok ? U.green : U.amber} sw={2.6} />
                <span style={{fontWeight: 700, fontSize: 20, color: c.ok ? '#065F46' : '#92400E'}}>{c.t}</span>
              </div>
            );
          })}
        </div>
      </div>
      <svg width="940" height="670" style={{position: 'absolute', left: 0, top: 0}}>
        <path d={arc(470, 560, 210, 180, 240)} stroke="#EF4444" strokeWidth="44" fill="none" />
        <path d={arc(470, 560, 210, 241, 300)} stroke="#F59E0B" strokeWidth="44" fill="none" />
        <path d={arc(470, 560, 210, 301, 360)} stroke="#10B981" strokeWidth="44" fill="none" />
        <line x1="470" y1="560" x2={nx} y2={ny} stroke={U.ink} strokeWidth="10" strokeLinecap="round" />
        <circle cx="470" cy="560" r="18" fill={U.ink} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{fontWeight: 700, fontSize: 54, color: col, background: '#FFFFFF', borderRadius: 999, padding: '4px 30px', border: `3px solid ${col}`, boxShadow: '0 10px 24px rgba(15,23,42,0.15)'}}>{pct}%</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', transform: `scale(${ok})`, opacity: Math.min(1, ok * 1.5)}}>
        <Chip label="Propriedade regular" color={U.green} soft={U.greenSoft} size={24} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// ATIVOS AMBIENTAIS + CRÉDITO
// ---------------------------------------------------------------------------
const Ativos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hub = pop(frame, fps, 4, 12);
  const pulse = 1 + 0.03 * Math.sin(frame / 6);
  const L = ['Crédito de carbono', 'PSA', 'CRA'];
  const R = ['Servidão ambiental', 'PRAD interativo', 'ESG'];
  const ys = [110, 270, 430];
  return (
    <>
      <svg width="940" height="670" style={{position: 'absolute', left: 0, top: 0}}>
        {ys.map((y, i) => {
          const d = interpolate(frame, [12 + i * 6, 26 + i * 6], [1, 0], clamp);
          return (
            <g key={i}>
              <line x1="330" y1={y + 32} x2="470" y2="300" stroke={C.gold} strokeWidth="3" strokeDasharray="200" strokeDashoffset={200 * d} />
              <line x1="610" y1={y + 32} x2="470" y2="300" stroke={C.gold} strokeWidth="3" strokeDasharray="200" strokeDashoffset={200 * d} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 470 - 105, top: 300 - 105, width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #34D399, ${U.green} 60%, #065F46)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(5,150,105,0.45)', transform: `scale(${hub * pulse})`}}>
        <Icon n="leaf" size={110} color="#FFFFFF" sw={1.8} />
      </div>
      {[...L.map((t, i) => ({t, x: 22, y: ys[i], i})), ...R.map((t, i) => ({t, x: 610, y: ys[i], i: i + 4}))].map((c) => {
        const s = pop(frame, fps, 10 + c.i * 5);
        return (
          <div key={c.t} style={{position: 'absolute', left: c.x, top: c.y, width: 308, height: 64, borderRadius: 999, background: '#fff', border: `3px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: U.ink, boxShadow: '0 10px 24px rgba(15,23,42,0.12)', transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
            {c.t}
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// IA RUTE — conversa no WhatsApp
// ---------------------------------------------------------------------------
const Rute: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inS = spring({frame: frame - 3, fps, config: {damping: 16, mass: 0.9}});
  const q = pop(frame, fps, 12, 13);
  const typing = frame > 26 && frame < 50;
  const a = pop(frame, fps, 50, 13);
  const dot = (k: number) => 0.35 + 0.65 * Math.max(0, Math.sin((frame - k * 4) / 3));
  const cs = spring({frame: frame - 8, fps, config: {damping: 200}});
  return (
    <AbsoluteFill>
      <Caption lines={['A IA Rute responde', '24h no WhatsApp.']} size={74} />
      <div style={{position: 'absolute', top: 478, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.gold, opacity: cs, textTransform: 'uppercase'}}>
        Chat IA Rute · WhatsApp
      </div>
      <div style={{position: 'absolute', left: 230, top: 530, width: 620, height: 1000, borderRadius: 64, background: '#0A0F0D', padding: 18, boxSizing: 'border-box', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 3px rgba(235,203,94,0.3)', transform: `translateY(${(1 - inS) * 400}px)`, opacity: Math.min(1, inS * 1.4), fontFamily: FONT}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: '#E7E1D6'}}>
          <div style={{height: 140, background: '#0B3B2A', display: 'flex', alignItems: 'flex-end', padding: '0 26px 22px', boxSizing: 'border-box', gap: 18}}>
            <div style={{width: 70, height: 70, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 36, color: '#0B3B2A'}}>R</div>
            <div>
              <div style={{color: '#fff', fontWeight: 700, fontSize: 32}}>IA Rute</div>
              <div style={{color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 22}}>{typing ? 'digitando...' : 'online'}</div>
            </div>
          </div>
          <div style={{position: 'absolute', right: 24, left: 110, top: 180, background: '#D9FDD3', borderRadius: '26px 8px 26px 26px', padding: '20px 24px', fontSize: 27, fontWeight: 500, color: '#111827', lineHeight: 1.38, transformOrigin: 'top right', transform: `scale(${frame >= 12 ? q : 0})`}}>
            Com quanto tempo de antecedência peço a renovação da LO?
            <div style={{textAlign: 'right', fontSize: 18, color: '#6B7280', marginTop: 4}}>21:47</div>
          </div>
          {typing ? (
            <div style={{position: 'absolute', left: 24, top: 390, background: '#fff', borderRadius: 24, padding: '20px 26px', display: 'flex', gap: 10}}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{width: 14, height: 14, borderRadius: '50%', background: '#8A8A8A', opacity: dot(k), display: 'inline-block'}} />
              ))}
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 24, right: 90, top: 390, background: '#fff', borderRadius: '8px 26px 26px 26px', padding: '20px 24px', fontSize: 26, fontWeight: 500, color: '#111827', lineHeight: 1.4, transformOrigin: 'top left', transform: `scale(${frame >= 50 ? a : 0})`}}>
            Pelo menos <b>120 dias antes</b> do vencimento (LC 140/2011, art. 14, §4º). Assim, a licença fica prorrogada até a decisão do órgão.
            <div style={{textAlign: 'right', fontSize: 18, color: '#6B7280', marginTop: 4}}>21:47</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// EQUIPE + PORTAL DO CLIENTE
// ---------------------------------------------------------------------------
const Equipe: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const team = [
    {ini: 'AS', name: 'Ana Souza', role: 'Eng. florestal', mods: [1, 1, 1]},
    {ini: 'FR', name: 'Felipe Rocha', role: 'Técnico de campo', mods: [1, 1, 0]},
    {ini: 'JM', name: 'João Martins', role: 'Estagiário', mods: [1, 0, 0]},
  ];
  const names = ['Licenças', 'CRM', 'Financeiro'];
  const portal = pop(frame, fps, 44, 14);
  const click = frame >= 64;
  return (
    <>
      {team.map((m, i) => {
        const s = pop(frame, fps, 8 + i * 6);
        return (
          <div key={m.ini} style={{position: 'absolute', left: 30, right: 30, top: 24 + i * 112, height: 96, borderRadius: 16, background: '#fff', border: `2px solid ${U.line}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateX(${(1 - s) * -120}px)`, opacity: Math.min(1, s * 1.5)}}>
            <div style={{width: 60, height: 60, borderRadius: '50%', background: U.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24, flexShrink: 0}}>{m.ini}</div>
            <div style={{width: 250}}>
              <div style={{fontWeight: 700, fontSize: 24, color: U.ink, whiteSpace: 'nowrap'}}>{m.name}</div>
              <div style={{fontWeight: 500, fontSize: 19, color: U.sub}}>{m.role}</div>
            </div>
            <div style={{display: 'flex', gap: 8}}>
              {names.map((n, k) =>
                m.mods[k] ? (
                  <Chip key={n} label={n} color={U.green} soft={U.greenSoft} size={17} />
                ) : (
                  <span key={n} style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, background: '#F1F5F9', color: '#94A3B8', fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap'}}>
                    <Icon n="lock" size={16} color="#94A3B8" />
                    {n}
                  </span>
                ),
              )}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 30, right: 30, top: 380, height: 250, borderRadius: 20, background: '#0B3B2A', padding: '26px 30px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateY(${(1 - portal) * 120}px)`, opacity: Math.min(1, portal * 1.5)}}>
        <div style={{fontWeight: 700, fontSize: 22, color: C.gold, letterSpacing: 2}}>PORTAL DO CLIENTE</div>
        <div style={{fontWeight: 700, fontSize: 32, color: '#fff', marginTop: 8}}>Fazenda Boa Vista</div>
        <div style={{fontWeight: 500, fontSize: 22, color: 'rgba(255,255,255,0.8)', marginTop: 4}}>12 documentos disponíveis · CAR, LO, laudos</div>
        <div style={{position: 'absolute', right: 30, bottom: 28, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 14, background: click ? U.green : C.gold, color: click ? '#fff' : '#0B3B2A', fontWeight: 700, fontSize: 22, transform: `scale(${frame >= 60 && frame < 66 ? 0.94 : 1})`}}>
          <Icon n={click ? 'check' : 'down'} size={24} color={click ? '#fff' : '#0B3B2A'} sw={2.6} />
          {click ? 'Baixado' : 'Baixar tudo'}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// PROCESSOS — jurídicos e administrativos (tríplice responsabilidade)
// ---------------------------------------------------------------------------
const Processos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tabs = [
    {t: 'Administrativo', n: 3, c: U.amber, s: U.amberSoft},
    {t: 'Cível', n: 1, c: U.blue, s: U.blueSoft},
    {t: 'Criminal', n: 1, c: U.red, s: U.redSoft},
  ];
  const rows = [
    {k: 0, t: 'Auto de infração nº 0001/2026 · FEPAM', st: 'Defesa: 20 dias', sc: U.red, ss: U.redSoft},
    {k: 1, t: 'Ação civil pública nº 0002/2026', st: 'Contestação protocolada', sc: U.blue, ss: U.blueSoft},
    {k: 2, t: 'Inquérito · crime ambiental (Lei 9.605/98)', st: 'Acompanhando', sc: U.sub, ss: '#F1F5F9'},
  ];
  const ban = pop(frame, fps, 4, 200);
  const pulse = frame >= 50 ? 1 + 0.06 * Math.sin((frame - 50) / 3) : 1;
  return (
    <>
      <div style={{position: 'absolute', left: 30, right: 30, top: 22, padding: '14px 20px', borderRadius: 16, background: U.amberSoft, border: '2px solid #FCD34D', fontFamily: FONT, opacity: ban}}>
        <div style={{fontWeight: 700, fontSize: 23, color: '#92400E'}}>Monitoramento DOE-RS / FEPAM</div>
        <div style={{fontWeight: 500, fontSize: 19, color: '#B45309'}}>Verificação automática diária de novos processos administrativos</div>
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 128, display: 'flex', gap: 14}}>
        {tabs.map((t, i) => {
          const s = pop(frame, fps, 8 + i * 6);
          return (
            <div key={t.t} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderRadius: 14, background: t.s, border: `2px solid ${t.c}`, fontFamily: FONT, transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
              <span style={{fontWeight: 700, fontSize: 22, color: t.c}}>{t.t}</span>
              <span style={{fontWeight: 700, fontSize: 24, color: t.c}}>{t.n}</span>
            </div>
          );
        })}
      </div>
      {rows.map((r, i) => {
        const s = pop(frame, fps, 24 + i * 8);
        const tab = tabs[r.k];
        return (
          <div key={i} style={{position: 'absolute', left: 30, right: 30, top: 206 + i * 110, height: 98, borderRadius: 16, background: '#fff', border: `2px solid ${U.line}`, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, transform: `translateX(${(1 - s) * 140}px)`, opacity: Math.min(1, s * 1.5)}}>
            <div style={{width: 10, alignSelf: 'stretch', background: tab.c}} />
            <Icon n="scale" size={32} color={U.ink} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontWeight: 700, fontSize: 22, color: U.ink, whiteSpace: 'nowrap'}}>{r.t}</div>
              <div style={{marginTop: 6, display: 'flex', gap: 8}}>
                <Chip label={tab.t} color={tab.c} soft={tab.s} size={17} />
                <span style={{display: 'inline-block', transform: `scale(${i === 0 ? pulse : 1})`, transformOrigin: 'left center'}}>
                  <Chip label={r.st} color={r.sc} soft={r.ss} size={17} />
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <Toast at={66} icon="bell" color={U.amber} soft={U.amberSoft} title="DOE/RS: novo andamento hoje" sub="Auto de infração nº 0001/2026 · prazo atualizado" top={548} />
    </>
  );
};

// ---------------------------------------------------------------------------
// ALERTAS DE INFRAÇÕES — MapBiomas + PRODES
// ---------------------------------------------------------------------------
const Monitor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scan = interpolate(frame, [0, 22], [0, 1], clamp);
  const mb = pop(frame, fps, 22, 11);
  const pr = pop(frame, fps, 44, 11);
  const rip = (at: number) => (frame >= at ? ((frame - at) % 34) / 34 : 0);
  const count = frame >= 44 ? 2 : frame >= 22 ? 1 : 0;
  const cross = pop(frame, fps, 64);
  const items = [
    {at: 22, s: mb, c: '#DC2626', t: 'MapBiomas Alerta', a: 'Desmatamento · 2,3 ha', d: 'Detectado em 12/09/2026'},
    {at: 44, s: pr, c: '#EA580C', t: 'PRODES · INPE', a: 'Desmatamento anual · 1,1 ha', d: 'Mapeamento 2025'},
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 24, top: 24, width: 540, height: 620, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,23,42,0.15)'}}>
        <svg width="540" height="620" viewBox="0 0 540 620">
          <defs>
            <linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(52,211,153,0)" />
              <stop offset="0.5" stopColor="rgba(52,211,153,0.45)" />
              <stop offset="1" stopColor="rgba(52,211,153,0)" />
            </linearGradient>
          </defs>
          <rect width="540" height="620" fill="#3F6E2E" />
          <path d="M0 0 L260 0 L230 220 L0 250 Z" fill="#4E7F37" />
          <path d="M260 0 L540 0 L540 240 L290 260 Z" fill="#5E8C3C" />
          <path d="M0 250 L230 220 L210 620 L0 620 Z" fill="#46743A" />
          <path d="M290 260 L540 240 L540 620 L330 620 Z" fill="#6D9443" />
          <path d="M-10 470 C 120 430, 260 520, 560 440" fill="none" stroke="#2F6FB5" strokeWidth="12" />
          <path d="M70 90 L420 70 L500 300 L380 540 L110 510 L40 300 Z" fill="rgba(235,203,94,0.10)" stroke={C.gold} strokeWidth="5" strokeLinejoin="round" />
          <g transform={`translate(350 210) scale(${mb}) translate(-350 -210)`}>
            <path d="M300 168 L386 158 L404 238 L318 262 Z" fill="rgba(220,38,38,0.5)" stroke="#DC2626" strokeWidth="4" />
          </g>
          {frame >= 22 ? <circle cx="350" cy="210" r={40 + 70 * rip(22)} fill="none" stroke="#DC2626" strokeWidth="4" opacity={1 - rip(22)} /> : null}
          <g transform={`translate(195 392) scale(${pr}) translate(-195 -392)`}>
            <path d="M140 356 L234 340 L252 424 L158 444 Z" fill="rgba(234,88,12,0.5)" stroke="#EA580C" strokeWidth="4" />
          </g>
          {frame >= 44 ? <circle cx="195" cy="392" r={40 + 70 * rip(44)} fill="none" stroke="#EA580C" strokeWidth="4" opacity={1 - rip(44)} /> : null}
          {frame >= 26 ? (
            <g opacity={Math.min(1, mb)}>
              <rect x="262" y="108" width="208" height="42" rx="21" fill="#DC2626" />
              <text x="366" y="136" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="20" fill="#fff">MapBiomas · 2,3 ha</text>
            </g>
          ) : null}
          {frame >= 48 ? (
            <g opacity={Math.min(1, pr)}>
              <rect x="96" y="452" width="186" height="42" rx="21" fill="#EA580C" />
              <text x="189" y="480" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="20" fill="#fff">PRODES · 1,1 ha</text>
            </g>
          ) : null}
          {frame < 24 ? <rect x="0" y={-90 + scan * 720} width="540" height="90" fill="url(#scanG)" /> : null}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 584, top: 24, width: 332, fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14}}>
          <div style={{fontWeight: 700, fontSize: 26, color: U.ink}}>Alertas ativos</div>
          <div style={{width: 50, height: 50, borderRadius: '50%', background: count ? U.red : '#CBD5E1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26}}>{count}</div>
        </div>
        {items.map((it) => (
          <div key={it.t} style={{padding: '16px 16px', marginBottom: 12, borderRadius: 16, background: '#fff', border: `3px solid ${it.c}`, transform: `scale(${it.s})`, opacity: frame >= it.at ? Math.min(1, it.s * 1.5) : 0, transformOrigin: 'top center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 22, color: it.c}}>
              <Icon n="sat" size={24} color={it.c} />
              {it.t}
            </div>
            <div style={{fontWeight: 700, fontSize: 19, color: U.ink, marginTop: 6}}>{it.a}</div>
            <div style={{fontWeight: 500, fontSize: 17, color: U.sub, marginTop: 2}}>{it.d}</div>
          </div>
        ))}
        <div style={{transform: `scale(${cross})`, opacity: Math.min(1, cross * 1.5), transformOrigin: 'left center', marginTop: 4}}>
          <span style={{display: 'inline-block', padding: '10px 14px', borderRadius: 14, background: 'rgba(235,203,94,0.25)', color: '#8A6D0B', fontWeight: 700, fontSize: 20, lineHeight: 1.3}}>
            Cruzado com CAR, APP e Reserva Legal
          </span>
        </div>
      </div>
      <Toast at={88} icon="bell" color={U.red} soft={U.redSoft} title="Novo alerta na Fazenda Boa Vista" sub="Aja antes que vire autuação" top={540} left={40} width={860} />
    </>
  );
};

// ---------------------------------------------------------------------------
// MAPEAMENTOS — drone e upload de TIFF
// ---------------------------------------------------------------------------
const Drone: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const prog = interpolate(frame, [8, 50], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const done = prog >= 1;
  const reveal = interpolate(frame, [52, 80], [0, 1], ease);
  const lbl = pop(frame, fps, 82);
  const car = interpolate(frame, [82, 100], [1, 0], clamp);
  const chips = ['Ortomosaico', 'Limite do CAR', 'Histórico de voos'];
  return (
    <>
      <div style={{position: 'absolute', left: 30, right: 30, top: 22, height: 150, borderRadius: 18, background: '#fff', border: `3px ${done ? 'solid' : 'dashed'} ${U.green}`, padding: '20px 24px', boxSizing: 'border-box', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 58, height: 58, borderRadius: 16, background: U.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon n={done ? 'check' : 'upload'} size={32} color={U.green} sw={done ? 3 : 2} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 700, fontSize: 24, color: U.ink}}>ortomosaico_boa_vista.tif</div>
            <div style={{fontWeight: 500, fontSize: 19, color: U.sub}}>GeoTIFF · 1,8 GB</div>
          </div>
          <div style={{fontWeight: 700, fontSize: 26, color: done ? U.green : U.ink}}>{done ? 'Concluído' : `${Math.round(prog * 100)}%`}</div>
        </div>
        <div style={{marginTop: 16, height: 14, borderRadius: 7, background: U.line, overflow: 'hidden'}}>
          <div style={{width: `${prog * 100}%`, height: '100%', background: done ? U.green : `linear-gradient(90deg, ${U.green}, #34D399)`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 192, height: 368, borderRadius: 18, overflow: 'hidden', background: '#E8EEF3', backgroundImage: 'linear-gradient(#D5DEE7 2px, transparent 2px), linear-gradient(90deg, #D5DEE7 2px, transparent 2px)', backgroundSize: '44px 44px'}}>
        {reveal < 1 ? (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#64748B', opacity: 1 - Math.min(1, reveal * 3)}}>
            {done ? 'Gerando visualização…' : 'Aguardando upload…'}
          </div>
        ) : null}
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`}}>
          <svg width="880" height="368" viewBox="0 0 880 368">
            <defs>
              <pattern id="r1" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                <rect width="10" height="10" fill="#5F8B36" />
                <rect width="4" height="10" fill="#4A7429" />
              </pattern>
              <pattern id="r2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
                <rect width="9" height="9" fill="#8A6A45" />
                <rect width="3" height="9" fill="#735638" />
              </pattern>
              <pattern id="r3" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(70)">
                <rect width="12" height="12" fill="#7FA24A" />
                <rect width="5" height="12" fill="#6B8F3A" />
              </pattern>
            </defs>
            <rect width="880" height="368" fill="#6B8E3D" />
            <path d="M0 0 L380 0 L340 200 L0 230 Z" fill="url(#r1)" />
            <path d="M380 0 L880 0 L880 170 L360 210 Z" fill="url(#r3)" />
            <path d="M0 230 L340 200 L320 368 L0 368 Z" fill="url(#r2)" />
            <path d="M360 210 L880 170 L880 368 L330 368 Z" fill="url(#r1)" />
            <path d="M-10 214 C 200 196, 500 214, 890 176" fill="none" stroke="#CDB892" strokeWidth="12" />
            <ellipse cx="690" cy="280" rx="70" ry="38" fill="#3D7FB8" />
            {[[120, 300], [150, 318], [96, 330], [135, 342], [170, 296]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="18" fill="#2F5A24" />
            ))}
            <path d="M60 40 L560 24 L620 190 L520 340 L90 330 L30 180 Z" fill="none" stroke={C.gold} strokeWidth="5" strokeLinejoin="round" strokeDasharray="1800" strokeDashoffset={1800 * car} />
          </svg>
        </div>
        {reveal > 0 && reveal < 1 ? (
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${reveal * 100}%`, width: 6, marginLeft: -3, background: '#34D399', boxShadow: '0 0 24px 6px rgba(52,211,153,0.8)'}} />
        ) : null}
        {frame >= 82 ? (
          <div style={{position: 'absolute', left: 16, top: 16, padding: '8px 16px', borderRadius: 999, background: 'rgba(15,23,42,0.82)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 19, transform: `scale(${lbl})`, transformOrigin: 'left center'}}>
            Ortomosaico · 5 cm/px · 04/09/2026
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 30, top: 580, display: 'flex', gap: 12}}>
        {chips.map((c, i) => {
          const s = pop(frame, fps, 88 + i * 6);
          return (
            <div key={c} style={{transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
              <Chip label={c} color={U.green} soft={U.greenSoft} size={21} />
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// AGRICULTURA DE PRECISÃO — clima e commodities
// ---------------------------------------------------------------------------
const Clima: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rain = [2, 0, 12, 18, 6, 0, 4];
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const total = Math.round(interpolate(frame, [10, 40], [0, 42], clamp));
  const com = [
    {t: 'Soja', v: '+1,2%', up: true, pts: [30, 34, 31, 38, 36, 42, 45]},
    {t: 'Milho', v: '−0,8%', up: false, pts: [44, 40, 42, 38, 39, 35, 34]},
    {t: 'Boi gordo', v: '+0,5%', up: true, pts: [32, 33, 31, 35, 34, 36, 37]},
  ];
  const cardL = pop(frame, fps, 4, 14);
  const cardR = pop(frame, fps, 14, 14);
  return (
    <>
      <div style={{position: 'absolute', left: 24, top: 24, width: 440, height: 620, borderRadius: 18, background: '#fff', border: `2px solid ${U.line}`, padding: '22px 24px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateY(${(1 - cardL) * 60}px)`, opacity: Math.min(1, cardL * 1.5)}}>
        <div style={{fontWeight: 700, fontSize: 24, color: U.ink}}>Monitoramento Climático</div>
        <div style={{fontWeight: 500, fontSize: 19, color: U.sub}}>Fazenda Boa Vista</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 18}}>
          <svg width="96" height="80" viewBox="0 0 96 80">
            <circle cx="36" cy="30" r="20" fill="#F59E0B" />
            <path d="M30 70 h46 a16 16 0 0 0 -4 -31 a22 22 0 0 0 -41 7 a12 12 0 0 0 -1 24z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          </svg>
          <div>
            <div style={{fontWeight: 700, fontSize: 40, color: U.ink}}>{total} mm</div>
            <div style={{fontWeight: 500, fontSize: 18, color: U.sub}}>chuva prevista em 7 dias</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 24, right: 24, bottom: 24, height: 370, display: 'flex', alignItems: 'flex-end', gap: 12}}>
          {rain.map((r, i) => {
            const g = interpolate(frame, [12 + i * 4, 30 + i * 4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
            return (
              <div key={i} style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
                <div style={{fontWeight: 700, fontSize: 15, color: U.blue, marginBottom: 4, opacity: g}}>{r}</div>
                <div style={{width: '100%', height: `${Math.max(3, (r / 18) * 80) * g}%`, borderRadius: '8px 8px 3px 3px', background: '#3B82F6'}} />
                <div style={{marginTop: 6, fontWeight: 500, fontSize: 15, color: U.sub}}>{days[i]}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 480, top: 24, width: 436, height: 620, borderRadius: 18, background: '#fff', border: `2px solid ${U.line}`, padding: '22px 24px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateY(${(1 - cardR) * 60}px)`, opacity: Math.min(1, cardR * 1.5)}}>
        <div style={{fontWeight: 700, fontSize: 24, color: U.ink}}>Análise de Commodities</div>
        <div style={{fontWeight: 500, fontSize: 19, color: U.sub}}>Variação da semana</div>
        {com.map((c, i) => {
          const d = interpolate(frame, [22 + i * 8, 52 + i * 8], [1, 0], clamp);
          const s = pop(frame, fps, 50 + i * 8);
          const pts = c.pts.map((v, k) => `${k * 42},${70 - v}`).join(' ');
          return (
            <div key={c.t} style={{marginTop: 24, paddingBottom: 16, borderBottom: i < 2 ? `2px solid ${U.line}` : 'none'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{fontWeight: 700, fontSize: 24, color: U.ink}}>{c.t}</div>
                <div style={{transform: `scale(${s})`}}>
                  <Chip label={c.v} color={c.up ? U.green : U.red} soft={c.up ? U.greenSoft : U.redSoft} size={20} />
                </div>
              </div>
              <svg width="260" height="60" viewBox="0 0 260 60" style={{marginTop: 6}}>
                <polyline points={pts} fill="none" stroke={c.up ? U.green : U.red} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="400" strokeDashoffset={400 * d} transform="translate(4 -6)" />
              </svg>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// CRÉDITO E SAFRA — crédito rural e frustração de safra
// ---------------------------------------------------------------------------
const Credito: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    {t: 'Custeio soja 2025/26', s: 'Parcela em 15/10/2026', chip: 'Vence em 19 dias', c: U.amber, cs: U.amberSoft},
    {t: 'Investimento · máquinas', s: 'Próxima parcela em 03/2027', chip: 'Em dia', c: U.green, cs: U.greenSoft},
    {t: 'Custeio milho safrinha', s: 'Contrato encerrado', chip: 'Quitado', c: U.sub, cs: '#F1F5F9'},
  ];
  const card = pop(frame, fps, 36, 14);
  const g = interpolate(frame, [46, 66], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const res = pop(frame, fps, 68);
  const docs = ['Laudo técnico', 'Fotos', 'Produtividade'];
  return (
    <>
      <div style={{position: 'absolute', left: 30, top: 20, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: U.ink}}>Gestão de Crédito Rural</div>
      {rows.map((r, i) => {
        const s = pop(frame, fps, 8 + i * 7);
        return (
          <div key={r.t} style={{position: 'absolute', left: 30, right: 30, top: 62 + i * 92, height: 80, borderRadius: 16, background: '#fff', border: `2px solid ${U.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateX(${(1 - s) * -140}px)`, opacity: Math.min(1, s * 1.5)}}>
            <Icon n="sprout" size={32} color={U.green} />
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 22, color: U.ink}}>{r.t}</div>
              <div style={{fontWeight: 500, fontSize: 17, color: U.sub}}>{r.s}</div>
            </div>
            <Chip label={r.chip} color={r.c} soft={r.cs} size={18} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 30, right: 30, top: 348, height: 296, borderRadius: 20, background: '#0B3B2A', padding: '22px 26px', boxSizing: 'border-box', fontFamily: FONT, transform: `translateY(${(1 - card) * 120}px)`, opacity: Math.min(1, card * 1.5)}}>
        <div style={{fontWeight: 700, fontSize: 20, color: C.gold, letterSpacing: 2}}>FRUSTRAÇÃO DE SAFRA</div>
        <div style={{fontWeight: 700, fontSize: 28, color: '#fff', marginTop: 4}}>Soja · Fazenda Santa Clara</div>
        {[
          {t: 'Esperado', v: 60, c: 'rgba(255,255,255,0.85)'},
          {t: 'Colhido', v: 38, c: '#F97316'},
        ].map((b, i) => (
          <div key={b.t} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: i ? 10 : 18}}>
            <div style={{width: 110, fontWeight: 500, fontSize: 19, color: 'rgba(255,255,255,0.8)'}}>{b.t}</div>
            <div style={{flex: 1, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
              <div style={{width: `${(b.v / 60) * 100 * g}%`, height: '100%', borderRadius: 13, background: b.c}} />
            </div>
            <div style={{width: 110, fontWeight: 700, fontSize: 20, color: '#fff', textAlign: 'right'}}>{b.v} sc/ha</div>
          </div>
        ))}
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 18}}>
          <div style={{transform: `scale(${res})`, transformOrigin: 'left center', opacity: Math.min(1, res * 1.5)}}>
            <Chip label="−37% · perda documentada" color="#991B1B" soft="#FECACA" size={19} />
          </div>
          {docs.map((d, i) => {
            const s = pop(frame, fps, 74 + i * 6);
            return (
              <div key={d} style={{transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
                <Chip label={d} color="#0B3B2A" soft={C.gold} size={17} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// RELATÓRIOS — para o consultor, o produtor rural e o empreendimento
// ---------------------------------------------------------------------------
type RepRow = {i: string; t: string; warn?: boolean};
const REPS: {aud: string; head: string; title: string; sub: string; rows: RepRow[]; viz: 'bars' | 'gauge' | 'grid'}[] = [
  {
    aud: 'Consultor', head: '#B45309', title: 'Sua carteira', sub: 'Gestão · setembro/2026', viz: 'bars',
    rows: [
      {i: 'users', t: '48 clientes ativos'},
      {i: 'cal', t: '12 licenças a vencer'},
      {i: 'scale', t: '5 processos em curso'},
      {i: 'chart', t: 'R$ 38.450 no mês'},
    ],
  },
  {
    aud: 'Produtor rural', head: '#059669', title: 'Fazenda Boa Vista', sub: 'Situação ambiental', viz: 'gauge',
    rows: [
      {i: 'check', t: 'CAR ativo'},
      {i: 'check', t: 'Licenças em dia'},
      {i: 'alert', t: '1 alerta em análise', warn: true},
      {i: 'map', t: 'Mapa e fotos anexos'},
    ],
  },
  {
    aud: 'Empreendimento', head: '#2563EB', title: 'Granja Três Irmãos', sub: 'Licenciamento ambiental', viz: 'grid',
    rows: [
      {i: 'doc', t: 'LO vigente até 11/2029'},
      {i: 'check', t: 'Condicionantes: 8/10'},
      {i: 'cal', t: 'Monitoramento em dia'},
      {i: 'doc', t: 'ART e laudos anexos'},
    ],
  },
];

const Relatorios: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = interpolate(frame, [44, 70], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const srcs = ['Licenças', 'Processos', 'CAR', 'Alertas', 'Financeiro'];
  const lab = pop(frame, fps, 52, 200);
  return (
    <>
      {REPS.map((r, i) => {
        const s = pop(frame, fps, 6 + i * 6, 13);
        const col = r.head;
        return (
          <div
            key={r.aud}
            style={{
              position: 'absolute', left: 20 + i * 304, top: 22, width: 292, height: 404, borderRadius: 18, background: '#fff',
              border: `2px solid ${U.line}`, boxShadow: '0 10px 24px rgba(15,23,42,0.10)', overflow: 'hidden', fontFamily: FONT,
              transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.5),
            }}
          >
            <div style={{height: 60, background: col, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px'}}>
              <span style={{fontWeight: 700, fontSize: 15, letterSpacing: 1.5, color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{r.aud}</span>
              <span style={{fontWeight: 700, fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.24)', borderRadius: 8, padding: '4px 10px'}}>PDF</span>
            </div>
            <div style={{padding: '14px 14px 0'}}>
              <div style={{fontWeight: 700, fontSize: 22, color: U.ink, whiteSpace: 'nowrap'}}>{r.title}</div>
              <div style={{fontWeight: 500, fontSize: 16, color: U.sub, marginTop: 1}}>{r.sub}</div>
              <div style={{marginTop: 10}}>
                {r.rows.map((row, k) => {
                  const at = 20 + k * 6 + i * 2;
                  const on = frame >= at;
                  const rs = interpolate(frame, [at, at + 6], [0, 1], clamp);
                  const c = row.warn ? U.amber : row.i === 'check' ? U.green : col;
                  return (
                    <div key={k} style={{height: 36, display: 'flex', alignItems: 'center'}}>
                      {on ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: 8, opacity: rs, transform: `translateX(${(1 - rs) * -10}px)`}}>
                          <Icon n={row.i} size={20} color={c} sw={2.4} />
                          <span style={{fontWeight: 700, fontSize: 17, color: row.warn ? '#92400E' : U.ink, whiteSpace: 'nowrap'}}>{row.t}</span>
                        </div>
                      ) : (
                        <div style={{height: 12, width: `${62 + ((k * 17 + i * 11) % 28)}%`, borderRadius: 6, background: U.line}} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{position: 'absolute', left: 14, right: 14, bottom: 14, height: 84, borderRadius: 12, background: U.bg, border: `2px solid ${U.line}`, boxSizing: 'border-box', padding: '10px 12px'}}>
              {r.viz === 'bars' ? (
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: '100%'}}>
                  {[42, 58, 50, 68, 74, 96].map((h, k) => (
                    <div key={k} style={{flex: 1, height: `${Math.max(4, h * g)}%`, borderRadius: '5px 5px 2px 2px', background: k === 5 ? '#D97706' : '#FDE68A'}} />
                  ))}
                </div>
              ) : r.viz === 'gauge' ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 12, height: '100%'}}>
                  <svg width="110" height="62" viewBox="0 0 110 62">
                    <path d={arc(55, 56, 44, 180, 270)} stroke={U.line} strokeWidth="12" fill="none" strokeLinecap="round" />
                    <path d={arc(55, 56, 44, 270, 360)} stroke={U.line} strokeWidth="12" fill="none" strokeLinecap="round" />
                    {g > 0.02 ? <path d={arc(55, 56, 44, 180, 180 + 180 * 0.86 * g)} stroke={U.green} strokeWidth="12" fill="none" strokeLinecap="round" /> : null}
                  </svg>
                  <div>
                    <div style={{fontWeight: 700, fontSize: 26, color: U.green, lineHeight: 1}}>{Math.round(86 * g)}%</div>
                    <div style={{fontWeight: 500, fontSize: 14, color: U.sub, marginTop: 4}}>regularidade</div>
                  </div>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, height: '100%'}}>
                  {new Array(10).fill(0).map((_, k) => {
                    const done = k < 8 && g > (k + 1) / 10;
                    return (
                      <div key={k} style={{borderRadius: 6, background: done ? U.greenSoft : k < 8 ? U.line : U.amberSoft, border: `2px solid ${done ? U.green : k < 8 ? U.line : '#FCD34D'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {done ? <Icon n="check" size={16} color={U.green} sw={3} /> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 20, top: 446, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT}}>
        <span style={{fontWeight: 700, fontSize: 19, color: U.sub, opacity: lab, marginRight: 4}}>Com dados de</span>
        {srcs.map((t, k) => {
          const s = pop(frame, fps, 56 + k * 4);
          return (
            <div key={t} style={{transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>
              <Chip label={t} color={U.green} soft={U.greenSoft} size={19} />
            </div>
          );
        })}
      </div>
      <Toast at={84} icon="down" color={U.green} soft={U.greenSoft} title="3 relatórios prontos em PDF" sub="Para você, o produtor e o empreendimento" top={530} />
    </>
  );
};

// ---------------------------------------------------------------------------
// Registro dos módulos (cenas ilustradas com dados fictícios)
// ---------------------------------------------------------------------------
export const MOD: Record<string, React.FC> = {
  crm: CRM,
  contrato: Contrato,
  financeiro: Financeiro,
  processos: Processos,
  alertas: Monitor,
  termometro: Termometro,
  mapa: Mapa,
  geo: Geo,
  drone: Drone,
  clima: Clima,
  credito: Credito,
  ativos: Ativos,
  relatorios: Relatorios,
  equipe: Equipe,
};

export {ModuleScene, Rute as RuteScene, Hook as AbasHook, Icon, Chip, pop, U};
