#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: run_youtube_transcription.sh <video-id-or-url>" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_VENV_DIR="$HOME/.cache/ai-harness/venvs/youtube-transcription"
LEGACY_VENV_DIR="$HOME/.cache/agents-skills/venvs/youtube-transcription"

if [ -n "${YOUTUBE_TRANSCRIPTION_VENV_DIR:-}" ]; then
  VENV_DIR="$YOUTUBE_TRANSCRIPTION_VENV_DIR"
elif [ -x "$LEGACY_VENV_DIR/bin/python" ] && [ ! -x "$DEFAULT_VENV_DIR/bin/python" ]; then
  VENV_DIR="$LEGACY_VENV_DIR"
else
  VENV_DIR="$DEFAULT_VENV_DIR"
fi
PYTHON_BIN="$VENV_DIR/bin/python"

if [ ! -x "$PYTHON_BIN" ]; then
  python3 -m venv "$VENV_DIR"
  "$PYTHON_BIN" -m pip install -r "$SKILL_DIR/requirements.txt" >&2
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/youtube_transcription.py" "$1"
