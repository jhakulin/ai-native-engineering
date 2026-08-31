#!/usr/bin/env python3
"""Search YouTube videos for a topic and rank recent/popular candidates.

Requires:
    YOUTUBE_API_KEY

Optional:
    YOUTUBE_SEARCH_DEFAULT_MAX_RESULTS defaults to 5
    YOUTUBE_SEARCH_CANDIDATE_POOL defaults to 25
    YOUTUBE_SEARCH_DEFAULT_SORT defaults to popular_recent
    YOUTUBE_SEARCH_ENV_FILE overrides the default env file location

Usage:
    python3 youtube_search.py "AI harness engineering"
    python3 youtube_search.py "AI harness engineering" --sort latest --max-results 10
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError as exc:
    print(
        "Error: missing Python dependency 'google-api-python-client'. "
        "Install it with: python3 -m pip install google-api-python-client",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc

SORT_CHOICES = ("popular_recent", "latest", "most_liked", "view_count", "relevance")
API_ORDER = {
    "popular_recent": "date",
    "latest": "date",
    "most_liked": "relevance",
    "view_count": "viewCount",
    "relevance": "relevance",
}


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
    """Load local skill configuration if values were not exported by the shell."""
    script_path = Path(__file__).resolve()
    skill_dir = script_path.parents[1]
    user_env_paths = [
        Path("~/.config/ai-harness/youtube-search.env").expanduser(),
        Path("~/.config/agents-skills/youtube-search.env").expanduser(),
    ]

    configured_path = os.environ.get("YOUTUBE_SEARCH_ENV_FILE")
    if configured_path:
        load_env_file(Path(configured_path).expanduser())

    for user_env_path in user_env_paths:
        load_env_file(user_env_path)
    load_env_file(skill_dir / ".env")


def env_int(name: str, default: int, minimum: int, maximum: int) -> int:
    value = os.environ.get(name)
    if not value:
        return default
    try:
        parsed = int(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if parsed < minimum or parsed > maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}")
    return parsed


def parse_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        date = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("--published-after must be an ISO date, such as 2025-01-01") from exc
    if date.tzinfo is None:
        date = date.replace(tzinfo=timezone.utc)
    return date.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_args() -> argparse.Namespace:
    load_local_env()
    default_max_results = env_int("YOUTUBE_SEARCH_DEFAULT_MAX_RESULTS", 5, 1, 50)
    default_candidate_pool = env_int("YOUTUBE_SEARCH_CANDIDATE_POOL", 25, 1, 50)
    default_sort = os.environ.get("YOUTUBE_SEARCH_DEFAULT_SORT", "popular_recent")
    if default_sort not in SORT_CHOICES:
        raise ValueError(f"YOUTUBE_SEARCH_DEFAULT_SORT must be one of: {', '.join(SORT_CHOICES)}")

    parser = argparse.ArgumentParser(description="Search YouTube videos for a topic")
    parser.add_argument("query", help="YouTube search query")
    parser.add_argument("--max-results", type=int, default=default_max_results, help="Number of videos to return")
    parser.add_argument("--candidate-pool", type=int, default=default_candidate_pool, help="Number of candidates to fetch before local ranking")
    parser.add_argument("--sort", choices=SORT_CHOICES, default=default_sort, help="Ranking strategy")
    parser.add_argument("--published-after", help="Only include videos after this ISO date, such as 2025-01-01")
    args = parser.parse_args()

    if args.max_results < 1 or args.max_results > 50:
        parser.error("--max-results must be between 1 and 50")
    if args.candidate_pool < 1 or args.candidate_pool > 50:
        parser.error("--candidate-pool must be between 1 and 50")
    if args.candidate_pool < args.max_results:
        args.candidate_pool = args.max_results
    args.published_after = parse_date(args.published_after)
    return args


def get_youtube_client():
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "missing YOUTUBE_API_KEY. Export it, add it to ~/.config/ai-harness/youtube-search.env, "
            "or add it to skills/search-youtube-videos/.env"
        )
    return build("youtube", "v3", developerKey=api_key)


def search_video_ids(youtube: Any, query: str, sort: str, candidate_pool: int, published_after: str | None) -> list[str]:
    request_params: dict[str, Any] = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "order": API_ORDER[sort],
        "maxResults": candidate_pool,
    }
    if published_after:
        request_params["publishedAfter"] = published_after

    request = youtube.search().list(**request_params)
    response = request.execute()
    ids: list[str] = []
    for item in response.get("items", []):
        video_id = item.get("id", {}).get("videoId")
        if video_id and video_id not in ids:
            ids.append(video_id)
    return ids


def fetch_video_details(youtube: Any, video_ids: list[str]) -> list[dict[str, Any]]:
    if not video_ids:
        return []
    request = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=",".join(video_ids),
    )
    response = request.execute()
    videos_by_id: dict[str, dict[str, Any]] = {}
    for item in response.get("items", []):
        snippet = item.get("snippet", {}) or {}
        stats = item.get("statistics", {}) or {}
        content_details = item.get("contentDetails", {}) or {}
        video_id = item.get("id")
        like_count = to_optional_int(stats.get("likeCount"))
        comment_count = to_optional_int(stats.get("commentCount"))
        view_count = to_optional_int(stats.get("viewCount"))
        missing_statistics = [
            name
            for name, value in (
                ("view_count", view_count),
                ("like_count", like_count),
                ("comment_count", comment_count),
            )
            if value is None
        ]
        videos_by_id[video_id] = {
            "video_id": video_id,
            "title": snippet.get("title"),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "channel_title": snippet.get("channelTitle"),
            "channel_id": snippet.get("channelId"),
            "published_at": snippet.get("publishedAt"),
            "description": snippet.get("description"),
            "thumbnail_url": pick_thumbnail(snippet.get("thumbnails") or {}),
            "duration_seconds": parse_duration_seconds(content_details.get("duration")),
            "view_count": view_count,
            "like_count": like_count,
            "comment_count": comment_count,
            "missing_statistics": missing_statistics,
            "engagement_score": engagement_score(view_count, like_count, comment_count),
        }
    return [videos_by_id[video_id] for video_id in video_ids if video_id in videos_by_id]


def parse_duration_seconds(value: str | None) -> int | None:
    if not value or not value.startswith("PT"):
        return None
    import re
    match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value)
    if not match:
        return None
    hours, minutes, seconds = (int(part or 0) for part in match.groups())
    return hours * 3600 + minutes * 60 + seconds


def to_optional_int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def engagement_score(*values: int | None) -> int:
    return sum(value for value in values if value is not None)


def pick_thumbnail(thumbnails: dict[str, Any]) -> str | None:
    for key in ("high", "medium", "default"):
        item = thumbnails.get(key) or {}
        if item.get("url"):
            return item["url"]
    return None


def rank_videos(videos: list[dict[str, Any]], sort: str) -> list[dict[str, Any]]:
    if sort == "popular_recent":
        return sorted(videos, key=lambda item: item["engagement_score"], reverse=True)
    if sort == "most_liked":
        return sorted(
            videos,
            key=lambda item: (item["like_count"] is not None, item["like_count"] or 0),
            reverse=True,
        )
    # latest, view_count, and relevance preserve YouTube API order.
    return videos


def sorting_confidence(sort: str) -> str:
    if sort in {"latest", "view_count", "relevance"}:
        return "exact"
    return "approximate"


def main() -> int:
    try:
        args = parse_args()
        youtube = get_youtube_client()
        video_ids = search_video_ids(
            youtube,
            query=args.query,
            sort=args.sort,
            candidate_pool=args.candidate_pool,
            published_after=args.published_after,
        )
        videos = fetch_video_details(youtube, video_ids)
        ranked = rank_videos(videos, args.sort)[: args.max_results]
        result = {
            "query": args.query,
            "sort": args.sort,
            "sorting_confidence": sorting_confidence(args.sort),
            "max_results": args.max_results,
            "candidate_pool": args.candidate_pool,
            "published_after": args.published_after,
            "results": ranked,
            "caveats": caveats_for_sort(args.sort, ranked),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except HttpError as exc:
        print(f"YouTube API error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"YouTube search failed: {exc}", file=sys.stderr)
        return 1


def caveats_for_sort(sort: str, videos: list[dict[str, Any]]) -> list[str]:
    caveats: list[str] = []
    if sort == "popular_recent":
        caveats.append("popular_recent ranks recent candidate videos locally by views plus likes plus comments; it is approximate within the fetched candidate pool.")
    elif sort == "most_liked":
        caveats.append("most_liked ranks only the fetched candidate pool because YouTube search does not provide global like-count ordering.")

    if any(video.get("missing_statistics") for video in videos):
        caveats.append("Some videos did not expose all statistics; missing counts are reported as null and excluded from local ranking scores.")
    return caveats


if __name__ == "__main__":
    raise SystemExit(main())
