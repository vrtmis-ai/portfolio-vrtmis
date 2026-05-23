#!/usr/bin/env bash
# build-case-videos.sh — generates the LONG case-study video.mp4 for each project.
#
# Card hover loops use preview.mp4 (the 7s Remotion brutalist teaser).
# The case-study page at /work/<slug> uses video.mp4 — a 25-30s extract
# from the original source at higher quality (1920×1080 landscape, with
# audio if present).
#
# Run from anywhere:
#   bash portfolio/scripts/build-case-videos.sh

set -e
FFMPEG="/c/Users/Home/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe"
SRC="/c/Users/Home/Desktop/porjects/media"
DST="/c/Users/Home/Desktop/porjects/portfolio/public/work"

# Args: slug, source-path, start-seconds, duration-seconds
make_case_video() {
  local slug="$1"; local src="$2"; local start="$3"; local dur="${4:-30}"
  echo "→ $slug   ${dur}s starting at ${start}s"
  "$FFMPEG" -y -ss "$start" -i "$src" -t "$dur" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30" \
    -c:v libx264 -preset slow -crf 22 -movflags +faststart \
    -c:a aac -b:a 128k -ac 2 \
    "$DST/$slug/video.mp4" 2>&1 | tail -1
  echo "  $(du -h "$DST/$slug/video.mp4" | awk '{print $1}')"
}

# 30-second highlight extracts from the strongest part of each source
make_case_video tehran-univ-of-art "$SRC/Mapping event/Mapping event/Tehran Art University event visual mapping.mp4"  50  30
make_case_video my-baby             "$SRC/Mapping event/Mapping event/My baby X event mapping .mp4"                  30  30
make_case_video oliver-twist        "$SRC/ai/Ai/Oliver Twist-teaser ai.mp4"                                            2  30
make_case_video music-video-vfx     "$SRC/ai/Ai/Vfx ai -music video .mp4"                                              0  28
make_case_video esteghlal           "$SRC/Mapping event/Mapping event/Esteghlal.mp4"                                  30  30
make_case_video tigard              "$SRC/Mapping event/Mapping event/Event mapping-Tigard .mp4"                       5  30
make_case_video u-bank              "$SRC/composit/Composition vfx/U bank_.mp4"                                        5  30
make_case_video cgi-carkook         "$SRC/composit/Composition vfx/CGI-Carkook.mp4"                                    5  30
make_case_video serkan-filter       "$SRC/composit/Composition vfx/Ad roll-serkan filter.mp4"                          0  22
make_case_video fashion-documentary "$SRC/Edit/Edit/intro-Fashion Documentary.MP4"                                     0  24

echo ""
echo "✓ all case videos rendered"
