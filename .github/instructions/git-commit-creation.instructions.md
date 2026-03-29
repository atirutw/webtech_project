---
description: "Use when making significant code changes. Requires creating commits in small, logical chunks with clear messages and basic validation before commit, unless the user explicitly asks to skip commits."
name: "Git Commit Creation"
---
# Git Commit Creation Guidelines

When implementation work results in significant changes, create commits by default.
Only skip commits if the user explicitly asks to skip them.

- Create commits in logical chunks (backend/frontend/docs/fix), not one giant commit.
- Keep each commit scoped to one intent and avoid mixing unrelated files.
- Use Conventional Commit style when possible, for example: `feat(scope): short summary` or `fix(scope): short summary`.
- Run relevant verification before each commit (build/test/lint when available).
- Do not commit broken code.
- Do not amend or rewrite history unless the user explicitly asks.
- Do not commit sensitive files (.env, secrets, keys).
- After committing, report commit hash and summary of what changed.
- If changes are small and not significant (for example typo-only or wording-only edits), a commit is optional unless the user asks for one.

If unsure how to split commits, prefer smaller commits that match user-visible features or fixes.
