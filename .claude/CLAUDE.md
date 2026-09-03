# CLAUDE.md

Working conventions for this repository. These apply to every task unless I say otherwise in the moment.

## Stack

Never introduce a new dependency without asking first.

## Delegate low-effort work to cheap subagents

Spawn a subagent on the cheapest capable model (Haiku unless the task clearly needs more) for mechanical work. Don't spend the main context or the expensive model on it.

Delegate:

- File and symbol search, grep sweeps, "where is X used"
- Reading long files or logs and reporting back only the relevant lines
- Mechanical refactors: renames, import updates, prop threading, formatting
- Boilerplate scaffolding that follows a pattern already in the repo
- Running lint/typecheck/tests and reporting failures only
- Dependency version and changelog lookups

Keep in the main thread:

- Architecture, data model, and API shape decisions
- Anything touching auth, payments, migrations, or deploy config
- Debugging where the cause isn't yet identified
- Reviewing a subagent's diff before it lands

Give subagents a narrow, self-contained prompt and ask for a compact report rather than a narration of their process.

## UI verification: ask me to test, don't drive a browser

Do not launch the built-in browser, headless Chrome, or a screenshot loop to verify UI work. Instead, stop at the checkpoint and hand me a test request:

- The exact route or URL to open
- 1–5 numbered steps
- What correct behavior looks like
- What specifically you're unsure about

Then wait. Don't continue building on the assumption that it worked.

Browser automation is acceptable only when:

- I explicitly ask for it
- I've reported a bug you can't reproduce from the code alone

This is about interactive browser driving, not automated tests. Writing and running unit, integration, or Playwright specs is fine and encouraged.

## Report minimally

Output should be the minimum I need to keep working. Assume I read the diff.

Default shape of a response after making changes:

1. One line per file touched, and only if the change isn't obvious from the filename
2. Anything I must do myself: install a dep, set an env var, run a migration, restart the server
3. Assumptions you made or open questions

Nothing else. Specifically, don't:

- Summarize code back to me that you just wrote
- Explain your reasoning unless I ask, or unless you made a debatable tradeoff
- Append "Next steps" or "Future improvements" I didn't request
- Use headers, bold labels, or emoji on a two-line answer
- Restate my request before answering
- Report on work you delegated in more detail than the outcome requires

If something needs a real explanation, say so in one line and let me ask.

## Code conventions

- Match the surrounding file's style over any external style guide
- Prefer editing existing files to creating new ones
- No comments that restate the code
- Keep components under ~150 lines; extract rather than nest deeply
- Handle the error case explicitly; no silent catch blocks
