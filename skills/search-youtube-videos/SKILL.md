---
name: search-youtube-videos
description: Search YouTube for recent, popular, latest, or most-liked videos about a topic and return candidate videos with metadata. Use when the user asks to find, discover, list, or compare YouTube videos and the agent can run local repository scripts with a YouTube Data API key. Do not use to fetch transcripts, summarize a known video, process playlists or channels in bulk, or search non-YouTube sources except as needed to find YouTube watch URLs.
---

# Search YouTube Videos

## Overview

Find relevant YouTube video candidates for a topic and return a concise shortlist the user can choose from. By default, the local script searches recent candidate videos and ranks them by popularity signals.

This skill discovers videos only. It does not fetch transcripts or summarize video content. Use `get-youtube-transcription` only after the user selects a specific video URL or ID.

For first-time setup, see `skills/search-youtube-videos/references/setup.md`.

## Workflow

1. Confirm the request contains one search topic or query. If the request is too broad, ask for a narrower topic or selection criteria.
2. Identify requested constraints:
   - maximum results, if provided
   - sort preference: `popular_recent`, `latest`, `most_liked`, `view_count`, or `relevance`
   - freshness filter, such as videos after a specific date
3. Confirm the current environment can execute local shell commands from this repository, use `python3` with `venv` and pip support, make network requests, and access `YOUTUBE_API_KEY`. If any capability is unavailable, do not attempt script-backed search; explain the blocker and provide the local setup/run instructions from `skills/search-youtube-videos/references/setup.md`.
4. Ensure YouTube search configuration is available through exported environment variables, `~/.config/ai-harness/youtube-search.env`, or `skills/search-youtube-videos/.env`. Use `.env.example` as the placeholder format; do not commit real credentials.
5. Before running the wrapper, get approval if the execution environment requires approval for dependency downloads or network requests to the YouTube Data API.
6. Run the bundled wrapper from the repository root:
   ```bash
   skills/search-youtube-videos/scripts/run_youtube_search.sh "<query>"
   ```
   Add options only when needed:
   ```bash
   skills/search-youtube-videos/scripts/run_youtube_search.sh "<query>" --max-results 10 --sort popular_recent --candidate-pool 50 --published-after 2025-01-01
   ```
7. Interpret the JSON output and return a concise candidate list. Preserve the reported `sort`, `sorting_confidence`, and caveats.
8. If dependency, API key, quota, or YouTube API errors occur, report the specific failure without exposing credentials.

## Sort Modes

- `popular_recent` default: fetch recent candidate videos, fetch statistics, then rank locally by views plus likes plus comments.
- `latest`: use YouTube API date ordering.
- `most_liked`: fetch candidate videos, fetch statistics, then rank locally by like count.
- `view_count`: use YouTube API view-count ordering.
- `relevance`: use YouTube API relevance ordering.

`popular_recent` and `most_liked` are approximate because YouTube does not provide global like-count ordering for a topic. They rank only the fetched candidate pool.

Defaults can be configured with:

```text
YOUTUBE_SEARCH_DEFAULT_MAX_RESULTS=5
YOUTUBE_SEARCH_CANDIDATE_POOL=25
YOUTUBE_SEARCH_DEFAULT_SORT=popular_recent
```

## Output Format

```md
# YouTube Video Candidates

Query: <query>
Sort: <sort>
Sorting confidence: <exact | approximate>
Candidate pool: <number>

## Results

1. [<title>](<url>)
   - Channel: <channel>
   - Published: <published_at>
   - Views: <view_count or unknown>
   - Likes: <like_count or unknown>
   - Comments: <comment_count or unknown>
   - Engagement score: <view_count + like_count + comment_count>
   - Why relevant: <short reason based on title, description, or metadata>
   - Transcript command: `$get-youtube-transcription <url>`

## Caveats

- <caveat from script output, if any>
```

If no suitable results are found, say that no suitable YouTube videos were found and suggest a narrower query.

## Guardrails

- Do not fetch transcripts; use `get-youtube-transcription` after the user selects one video.
- Do not summarize video content unless a transcript or reliable content source is provided.
- Do not claim `popular_recent` or `most_liked` are global rankings; they are approximate within the fetched candidate pool.
- Do not process playlists, channels, Shorts collections, or multiple transcripts in this skill.
- Do not infer that a video is authoritative only because it has high views or engagement.
- Do not expose `YOUTUBE_API_KEY` or local env file contents.
- Keep results concise; default to the configured result count when the user does not specify a count.

## Verification

Before finishing, confirm:

- [ ] The input was one YouTube search topic or query.
- [ ] The environment was confirmed to support local script execution, Python virtualenv use, network requests, and `YOUTUBE_API_KEY` access; otherwise, setup/run guidance was provided instead of attempting execution.
- [ ] The bundled wrapper/script was used from this repository when local execution was available.
- [ ] The response contains YouTube video candidates, not playlists or channel pages.
- [ ] Sort mode, sorting confidence, and caveats are visible.
- [ ] Missing statistics are shown as unknown/null instead of being presented as real zero counts.
- [ ] Each result includes a URL and enough metadata for the user to choose.
- [ ] The response does not fetch transcripts or summarize video content without provided transcript text.
- [ ] The suggested next step points to `get-youtube-transcription` for one selected video.
