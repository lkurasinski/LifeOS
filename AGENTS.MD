# Agents Guidelines

This repository is designed for extensibility. Agents should leverage the module system and follow strict naming and coding conventions to keep the system consistent and safe to extend.

## Conventions
- Modules: plural, snake_case (folders and `id`). Special cases: `auth`, `example`.
- JS/TS fields and identifiers: camelCase.
- Database tables and columns: snake_case; table names plural.
- Keep code minimal and focused; avoid side effects across modules.

## Database Naming
- Tables: plural snake_case (e.g., `users`, `user_roles`, `example_items`).
- Common columns: `id`, `created_at`, `updated_at`, `deleted_at`, `is_active`, when applicable.
- Prefer UUID PKs (`uuid`) and explicit FKs; use junction tables for many-to-many.

## Code Style
- No one-letter variable names.
- Avoid in-line comments; prefer self-documenting code.
- Keep exports minimal and typed.
- Avoid casting to `any`; prefer precise types and union narrowing with runtime checks. When in doubt, extract and reuse shared types instead of `any`.
- Prefer small, reusable libraries and utilities with minimal or no external dependencies where it makes sense.
- Favor functional programming (pure functions, data-first utilities) over classes.
- Write any necessary code comments in English.


## UI Interaction
- Every new dialog must support `Cmd/Ctrl + Enter` as a primary action shortcut and `Escape` to cancel, mirroring the shared UX patterns used across modules.
- Default to `CrudForm` for new forms and `DataTable` for tables displaying information unless a different component is explicitly required.


