"""Renderiza os slides do PRUMO Hub (1080x1350, JPEG).

Uso: python3 sistema/render.py post.json pasta_saida
O post.json segue o modelo descrito em INSTRUCOES.md.
"""
import os, re, io, cairosvg
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1350
FD = os.path.join(BASE, "fontes") + "/"
BOLD, MED, REG = FD + "Poppins-Bold.ttf", FD + "Poppins-Medium.ttf", FD + "Poppins-Regular.ttf"
LOGO_SVG = os.path.join(BASE, "PRUMO.svg")
GOLD = (235, 203, 94)
TERRA = (201, 104, 58)
WHITE = (255, 255, 255)
SOFT = (214, 231, 220)
TOP, BOT = (8, 52, 36), (3, 22, 15)


def font(p, s):
    return ImageFont.truetype(p, s)


def fundo():
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(TOP[i] + (BOT[i] - TOP[i]) * t) for i in range(3)))
    # brilho suave no canto superior esquerdo
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([-400, -500, 700, 500], fill=60)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    im = Image.composite(Image.new("RGB", (W, H), (30, 110, 70)), im, glow)
    return im.convert("RGBA")


def logo(alvo_h=120):
    s = open(LOGO_SVG).read()
    s = re.sub(r'<rect x="-150"[^>]*/>', "", s)
    png = cairosvg.svg2png(bytestring=s.encode(), output_width=2400)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    im = im.crop(im.getbbox())
    r = alvo_h / im.height
    im = im.resize((int(im.width * r), alvo_h), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=95, threshold=2))


LOGO = logo(160)


def por_logo(im):
    x, y = W - LOGO.width - 60, 56
    sombra = Image.new("RGBA", im.size, (0, 0, 0, 0))
    m = LOGO.split()[3].point(lambda a: int(a * 0.7))
    sombra.paste((0, 0, 0, 255), (x + 3, y + 4), m)
    sombra = sombra.filter(ImageFilter.GaussianBlur(7))
    im.alpha_composite(sombra)
    im.alpha_composite(LOGO, (x, y))


def quebra(texto, f, larg, d):
    linhas = []
    for par in texto.split("\n"):
        atual = ""
        for p in par.split():
            teste = (atual + " " + p).strip()
            if d.textlength(teste, font=f) <= larg:
                atual = teste
            else:
                linhas.append(atual)
                atual = p
        linhas.append(atual)
    return linhas


def bloco(d, x, y, texto, f, cor, larg, entre=1.18, destaque=None):
    """destaque: lista de palavras pintadas de dourado"""
    destaque = [w.lower() for w in (destaque or [])]
    for ln in quebra(texto, f, larg, d):
        cx = x
        for i, p in enumerate(ln.split(" ")):
            limpa = re.sub(r"[^\wÀ-ú]", "", p).lower()
            c = GOLD if limpa in destaque else cor
            d.text((cx, y), p, font=f, fill=c)
            cx += d.textlength(p + " ", font=f)
        y += int(f.size * entre)
    return y


def selo(d, x, y, texto, cor=GOLD):
    f = font(BOLD, 26)
    w = d.textlength(texto, font=f)
    d.rounded_rectangle([x, y, x + w + 44, y + 52], radius=26, outline=cor, width=3)
    d.text((x + 22, y + 9), texto, font=f, fill=cor)


def rodape(d, n, total):
    f = font(MED, 26)
    d.text((70, H - 92), "PRUMO Hub", font=f, fill=SOFT)
    t = f"{n}/{total}"
    d.text((W - 70 - d.textlength(t, font=f), H - 92), t, font=f, fill=SOFT)
    if n < total:
        d.text((W / 2 - 60, H - 92), "arraste ›", font=f, fill=GOLD)


def numero(d, x, y, n):
    d.ellipse([x, y, x + 84, y + 84], fill=GOLD)
    f = font(BOLD, 44)
    w = d.textlength(str(n), font=f)
    d.text((x + 42 - w / 2, y + 12), str(n), font=f, fill=BOT)


