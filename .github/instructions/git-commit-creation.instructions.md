---
description: "Use when making code changes that should be committed. Enforces small, logical commits with clear messages and basic validation before commit."
name: "Git Commit Creation"
---
# Git Commit Creation Guidelines

When the user asks for implementation work and expects commits, follow these rules.
Treat this as a preference (not an absolute requirement if the user asks to skip commits):

- Create commits in logical chunks (backend/frontend/docs/fix), not one giant commit.
- Keep each commit scoped to one intent and avoid mixing unrelated files.
- Use Conventional Commit style when possible, for example: `feat(scope): short summary` or `fix(scope): short summary`.
- Run relevant verification before each commit (build/test/lint when available).
- Do not commit broken code.
- Do not amend or rewrite history unless the user explicitly asks.
- Do not commit sensitive files (.env, secrets, keys).
- After committing, report commit hash and summary of what changed.

If unsure how to split commits, prefer smaller commits that match user-visible features or fixes.
