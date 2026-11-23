#!/usr/bin/env bash
# Gera um Reels semanal completo (vídeo + áudio) a partir de um roteiro JSON.
# Uso: bash video/gerar.sh caminho/roteiro.json caminho/saida.mp4
set -euo pipefail
ROTEIRO="$(realpath "$1")"
SAIDA="$(realpath -m "$2")"
cd "$(dirname "$0")"
mkdir -p out
[ -d node_modules ] || npm ci --silent
python3 -c "import soundfile, pyloudnorm, scipy" 2>/dev/null || pip install --break-system-packages -q soundfile pyloudnorm scipy
BROWSER=$(find /opt/pw-browsers -type f \( -name chrome-headless-shell -o -name headless_shell \) 2>/dev/null | head -1)
npx remotion render src/index.ts Semanal out/video.mp4 --props="$ROTEIRO" \
  ${BROWSER:+--browser-executable="$BROWSER"} --codec=h264 --crf=20 --jpeg-quality=90 --log=error
python3 audio/mixa_semanal.py "$ROTEIRO" out/audio.wav
ffmpeg -v error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$SAIDA"
echo "pronto: $SAIDA"
