# Search YouTube Videos Setup

This skill runs in a local coding-agent environment that can execute repository scripts, create a Python virtualenv, make network requests, and read a YouTube Data API key.

## Requirements

- `python3` with `venv` and pip support
- Network access to YouTube Data API
- YouTube Data API key
- This repository checked out locally

## Configure YouTube API

Provide configuration in one of these locations:

1. Exported environment variables:

   ```bash
   export YOUTUBE_API_KEY="<api-key>"
   export YOUTUBE_SEARCH_DEFAULT_MAX_RESULTS=5
   export YOUTUBE_SEARCH_CANDIDATE_POOL=25
   export YOUTUBE_SEARCH_DEFAULT_SORT=popular_recent
   ```

2. User-level env file:

   ```text
   ~/.config/ai-harness/youtube-search.env
   ```

3. Local ignored skill env file:

   ```text
   skills/search-youtube-videos/.env
   ```

Use `skills/search-youtube-videos/.env.example` as the placeholder format. Do not commit real credentials.

## Run locally

From the repository root:

```bash
skills/search-youtube-videos/scripts/run_youtube_search.sh "AI harness engineering"
```

Optional arguments:

```bash
skills/search-youtube-videos/scripts/run_youtube_search.sh "AI harness engineering" \
  --max-results 10 \
  --candidate-pool 50 \
  --sort popular_recent \
  --published-after 2025-01-01
```

Supported sort values:

- `popular_recent`: recent candidate videos ranked locally by views plus likes plus comments
- `latest`: newest first
- `most_liked`: most liked within the fetched candidate pool
- `view_count`: YouTube API view-count ordering
- `relevance`: YouTube API relevance ordering

The wrapper creates or reuses a persistent virtualenv at:

```text
~/.cache/ai-harness/venvs/youtube-search
```

If `XDG_CACHE_HOME` is set, the wrapper uses:

```text
$XDG_CACHE_HOME/ai-harness/venvs/youtube-search
```

To use a specific existing virtualenv, set:

```bash
export YOUTUBE_SEARCH_VENV_DIR="<path-to-venv>"
```

It installs `skills/search-youtube-videos/requirements.txt` when the virtualenv is first created.

## Limitations

YouTube Data API does not directly provide a global "most liked for this topic" or "most popular recent for this topic" search order. `popular_recent` and `most_liked` fetch a candidate pool, fetch video statistics, and rank that pool locally. Treat those rankings as approximate.

## Hosted or browser-only environments

If the agent cannot run local shell commands, create/use a Python virtualenv, make network requests, or access `YOUTUBE_API_KEY`, it cannot use the script-backed search. In that case, use available web search manually or run the command locally and paste the output back into the hosted environment.
