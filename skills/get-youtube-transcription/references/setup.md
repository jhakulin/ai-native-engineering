# Get YouTube Transcription Setup

This skill runs only in a local coding-agent environment that can execute repository scripts, create a Python virtualenv, make network requests, and read local Webshare credentials. Browser-only Claude, Codex, and hosted chat environments cannot fetch transcripts with this skill unless they provide equivalent local script execution and credential access.

## Requirements

- `python3` with `venv` and pip support
- Network access to YouTube through Webshare
- Webshare proxy credentials
- This repository checked out locally

## Configure Webshare

Provide credentials in one of these locations:

1. Exported environment variables:

   ```bash
   export WEBSHARE_PROXY_USERNAME="<username>"
   export WEBSHARE_PROXY_PASSWORD="<password>"
   export WEBSHARE_PROXY_LOCATIONS="us,ca"
   ```

2. User-level env file:

   ```text
   ~/.config/ai-harness/youtube-transcription.env
   ```

3. Local ignored skill env file:

   ```text
   skills/get-youtube-transcription/.env
   ```

Use `skills/get-youtube-transcription/.env.example` as the placeholder format. Do not commit real credentials.

## Run locally

From the repository root:

```bash
skills/get-youtube-transcription/scripts/run_youtube_transcription.sh "<video-id-or-url>"
```

The wrapper creates or reuses a persistent virtualenv at:

```text
~/.cache/ai-harness/venvs/youtube-transcription
```

It installs `skills/get-youtube-transcription/requirements.txt` when the virtualenv is first created.

## Hosted or browser-only environments

If the agent cannot run local shell commands, create/use a Python virtualenv, make network requests, or access Webshare credentials, it cannot fetch the transcript. In that case, run the command locally and paste the transcript or error output back into the hosted environment.
