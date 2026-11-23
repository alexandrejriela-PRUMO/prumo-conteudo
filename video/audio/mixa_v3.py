"""Mix da versão só com efeitos (sem narração): efeitos + trilha animada."""
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d

import sintetiza as syn

SR = 48000
FPS = 30
TOTAL = 915 / FPS  # 30,5 s
ROOT = '/home/claude/prumo-video'
meter = pyln.Meter(SR)


def db(v):
    return 10 ** (v / 20)


def load(path):
    x, sr = sf.read(path, always_2d=False)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(sr, SR)
        x = resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def place(buf, clip, at, gain=1.0):
    i = int(round(at * SR))
    j = min(len(buf), i + len(clip))
    if 0 <= i < len(buf):
        buf[i:j] += clip[:j - i] * gain


def limiter(x, ceiling_db=-1.5, look=0.004, release=0.09):
    c = db(ceiling_db)
    g = np.minimum(1.0, c / (np.abs(x) + 1e-12))
    g = minimum_filter1d(g, size=2 * int(look * SR) + 1)
    a = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    prev = 1.0
    for i in range(len(g)):
        gi = g[i]
        prev = gi if gi < prev else a * prev + (1 - a) * gi
        out[i] = prev
    return x * out


def master(x, target=-14.0):
    x = x * db(target - meter.integrated_loudness(x))
    for _ in range(2):
        x = limiter(x)
        x = x * db(target - meter.integrated_loudness(x))
    return limiter(x)


if __name__ == '__main__':
    n = int(TOTAL * SR)
    sfx = np.zeros(n)
    S = {k: load(f'{ROOT}/audio/sfx-{k}.wav') for k in
         ['whoosh', 'whoosh_s', 'pop', 'pop_lo', 'pop_hi', 'tick', 'tick_hi', 'stamp', 'ding', 'riser']}

    # inícios das cenas na V3
    H, P, D, L, A, W, E = 0, 114, 219, 339, 483, 645, 765


    def f(scene, local):
        return (scene + local) / FPS


    EV = [
        ('stamp', f(H, 16), -7),
        ('whoosh', f(P, 0) - 0.25, -11),
        *[(['pop', 'pop_hi', 'pop_lo'][i % 3], f(P, 2 + i * 4), -15) for i in range(6)],
        ('stamp', f(P, 44), -11), ('stamp', f(P, 56), -11), ('stamp', f(P, 68), -11),
        ('whoosh', f(D, 0) - 0.25, -11),
        ('pop_lo', f(D, 2), -15), ('pop', f(D, 32), -11), ('tick', f(D, 50), -13),
        ('whoosh', f(L, 0) - 0.25, -11),
        ('pop_lo', f(L, 2), -15), ('pop', f(L, 14), -12), ('tick', f(L, 34), -14),
        ('tick_hi', f(L, 52), -11), ('whoosh_s', f(L, 80), -13), ('pop_hi', f(L, 84), -12),
        ('tick_hi', f(L, 100), -11),
        ('whoosh', f(A, 0) - 0.25, -11),
        ('pop_lo', f(A, 2), -15), ('tick', f(A, 16), -14), ('pop', f(A, 38), -12),
        ('whoosh_s', f(A, 64), -13),
        ('tick', f(A, 90), -10), ('tick_hi', f(A, 102), -10), ('tick_hi', f(A, 114), -9),
        ('whoosh', f(W, 0) - 0.25, -11),
        ('ding', f(W, 30), -7), ('pop_hi', f(W, 62), -13),
        ('riser', f(E, 0) - 1.1, -12),
        ('pop', f(E, 2), -10), ('pop_hi', f(E, 22), -10),
    ]
    for k, at, g in EV:
        place(sfx, S[k], at, db(g))

    # trilha: batida completa entra junto com o PRUMO (cena 3)
    BAR = syn.BAR
    off = 4 * BAR - D / FPS  # alinha o compasso 4 com o início da cena 3
    m = syn.music(TOTAL + off + 0.5, groove=2, full_bar=4, arp_bar=6, crash_bar=None)
    m = m[int(off * SR):int(off * SR) + n]
    place(m, syn.crash(), E / FPS, 0.35)
    fade = int(1.3 * SR)
    m[-fade:] *= np.linspace(1, 0, fade)
    fi = int(0.25 * SR)
    m[:fi] *= np.linspace(0, 1, fi)
    m = syn.norm(m, 0.9)
    m *= db(-19 - meter.integrated_loudness(m))

    mix = master(sfx + m)
    print('com trilha  -> LUFS', round(meter.integrated_loudness(mix), 2), 'pico', round(20 * np.log10(np.abs(mix).max()), 2))
    sf.write(f'{ROOT}/audio/mix-v3-trilha.wav', np.stack([mix, mix], 1).astype(np.float32), SR)

    only = master(sfx, target=-16.0)
    print('só efeitos  -> LUFS', round(meter.integrated_loudness(only), 2), 'pico', round(20 * np.log10(np.abs(only).max()), 2))
    sf.write(f'{ROOT}/audio/mix-v3-so-efeitos.wav', np.stack([only, only], 1).astype(np.float32), SR)
    print('offset trilha', round(off, 3), 's')
