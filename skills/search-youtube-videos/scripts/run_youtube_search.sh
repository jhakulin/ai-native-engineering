#!/bin/sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: run_youtube_search.sh <query> [--max-results N] [--candidate-pool N] [--sort popular_recent|latest|most_liked|view_count|relevance] [--published-after YYYY-MM-DD]" >&2
  exit 2
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -n "${YOUTUBE_SEARCH_VENV_DIR:-}" ]; then
  VENV_DIR="$YOUTUBE_SEARCH_VENV_DIR"
else
  if [ -n "${XDG_CACHE_HOME:-}" ]; then
    CACHE_HOME="$XDG_CACHE_HOME"
  elif [ -n "${HOME:-}" ]; then
    CACHE_HOME="$HOME/.cache"
  else
    echo "Error: HOME or XDG_CACHE_HOME must be set, or set YOUTUBE_SEARCH_VENV_DIR to an existing virtualenv path." >&2
    exit 1
  fi
  DEFAULT_VENV_DIR="$CACHE_HOME/ai-harness/venvs/youtube-search"
  LEGACY_VENV_DIR="$CACHE_HOME/agents-skills/venvs/youtube-search"
  if [ -x "$LEGACY_VENV_DIR/bin/python" ] && [ ! -x "$DEFAULT_VENV_DIR/bin/python" ]; then
    VENV_DIR="$LEGACY_VENV_DIR"
  else
    VENV_DIR="$DEFAULT_VENV_DIR"
  fi
fi
PYTHON_BIN="$VENV_DIR/bin/python"

if [ ! -x "$PYTHON_BIN" ]; then
  if [ -n "${YOUTUBE_SEARCH_VENV_DIR:-}" ]; then
    echo "Error: YOUTUBE_SEARCH_VENV_DIR does not contain an executable bin/python: $YOUTUBE_SEARCH_VENV_DIR" >&2
    exit 1
  fi
  PYTHON_BOOTSTRAP="$(command -v python3 || true)"
  if [ -z "$PYTHON_BOOTSTRAP" ]; then
    echo "Error: python3 not found on PATH. Install python3 or set YOUTUBE_SEARCH_VENV_DIR to an existing virtualenv." >&2
    exit 1
  fi
  "$PYTHON_BOOTSTRAP" -m venv "$VENV_DIR"
  "$PYTHON_BIN" -m pip install -r "$SKILL_DIR/requirements.txt" >&2
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/youtube_search.py" "$@"
