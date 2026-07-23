#!/usr/bin/env python3
"""Fetch a YouTube transcript for one video ID or URL.

Requires Webshare proxy credentials:
    WEBSHARE_PROXY_USERNAME
    WEBSHARE_PROXY_PASSWORD

Optional:
    WEBSHARE_PROXY_LOCATIONS defaults to "us,ca"
    YOUTUBE_TRANSCRIPTION_ENV_FILE overrides the default env file location

Usage:
    python3 youtube_transcription.py dQw4w9WgXcQ
    python3 youtube_transcription.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    from youtube_transcript_api import (
        NoTranscriptFound,
        TranscriptsDisabled,
        VideoUnavailable,
        YouTubeTranscriptApi,
    )
    from youtube_transcript_api.proxies import WebshareProxyConfig
except ImportError as exc:
    print(
        "Error: missing Python dependency 'youtube_transcript_api'. "
        "Install it with: python3 -m pip install youtube_transcript_api",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


def extract_video_id(value: str) -> str:
    """Extract a YouTube video ID from a bare ID or common YouTube URL formats."""
    candidate = value.strip()

    if re.fullmatch(r"[0-9A-Za-z_-]{11}", candidate):
        return candidate

    parsed = urlparse(candidate)
    hostname = (parsed.hostname or "").lower()

    if "youtube.com" in hostname:
        query = parse_qs(parsed.query)
        if query.get("v") and re.fullmatch(r"[0-9A-Za-z_-]{11}", query["v"][0]):
            return query["v"][0]

        parts = [part for part in parsed.path.split("/") if part]
        for prefix in ("shorts", "embed", "v"):
            if prefix in parts:
                index = parts.index(prefix)
                if index + 1 < len(parts):
                    video_id = parts[index + 1]
                    if re.fullmatch(r"[0-9A-Za-z_-]{11}", video_id):
                        return video_id

    if "youtu.be" in hostname:
        video_id = parsed.path.lstrip("/").split("/")[0]
        if re.fullmatch(r"[0-9A-Za-z_-]{11}", video_id):
            return video_id

    match = re.search(r"([0-9A-Za-z_-]{11})", candidate)
    if match:
        return match.group(1)

    raise ValueError(f"could not extract a YouTube video ID from: {value}")


def load_env_file(path: Path) -> None:
    """Load simple KEY=VALUE pairs without overriding existing environment."""
    if not path.is_file():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


def load_local_env() -> None:
    """Load local skill credentials if they were not exported by the shell."""
    script_path = Path(__file__).resolve()
    skill_dir = script_path.parents[1]
    user_env_paths = [
        Path("~/.config/ai-harness/youtube-transcription.env").expanduser(),
        Path("~/.config/agents-skills/youtube-transcription.env").expanduser(),
    ]

    configured_path = os.environ.get("YOUTUBE_TRANSCRIPTION_ENV_FILE")
    if configured_path:
        load_env_file(Path(configured_path).expanduser())

    for user_env_path in user_env_paths:
        load_env_file(user_env_path)
    load_env_file(skill_dir / ".env")


def get_proxy_config() -> WebshareProxyConfig:
    """Build Webshare proxy configuration from environment variables."""
    load_local_env()

    username = os.environ.get("WEBSHARE_PROXY_USERNAME")
    password = os.environ.get("WEBSHARE_PROXY_PASSWORD")

    if not username or not password:
        raise RuntimeError(
            "Webshare proxy configuration is missing. Set "
            "WEBSHARE_PROXY_USERNAME and WEBSHARE_PROXY_PASSWORD."
        )

    locations = os.environ.get("WEBSHARE_PROXY_LOCATIONS", "us,ca")
    location_list = [item.strip() for item in locations.split(",") if item.strip()]

    return WebshareProxyConfig(
        proxy_username=username,
        proxy_password=password,
        filter_ip_locations=location_list,
    )


def fetch_transcript(video_id: str) -> str:
    """Fetch transcript text for a YouTube video ID."""
    api = YouTubeTranscriptApi(proxy_config=get_proxy_config())
    data = api.fetch(video_id=video_id)

    try:
        segments = data.to_raw_data()
    except AttributeError:
        segments = data if isinstance(data, list) else []

    transcript = " ".join(
        segment.get("text", "").strip()
        for segment in segments
        if segment.get("text")
    ).strip()

    if not transcript:
        raise RuntimeError("transcript is empty")

    return transcript


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: youtube_transcription.py <video-id-or-url>", file=sys.stderr)
        return 2

    try:
        video_id = extract_video_id(sys.argv[1])
        transcript = fetch_transcript(video_id)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except TranscriptsDisabled:
        print("Error: transcripts are disabled for this video", file=sys.stderr)
        return 1
    except NoTranscriptFound as exc:
        print(f"Error: no transcript found for this video: {exc}", file=sys.stderr)
        return 1
    except VideoUnavailable:
        print("Error: video is unavailable", file=sys.stderr)
        return 1
    except Exception as exc:
        message = str(exc)
        lower_message = message.lower()
        if any(term in lower_message for term in ("blocked", "429", "403", "rate limit")):
            print(
                "Error: YouTube blocked the transcript request. Check Webshare "
                "configuration and retry.",
                file=sys.stderr,
            )
        else:
            print(f"Error: {message}", file=sys.stderr)
        return 1

    print(transcript)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
