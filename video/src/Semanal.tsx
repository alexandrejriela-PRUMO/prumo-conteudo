import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './brand';
import {Background, Caption, EndCard, SceneFade} from './shared';
import {AbasHook, MOD, ModuleScene, RuteScene} from './ModulosTour';

// Cada Reels semanal é uma lista de cenas descrita em JSON (ver video/exemplo.json).
export type Cena =
  | {tipo: 'gancho'; linhas: string[]; dur?: number}
  | {tipo: 'abas'; dur?: number}
  | {tipo: 'modulo'; modulo: string; legenda: string[]; caminho: string; titulo: string; icone: string; dur?: number}
  | {tipo: 'rute'; dur?: number}
  | {tipo: 'lista'; legenda: string[]; itens: string[]; dur?: number}
  | {tipo: 'fim'; linhas: string[]; dur?: number};

export type SemanalProps = {cenas: Cena[]};

const PADRAO: Record<Cena['tipo'], number> = {gancho: 105, abas: 135, modulo: 110, rute: 120, lista: 130, fim: 150};
const SOBREPOE = 6;

export const linhaDoTempo = (cenas: Cena[]) => {
  let t = 0;
  return cenas.map((c, i) => {
    const dur = c.dur ?? PADRAO[c.tipo];
    const from = i === 0 ? 0 : t - SOBREPOE;
    t = from + dur;
    return {from, dur, cena: c};
  });
};

export const duracaoTotal = (cenas: Cena[]) => {
  const tl = linhaDoTempo(cenas);
  const u = tl[tl.length - 1];
  return u.from + u.dur;
};

// Gancho: palavras entram uma a uma, última linha em dourado
const Gancho: React.FC<{linhas: string[]}> = ({linhas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let k = 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 700, textAlign: 'center', lineHeight: 1.14, letterSpacing: -1, padding: '0 50px'}}>
        {linhas.map((l, i) => (
          <div key={i} style={{marginTop: i ? 14 : 0}}>
            {l.split(' ').map((w) => {
              const at = 4 + k++ * 4;
              const s = spring({frame: frame - at, fps, config: {damping: 13, mass: 0.6}});
              const ouro = i === linhas.length - 1;
              return (
                <span
                  key={`${w}${at}`}
                  style={{
                    display: 'inline-block',
                    margin: '0 12px',
                    fontSize: ouro ? 104 : 88,
                    color: ouro ? C.gold : C.white,
                    opacity: Math.min(1, s * 1.5),
                    transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + 0.2 * s})`,
                    textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Lista: legenda no topo + cartões numerados que entram em sequência
const Lista: React.FC<{legenda: string[]; itens: string[]}> = ({legenda, itens}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Caption lines={legenda} size={74} />
      {itens.map((t, i) => {
        const s = spring({frame: frame - 14 - i * 12, fps, config: {damping: 14, mass: 0.7}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 70, right: 70, top: 600 + i * 210, minHeight: 170, boxSizing: 'border-box',
              padding: '30px 34px 30px 140px', borderRadius: 28, background: '#FFFFFF', fontFamily: FONT,
              boxShadow: '0 30px 70px rgba(0,0,0,0.45), 0 0 0 3px rgba(235,203,94,0.28)',
              transform: `translateX(${(1 - s) * (i % 2 ? 900 : -900)}px)`, opacity: Math.min(1, s * 1.4),
              display: 'flex', alignItems: 'center',
            }}
          >
            <div style={{position: 'absolute', left: 34, top: '50%', marginTop: -40, width: 80, height: 80, borderRadius: '50%', background: C.gold, color: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 42}}>
              {i + 1}
            </div>
            <div style={{fontWeight: 700, fontSize: 40, lineHeight: 1.22, color: '#0F172A'}}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Render: React.FC<{c: Cena}> = ({c}) => {
  switch (c.tipo) {
    case 'gancho':
      return <Gancho linhas={c.linhas} />;
    case 'abas':
      return <AbasHook />;
    case 'rute':
      return <RuteScene />;
    case 'lista':
      return <Lista legenda={c.legenda} itens={c.itens} />;
    case 'fim':
      return <EndCard lines={c.linhas} />;
    case 'modulo': {
      const M = MOD[c.modulo];
      if (!M) throw new Error(`Módulo desconhecido: ${c.modulo}. Opções: ${Object.keys(MOD).join(', ')}`);
      return (
        <ModuleScene cap={c.legenda} crumb={c.caminho} icon={c.icone} title={c.titulo}>
          <M />
        </ModuleScene>
      );
    }
  }
};

export const Semanal: React.FC<SemanalProps> = ({cenas}) => {
  const tl = linhaDoTempo(cenas);
  return (
    <AbsoluteFill style={{backgroundColor: C.greenDeep}}>
      <Background />
      {tl.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <SceneFade dur={i === tl.length - 1 ? s.dur + 20 : s.dur} noIn={i === 0}>
            <Render c={s.cena} />
          </SceneFade>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
