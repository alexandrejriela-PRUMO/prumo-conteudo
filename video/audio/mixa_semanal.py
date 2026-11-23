"""Áudio do Reels semanal: efeitos sincronizados com as cenas + trilha própria (sem direitos autorais).

Uso: python3 audio/mixa_semanal.py roteiro.json saida.wav
A linha do tempo segue as mesmas regras de src/Semanal.tsx (durações padrão e 6 quadros de sobreposição).
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sintetiza as syn  # noqa: E402
from mixa_v3 import SR, db, master, meter, place  # noqa: E402

FPS = 30
PADRAO = {'gancho': 105, 'abas': 135, 'modulo': 110, 'rute': 120, 'lista': 130, 'fim': 150}
SOBREPOE = 6


def linha_do_tempo(cenas):
    t, out = 0, []
    for i, c in enumerate(cenas):
        dur = c.get('dur', PADRAO[c['tipo']])
        ini = 0 if i == 0 else t - SOBREPOE
        t = ini + dur
        out.append((ini, dur, c))
    return out, t


def main(roteiro, saida):
    cenas = json.load(open(roteiro))['cenas']
    tl, total_q = linha_do_tempo(cenas)
    total = total_q / FPS
    n = int(total * SR)
    S = {
        'whoosh': syn.whoosh(), 'whoosh_s': syn.whoosh(0.35), 'pop': syn.pop(), 'pop_lo': syn.pop(560),
        'pop_hi': syn.pop(1100), 'tick': syn.tick(), 'tick_hi': syn.tick(3400), 'stamp': syn.stamp(),
        'ding': syn.ding(), 'riser': syn.riser(),
    }
    sfx = np.zeros(n)

    def ev(nome, quadro, ganho):
        place(sfx, S[nome], quadro / FPS, db(ganho))

    for i, (ini, dur, c) in enumerate(tl):
        tipo = c['tipo']
        if i > 0 and tipo != 'fim':
            ev('whoosh', ini - 7, -12)
        if tipo == 'gancho':
            palavras = sum(len(l.split()) for l in c['linhas'])
            for k in range(palavras):
                ev(['pop', 'pop_hi', 'pop_lo'][k % 3], ini + 4 + 4 * k, -15)
            ev('stamp', ini + 4 + 4 * (palavras - 1) + 6, -9)
        elif tipo == 'lista':
            for k in range(len(c['itens'])):
                ev(['pop_lo', 'pop', 'pop_hi'][k % 3], ini + 14 + 12 * k, -12)
            ev('ding', ini + 14 + 12 * len(c['itens']) + 6, -12)
        elif tipo == 'modulo':
            ev('pop_lo', ini + 4, -15)
            for k in range(4):
                ev(['tick', 'pop', 'tick_hi', 'pop_hi'][k], ini + 20 + 18 * k, -16)
            ev('ding', ini + dur - 30, -13)
        elif tipo in ('rute', 'abas'):
            ev('pop', ini + 12, -12)
            ev('ding', ini + 50, -10)
        elif tipo == 'fim':
            ev('riser', ini - 33, -12)
            ev('pop', ini + 2, -10)
            ev('pop_hi', ini + 22, -10)

    # trilha: batida completa a partir da segunda cena
    segunda = tl[1][0] / FPS if len(tl) > 1 else 0
    off = 2 * syn.BAR - segunda
    m = syn.music(total + off + 0.5, groove=1, full_bar=2, arp_bar=4, crash_bar=None)
    m = m[int(off * SR):int(off * SR) + n]
    if len(m) < n:
        m = np.pad(m, (0, n - len(m)))
    place(m, syn.crash(), tl[-1][0] / FPS, 0.35)
    fade = int(1.4 * SR)
    m[-fade:] *= np.linspace(1, 0, fade)
    fi = int(0.12 * SR)
    m[:fi] *= np.linspace(0, 1, fi)
    m = syn.norm(m, 0.9)
    m *= db(-19 - meter.integrated_loudness(m))

    mix = master(sfx + m)
    sf.write(saida, np.stack([mix, mix], 1).astype(np.float32), SR)
    print('áudio ok', round(total, 2), 's  LUFS', round(meter.integrated_loudness(mix), 1))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
