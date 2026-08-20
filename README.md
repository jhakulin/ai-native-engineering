# ai-native-engineering

Minimal source repository for AI harness guidelines, reusable agent skills, Pi extensions, agent definitions, and harness strategy notes for software development.

The repository is intentionally small. Add new guidelines, skills, extensions, agents, and strategy notes only when there is a concrete use case, a clear trigger, and reusable value worth preserving.

## Structure

```text
AGENTS.md                  Shared instructions for Codex-style agents
CLAUDE.md                  Shared instructions for Claude
guidelines/                AI harness, skill, and agent authoring guidelines
strategies/                AI harness adoption and operating-model strategy notes
skills/<skill>/SKILL.md    Reusable skill definitions
pi-extensions/<name>/      Pi coding-agent extensions and specs
.agents/skills/            Codex discovery links to selected repo skills
.claude/skills/            Claude Code discovery links to selected repo skills
scripts/validate-repo.js   Lightweight repository validator
```

## Contents

- `skills/`: Reusable agent skills with their own usage instructions and supporting files.
- `pi-extensions/`: Pi coding-agent extensions, specs, and package files.
- `strategies/`: Notes on AI-assisted engineering process, metrics, adoption phases, and workshops.

See each folder for the current inventory and detailed usage.

## Install `context-review`

Review the skill and extension source before installation. The commands below
keep this checkout as the canonical source, so it must remain at the same path.
On macOS or Linux, set its absolute path once:

```bash
export AI_HARNESS_REPO=/absolute/path/to/ai-harness
```

### Claude Code

If `context-review` is not visible in `/skills`, the preferred installation
workflow is to ask Claude Code to install it. Start Claude with access to this
checkout and use a prompt like:

```text
Install the context-review skill from <absolute-path-to-ai-harness>/skills/context-review as a personal Claude Code skill available in every repository. Keep this checkout as the canonical source by linking ~/.claude/skills/context-review to that directory. On Windows, use a directory junction if creating a symbolic link is unavailable. Do not replace an existing installation without asking me. Verify that SKILL.md is readable and tell me whether Claude Code must be restarted.
```

When Claude is started in this repository, replace the source path with “this
repository's `skills/context-review` directory.” Review and approve the proposed
filesystem command before Claude changes the personal skills directory.

After installation, restart Claude Code if requested, run `/skills`, then invoke:

```text
/context-review --stats
```

Claude runs skills through a model-mediated turn. The complete deterministic
report in the Bash tool result is canonical; press `Ctrl+O` to expand it when
collapsed. Claude may add a summary afterward, but that commentary is
non-authoritative. For verbatim stdout without model-mediated presentation, run
this outside Claude Code with the real repository path substituted:

```text
node <repo>/skills/context-review/scripts/context-review.mjs --stats --agent claude --cwd <working-directory>
```

#### Manual macOS or Linux fallback

```bash
mkdir -p ~/.claude/skills
ln -s "$AI_HARNESS_REPO/skills/context-review" ~/.claude/skills/context-review
```

#### Manual Windows PowerShell fallback

For a personal installation available in every repository, the link must be at
`$HOME\.claude\skills\context-review`, not only under the cloned repository's
`.claude` directory. From the root of this checkout, run:

```powershell
$repo = (Resolve-Path ".").Path
$skills = Join-Path $HOME ".claude\skills"
New-Item -ItemType Directory -Force $skills
New-Item -ItemType SymbolicLink -Path (Join-Path $skills "context-review") -Target (Join-Path $repo "skills\context-review")
```

Creating a symbolic link may require Windows Developer Mode or an elevated
terminal. If symbolic links are unavailable, use a directory junction instead:

```powershell
New-Item -ItemType Junction -Path (Join-Path $skills "context-review") -Target (Join-Path $repo "skills\context-review")
```

Do not run both link commands. If the destination already exists, inspect or
remove that existing installation intentionally before creating a replacement.

Git repositories also track `.claude/skills/context-review` and
`.agents/skills/context-review` as symbolic links for project-local discovery.
On Windows with `core.symlinks=false`, Git may check these out as small regular
text files containing `../../skills/context-review`; Claude and Codex cannot load
a skill through those files. Prefer the personal installation above. For a
project-local Windows test, first confirm that the discovery path is a regular
file, then replace that file with a complete copy of the skill directory:

```powershell
Get-Item ".claude\skills\context-review" | Format-List FullName,LinkType,Attributes
Remove-Item ".claude\skills\context-review"
Copy-Item -Recurse ".\skills\context-review" ".claude\skills\context-review"
```

This copy is local installation state and must be refreshed when the canonical
skill changes. Do not commit the copied directory over the repository symlink.

Verify what Claude Code will load:

```powershell
Get-Item "$HOME\.claude\skills\context-review" | Format-List FullName,LinkType,Target
Test-Path "$HOME\.claude\skills\context-review\SKILL.md"
Get-Content "$HOME\.claude\skills\context-review\SKILL.md" -TotalCount 5
```

`Test-Path` must return `True`, and the frontmatter must include
`user-invocable: true`. Restart Claude Code if the top-level personal skills
directory was created after Claude started, then run `/skills`.

This repository also contains `.claude/skills/context-review` for project-local
testing inside this checkout only. Claude's skill locations and explicit
symlink support are documented at
<https://code.claude.com/docs/en/skills#where-skills-live>.

### Codex

Install for the current user:

```bash
mkdir -p ~/.agents/skills
ln -s "$AI_HARNESS_REPO/skills/context-review" ~/.agents/skills/context-review
```

Then invoke:

```text
$context-review --stats
```

This repository also contains `.agents/skills/context-review` for project-local
testing inside this checkout.

### Pi

Install the native extension from this checkout:

```bash
pi install "$AI_HARNESS_REPO/pi-extensions/context-review"
```

For a one-run test without installation:

```bash
pi -e "$AI_HARNESS_REPO/pi-extensions/context-review"
```

Then invoke:

```text
/context-review --stats
```

## Principles

- Keep skills and extensions simple, reusable, reliable, and extensible.
- Prefer one canonical source over unnecessary duplication.
- Add tool-specific adapters only when there is a specific need.
- Do not add lifecycle agents, commands, hooks, or integrations without a specific need.

## Research Inbox Workflow

This repo includes a GitHub Actions workflow for scheduled/manual agent-skill research inbox ingestion. Setup and operation notes are in `docs/research-brief-workflow.md`.

## Validation

```bash
node scripts/validate-repo.js
```
