# Pi Web Search Extension

A small Pi extension that adds Exa-backed web search and URL reading.

## Features

- Search web, GitHub/developer sources, news, and public company sources.
- Read known URLs into summaries, highlights, or capped full text.
- Use conservative defaults to limit cost and context size.
- Return human-readable results plus structured `details` for later tooling.

## Requirements

Set an Exa API key before starting Pi:

```bash
export EXA_API_KEY=...
```

## Install locally

Global Pi extension location:

```bash
mkdir -p ~/.pi/agent/extensions/pi-search
cp -R pi-extensions/web-search/* ~/.pi/agent/extensions/pi-search/
cd ~/.pi/agent/extensions/pi-search
npm install --omit=dev
```

Then restart Pi or run:

```text
/reload
```

For development from this repository:

```bash
cd pi-extensions/web-search
npm install
pi -e ./index.ts
```

## Tools

### `pi_web_search`

Searches current external sources.

Parameters:

- `query`
- `mode`: `auto`, `web`, `github`, `stocks`, `news`
- `depth`: `fast`, `standard`
- `maxResults`: 1-20
- `includeDomains`
- `excludeDomains`
- `since`: ISO date, `7d`, or `2w`

### `pi_read_urls`

Reads known URLs.

Parameters:

- `urls`: 1-10 HTTP(S) URLs
- `output`: `summary`, `highlights`, `full_text`
- `freshnessHours`: 0-720

Full text is capped in returned details to avoid bloating Pi sessions.

## Slash commands

```text
/search <query>
/github-search <query>
/stock-search <ticker or question>
/read-url <url...>
```

Slash commands are thin wrappers: they send a prompt that asks the agent to use the relevant tool.

## Examples

```text
/search latest OpenAI structured outputs docs
/github-search TypeScript AST parser examples
/stock-search NVDA latest earnings guidance risks
/read-url https://example.com/article
```

## Limitations

- v1 uses Exa only.
- No browser automation.
- No deep multi-step research loop inside the extension.
- Stock mode returns public research material, not investment advice.
- Stock mode is a single search and may miss some investor relations pages, transcripts, or news.

## Privacy

Search queries and URLs are sent to Exa. Do not search or read URLs containing secrets or sensitive private information.
