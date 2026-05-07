<!-- gitnexus:start -->
# GitNexus - Code Intelligence

This project is indexed by GitNexus as **Lumora.FE.Admin** (2873 symbols, 4025 relationships, 157 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

This `AGENTS.md` is scoped to `C:\Code\Project\Lumora.Ecom\Lumora.FE.Admin` only. Do not use or refresh the backend index (`Lumora.BE`) unless the user explicitly asks for backend work.

> If any GitNexus tool warns the index is stale, run `npx.cmd gitnexus analyze` from this frontend project root first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream", repo: "Lumora.FE.Admin"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes({repo: "Lumora.FE.Admin"})` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept", repo: "Lumora.FE.Admin"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When multiple repositories are indexed, always pass `repo: "Lumora.FE.Admin"` to GitNexus MCP tools for this project.
- When you need full context on a specific symbol - callers, callees, which execution flows it participates in - use `gitnexus_context({name: "symbolName", repo: "Lumora.FE.Admin"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace - use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Lumora.FE.Admin/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Lumora.FE.Admin/clusters` | All functional areas |
| `gitnexus://repo/Lumora.FE.Admin/processes` | All execution flows |
| `gitnexus://repo/Lumora.FE.Admin/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