def slide_capa(s, n, total):
    im = fundo(); por_logo(im); d = ImageDraw.Draw(im)
    selo(d, 70, 360, s["selo"])
    y = bloco(d, 70, 460, s["titulo"], font(BOLD, 92), WHITE, 940, 1.12, s.get("destaque"))
    d.rectangle([70, y + 40, 190, y + 48], fill=TERRA)
    bloco(d, 70, y + 90, s["sub"], font(MED, 38), SOFT, 900, 1.35)
    rodape(d, n, total)
    return im


def slide_texto(s, n, total):
    im = fundo(); por_logo(im); d = ImageDraw.Draw(im)
    numero(d, 70, 330, s["num"])
    y = bloco(d, 70, 470, s["titulo"], font(BOLD, 68), WHITE, 940, 1.15, s.get("destaque"))
    y = bloco(d, 70, y + 50, s["texto"], font(REG, 41), SOFT, 930, 1.42)
    if s.get("fonte"):
        f = font(MED, 28)
        d.rounded_rectangle([70, y + 40, 70 + d.textlength(s["fonte"], font=f) + 40, y + 98], radius=12, outline=(120, 160, 140), width=2)
        d.text((90, y + 52), s["fonte"], font=f, fill=SOFT)
    rodape(d, n, total)
    return im


def slide_cta(s, n, total):
    im = fundo(); d = ImageDraw.Draw(im)
    big = logo(300)
    im.alpha_composite(big, ((W - big.width) // 2, 200))
    d = ImageDraw.Draw(im)
    f = font(BOLD, 64)
    y = 600
    for ln in quebra(s["titulo"], f, 900, d):
        d.text(((W - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill=WHITE); y += 76
    f2 = font(REG, 36)
    y += 24
    for ln in quebra(s["texto"], f2, 860, d):
        d.text(((W - d.textlength(ln, font=f2)) / 2, y), ln, font=f2, fill=SOFT); y += 52
    fb = font(BOLD, 40)
    bw = d.textlength(s["botao"], font=fb) + 100
    bx, by = (W - bw) / 2, y + 60
    d.rounded_rectangle([bx, by, bx + bw, by + 96], radius=48, fill=GOLD)
    d.text((bx + 50, by + 22), s["botao"], font=fb, fill=BOT)
    fs = font(MED, 34)
    d.text(((W - d.textlength(s["site"], font=fs)) / 2, by + 140), s["site"], font=fs, fill=GOLD)
    return im


def slide_unico(s, n, total):
    """Post de imagem unica: frase forte + assinatura com site."""
    im = fundo(); por_logo(im); d = ImageDraw.Draw(im)
    if s.get("selo"):
        selo(d, 70, 380, s["selo"])
    y = bloco(d, 70, 480, s["titulo"], font(BOLD, 88), WHITE, 940, 1.12, s.get("destaque"))
    d.rectangle([70, y + 40, 190, y + 48], fill=TERRA)
    if s.get("sub"):
        bloco(d, 70, y + 90, s["sub"], font(MED, 38), SOFT, 900, 1.35)
    f = font(MED, 30)
    d.text((70, H - 100), "PRUMO Hub", font=f, fill=SOFT)
    t = "hub.prumo.site"
    d.text((W - 70 - d.textlength(t, font=f), H - 100), t, font=f, fill=GOLD)
    return im


def render(slides, pasta):
    os.makedirs(pasta, exist_ok=True)
    fn = {"capa": slide_capa, "texto": slide_texto, "cta": slide_cta, "unico": slide_unico}
    out = []
    for i, s in enumerate(slides, 1):
        p = f"{pasta}/slide_{i:02d}.jpg"
        fn[s["tipo"]](s, i, len(slides)).convert("RGB").save(p, "JPEG", quality=92, optimize=True)
        out.append(p)
    return out


if __name__ == "__main__":
    import json, sys
    dados = json.load(open(sys.argv[1]))
    print(render(dados["slides"], sys.argv[2]))
