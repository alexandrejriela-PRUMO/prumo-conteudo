"""Gera efeitos sonoros e uma trilha animada (sem direitos autorais) para o Reels do PRUMO."""
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def lp(x, fc, order=4):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=4):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def norm(x, peak=0.9):
    m = np.abs(x).max()
    return x * (peak / m) if m > 0 else x


# ------------------------------------------------------------------ efeitos
def whoosh(d=0.55, up=True):
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):
        p = i / n
        fc = 400 + (5200 if up else 3000) * (np.sin(np.pi * p) ** 1.5)
        seg = noise[i:i + blk]
        out[i:i + blk] = lp(seg, fc, 2)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return norm(out * env, 0.7)


def pop(f0=820, d=0.13):
    tt = t(d)
    f = f0 * np.exp(-tt * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.exp(-tt * 38) * (1 - np.exp(-tt * 900))
    x = np.sin(ph) * env + 0.25 * np.sin(2 * ph) * env
    return norm(x, 0.8)


def tick(f0=2600, d=0.05):
    tt = t(d)
    x = hp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 140) * 0.6
    x += np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 90)
    return norm(x, 0.6)


def stamp(d=0.45):
    tt = t(d)
    f = 110 * np.exp(-tt * 6) + 45
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11)
    hit = lp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 45)
    x = np.tanh(2.2 * (body + 0.6 * hit))
    return norm(x, 0.9)


def ding(d=1.0):
    tt = t(d)
    x = np.zeros(len(tt))
    for f, st, a in [(1046.5, 0.0, 0.7), (1568.0, 0.11, 1.0)]:
        tt2 = np.clip(tt - st, 0, None)
        on = (tt >= st).astype(float)
        x += a * on * np.exp(-tt2 * 5.5) * (np.sin(2 * np.pi * f * tt2) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt2))
    return norm(x, 0.7)


def riser(d=1.1):
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):
        fc = 300 + 7000 * (i / n) ** 2
        out[i:i + blk] = lp(noise[i:i + blk], fc, 2)
    env = np.linspace(0, 1, n) ** 2
    env[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
    return norm(out * env, 0.6)


# ------------------------------------------------------------------ trilha
BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def hz(name, octave):
    return 440 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


CHORDS = [('C', ['C', 'E', 'G']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C', 'E']), ('F', ['F', 'A', 'C'])]


def saw(f, tt):
    return 2 * ((f * tt) % 1) - 1


def pad_note(f, d):
    tt = t(d)
    x = sum(saw(f * r, tt) for r in (1, 1.004, 0.996)) / 3
    a = np.minimum(1, tt / 0.35)
    r = np.minimum(1, (d - tt) / 0.4)
    return lp(x, 1400, 2) * a * r


def pluck(f, d=0.35):
    tt = t(d)
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) + 0.15 * saw(f, tt)) * np.exp(-tt * 11)
    return lp(x, 3200, 2)


def bass(f, d):
    tt = t(d)
    x = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt)
    env = np.exp(-tt * 3.5) * (1 - np.exp(-tt * 400))
    return np.tanh(1.4 * x) * env


def kick():
    tt = t(0.32)
    f = 48 + 110 * np.exp(-tt * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def hat(open_=False):
    tt = t(0.14 if open_ else 0.05)
    return hp(rng.standard_normal(len(tt)), 7500) * np.exp(-tt * (25 if open_ else 90))


def clap():
    tt = t(0.2)
    x = np.zeros(len(tt))
    for k, off in enumerate((0, 0.011, 0.023)):
        tt2 = np.clip(tt - off, 0, None)
        x += (tt >= off) * bp(rng.standard_normal(len(tt)), 900, 4200) * np.exp(-tt2 * (60 if k < 2 else 22))
    return x


def crash():
    tt = t(1.8)
    return hp(rng.standard_normal(len(tt)), 4000) * np.exp(-tt * 2.2) * 0.8


def place(buf, clip, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[:j - i] * gain


def music(total, groove=2, full_bar=5, arp_bar=7, crash_bar=15):
    n = int(total * SR) + SR
    pads = np.zeros(n); plk = np.zeros(n); bs = np.zeros(n); drm = np.zeros(n); arp = np.zeros(n)
    bars = int(np.ceil(total / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        root, notes = CHORDS[b % 4]
        full = b >= full_bar
        in_groove = b >= groove
        ending = t0 + BAR > total - 0.2
        for nm in notes:
            oc = 4 if nm in ('C', 'D', 'E', 'F') or root in ('C',) else 3
            place(pads, pad_note(hz(nm, oc), BAR + 0.25), t0, 0.22)
        # plucks nos contratempos
        for k in range(8):
            if k % 2 == 1 or full:
                nm = notes[(k // 2) % 3]
                place(plk, pluck(hz(nm, 5)), t0 + k * BEAT / 2, 0.16 if k % 2 else 0.1)
        if in_groove:
            for k in range(4):
                if full or k in (0, 2):
                    place(drm, kick(), t0 + k * BEAT, 0.85 if full else 0.55)
                for h in range(2):
                    place(drm, hat(open_=(h == 1 and k == 3)), t0 + k * BEAT + h * BEAT / 2, 0.22 if h else 0.12)
        if full:
            for k in (1, 3):
                place(drm, clap(), t0 + k * BEAT, 0.5)
            for k in range(8):
                place(bs, bass(hz(root, 2), BEAT / 2 * 0.95), t0 + k * BEAT / 2, 0.55)
            if b >= arp_bar:
                seq = [notes[0], notes[1], notes[2], notes[1]]
                for k in range(16):
                    nm = seq[k % 4]
                    place(arp, pluck(hz(nm, 6), 0.18), t0 + k * BEAT / 4, 0.05)
        if crash_bar is not None and b == crash_bar:
            place(drm, crash(), t0, 0.35)
    mix = pads + plk + bs + drm + arp
    mix = np.tanh(1.1 * mix)
    return mix[:int(total * SR)]


if __name__ == '__main__':
    import json, sys
    total = float(sys.argv[1]) if len(sys.argv) > 1 else 38.3
    sfx = {
        'whoosh': whoosh(), 'whoosh_s': whoosh(0.35), 'pop': pop(), 'pop_lo': pop(560), 'pop_hi': pop(1100),
        'tick': tick(), 'tick_hi': tick(3400), 'stamp': stamp(), 'ding': ding(), 'riser': riser(),
    }
    for k, v in sfx.items():
        sf.write(f'sfx-{k}.wav', v.astype(np.float32), SR)
    m = music(total)
    fade = int(1.2 * SR)
    m[-fade:] *= np.linspace(1, 0, fade)
    sf.write('trilha.wav', norm(m, 0.89).astype(np.float32), SR)
    print('ok', total, {k: round(len(v) / SR, 2) for k, v in sfx.items()})
