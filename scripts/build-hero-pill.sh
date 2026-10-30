#!/usr/bin/env bash
# Build public/video/hero-pill.mp4 — the reel that lives inside the hero pill.
#
# Four real F-Ex photographs, each with a slow push/pan, cross-dissolved, then
# the whole sequence is mirrored and concatenated so the loop point is a perfect
# match (last frame == first frame). No stock footage, no CDN: the file is
# self-hosted next to the rest of the media.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=node_modules/ffmpeg-static/ffmpeg
TMP=$(mktemp -d)
FPS=25
SHOT=2.0        # seconds per shot
FADE=0.5        # cross-dissolve
W=1280
H=552           # 2.32:1 — matches the pill's video box (4.2em x 1.81em)

# image | zoom end | pan direction (dx in px of the 2400px master)
SHOTS=(
  "public/images/photo-1592750475338-74b7b21085ab.jpg|1.07|0"
  "public/images/accessories-flatlay.jpg|1.05|-18"
  "public/images/photo-1510557880182-3d4d3cba35a5.jpg|1.08|22"
  "public/images/repair-macro.jpg|1.06|-14"
)

i=0
for spec in "${SHOTS[@]}"; do
  IFS='|' read -r img z dx <<< "$spec"
  $FF -y -loglevel error -loop 1 -t "$SHOT" -i "$img" \
    -vf "scale=2400:-2,crop=2400:1322,zoompan=z='1+($z-1)*on/50':x='iw/2-(iw/zoom/2)+($dx)*on/50':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p" \
    -c:v libx264 -crf 18 -preset veryfast "$TMP/s$i.mp4"
  i=$((i+1))
done

# cross-dissolve 4 shots -> one 6.5s sequence
$FF -y -loglevel error \
  -i "$TMP/s0.mp4" -i "$TMP/s1.mp4" -i "$TMP/s2.mp4" -i "$TMP/s3.mp4" \
  -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=1.5[a];\
[a][2:v]xfade=transition=fade:duration=${FADE}:offset=3.0[b];\
[b][3:v]xfade=transition=fade:duration=${FADE}:offset=4.5,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -crf 16 -preset veryfast "$TMP/seq.mp4"

# mirror + concat: seamless by construction
$FF -y -loglevel error -i "$TMP/seq.mp4" -filter_complex \
  "[0:v]split[f][r];[r]reverse[rv];[f][rv]concat=n=2:v=1:a=0,fps=${FPS}[v]" \
  -map "[v]" -an \
  -c:v libx264 -crf 29 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart \
  public/video/hero-pill.mp4

# poster = first frame
$FF -y -loglevel error -i public/video/hero-pill.mp4 -frames:v 1 -q:v 4 public/video/hero-pill.jpg

rm -rf "$TMP"
ls -la public/video/hero-pill.mp4 public/video/hero-pill.jpg
