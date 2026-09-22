---
name: get-youtube-transcription
description: Fetch the transcript for a specific YouTube video in a local coding-agent environment. Use when the user invokes `$get-youtube-transcription <video-id-or-url>`, `/get-youtube-transcription <video-id-or-url>`, or asks to pull, get, fetch, or extract a transcript from one YouTube video ID or URL and the agent can run local repository scripts with Webshare credentials. Do not use for browser-only Claude, Codex, or hosted chat environments that cannot execute local scripts or read local env files; YouTube search; channel listing; playlist processing; video summarization; or transcription of non-YouTube media.
---

# Get YouTube Transcription

## Overview

Fetch the available YouTube transcript for one video ID or URL and return the transcript text. This is a local-execution skill: it uses the bundled script, a local Python runtime, and Webshare proxy configuration. For first-time setup, see `skills/get-youtube-transcription/references/setup.md`.

## Workflow

1. Confirm the request contains exactly one YouTube video ID or YouTube URL. If no usable input is present or multiple videos are requested, ask for a single video ID or URL.
2. Confirm the current environment can execute local shell commands from this repository, use `python3` with `venv` and pip support, make network requests, and access Webshare credentials. If any capability is unavailable, do not attempt to fetch the transcript; explain the blocker and provide the local setup/run instructions from `skills/get-youtube-transcription/references/setup.md`.
3. Ensure Webshare credentials are available through exported environment variables, `~/.config/ai-harness/youtube-transcription.env`, or `skills/get-youtube-transcription/.env`. Use `.env.example` as the placeholder format; do not commit real credentials.
4. Before running the wrapper, get approval if the execution environment requires approval for dependency downloads or network requests to YouTube through Webshare.
5. Run the bundled wrapper from the repository root:
   ```bash
   skills/get-youtube-transcription/scripts/run_youtube_transcription.sh "<video-id-or-url>"
   ```
   The wrapper creates or reuses a persistent virtualenv at `~/.cache/ai-harness/venvs/youtube-transcription` and installs `skills/get-youtube-transcription/requirements.txt` there when needed.
6. If dependency or Webshare configuration errors occur, report the missing requirement without exposing credentials.
7. If YouTube reports that the transcript is disabled, missing, or the video is unavailable, report that specific failure.
8. Return the transcript text from stdout. Do not summarize or rewrite it unless the user explicitly asks.

## Output Format

For successful requests, output the transcript text only unless the user asks for metadata or a different format.

For failures, use a short actionable error:

```text
Transcript unavailable: <reason>.
```

When local execution is unavailable, explain the local-only requirement and provide the setup reference and command:

```text
I cannot fetch the transcript from this environment because this skill requires local script execution and Webshare credentials.

Run locally from the repository root:

skills/get-youtube-transcription/scripts/run_youtube_transcription.sh "<video-id-or-url>"

Setup: skills/get-youtube-transcription/references/setup.md
```

## Guardrails

- Do not search YouTube or infer a video from a title.
- Do not process playlists, channels, or multiple videos in one invocation.
- Do not summarize, classify, or transform the transcript unless explicitly requested.
- Do not claim this works in browser-only Claude, Codex, or hosted chat environments that cannot run local scripts or read local env files.
- Do not expose Webshare credentials or proxy URLs.
- Do not silently bypass Webshare; the script requires `WEBSHARE_PROXY_USERNAME` and `WEBSHARE_PROXY_PASSWORD` from environment variables, the user-level env file, or the ignored local `.env` file.
- Required runtime: `python3` with `venv` and pip support.
- Required Python dependency: `youtube_transcript_api`; the wrapper installs it into the persistent virtualenv when missing.
- Ask for approval before the first dependency download or before making network requests to YouTube through Webshare when the execution environment requires approval.

## Verification

Before finishing, confirm:

- [ ] The input was one YouTube video ID or URL.
- [ ] The environment was confirmed to support local script execution, Python virtualenv use, network requests, and Webshare credential access; otherwise, setup/run guidance was provided instead of attempting execution.
- [ ] The bundled wrapper/script was used from this repository when local execution was available.
- [ ] The required Python runtime and dependency were available through the persistent virtualenv.
- [ ] Webshare configuration was required and credentials were not printed.
- [ ] The response is transcript text only, unless the user requested another format.
- [ ] Any failure reason is specific and actionable.
