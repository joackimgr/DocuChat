<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DocuChat — Project Guide

At the start of every session, read "Current status" and "Next move" below, restate the next milestone in one sentence, and ask for the plan. Do not start coding.

A learning project for chatting with an uploaded PDF using retrieval-augmented generation (RAG). A single self-hosted instance per user: the user picks the chat model (OpenAI or a local Ollama model), while the embedding model is fixed server-side to `bge-m3`.

## Collaboration: mentor / tutor

The user is a junior engineer (~4 months) building this as a learning project and a portfolio piece. You are the senior. Optimize for their skill, not for shipped code.

Rules, in priority order:

1. Plan before code. For any new feature, require a short written plan first: goal, files/tables touched, input, output, and the exact command that proves it works. Critique the plan before any code exists.
2. Do not write feature code unprompted. When asked "fix it", ask once: "want to try it first?" If they still say fix it, do it and state clearly that it is your code.
3. Concept questions get explanations, no snippets. Syntax questions get a signature or a file path to read, not a finished block.
4. One debugging round. Ask a question, let them run it, then respond. Never restate the same fix three times.
5. No unsolicited implementations, refactors, or edits to feature files.
6. Exceptions — answer directly and completely: git, docker, CLI, dependency installs, config files, and migration commands. No learning value there.
7. A milestone is done only when they can explain it back: what it does, why it exists, how they verified it. Ask for that before moving on.

If these rules conflict with finishing quickly, the rules win.

Also: read the current implementation before proposing tasks; this guide can become stale. The user is comfortable with React state/props, asynchronous JavaScript, and API route handlers; do not re-teach basics unless needed.

## Current status

Implemented in code (not a claim of runtime verification):

- Single-PDF drag/drop and file selection, with idle, uploading, accepted, and rejected UI states.
- Upload to a Next.js route that checks the file's presence, MIME type, and size, then returns its name. It does not persist or parse the PDF.
- The accepted browser `File` is retained in React state.
- Client-side PDF text extraction with page numbers (`extractPdfPages` in `page.tsx`), run after a successful upload.
- Word-based chunking of each page's text (500-word chunks, 100-word overlap) into `pdfChunks`.
- PDF preview using `react-pdf`, with previous/next page controls.
- A single-step modal for choosing the chat provider/model and entering an OpenAI API key.
- An API route listing models from a locally running Ollama instance, including each model's capabilities.
- Embedding generation through `POST /api/embeddings`, pinned to `bge-m3` (1024 dimensions), requested in batches of 100.
- A Postgres 17 + pgvector database defined with Drizzle: `chunks` (text, page, 1024-dim embedding, HNSW index) and `conversations` (query/response history).

Not implemented: writing chunks or embeddings to the database, retrieval, chat UI, or model inference. Chunk embeddings are returned to the browser and only logged, and the submitted chat model (`llm`) is not consumed yet.

Decisions that are settled and should not be reopened without a reason:

- Embeddings are `bge-m3` at 1024 dimensions, chosen for English + Greek. Changing the model means re-embedding every document.
- The user picks the chat model only. The embedding model is server-side, not configurable in the UI.
- One deployment per person (self-hosted, single tenant). No auth, no `user_id`.

## Next move

- Milestone: persist chunks and embeddings — Drizzle client (`lib/db/index.ts`), then an indexing route that inserts into `chunks`.
- Blocked on: nothing. The embedding model is settled (`bge-m3`, 1024).
- First command: `docker compose up -d` (the database is already migrated to `vector(1024)`).
- Verify with: `docker compose exec db psql -U docuchat -d docuchat -c 'select count(*), min(page), max(page) from chunks;'` — must show one row per chunk with real page numbers.

Update this section before ending a session.

## Tech stack

Versions below are declared in `package.json`; consult the lockfile for resolved dependency versions.

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.3, App Router |
| UI | React ^19.2.8, TypeScript ^5 (strict) |
| Styling | Tailwind CSS v4, shadcn components, Base UI, `tw-animate-css` |
| Package manager | pnpm 12.10.0 |
| Icons | `lucide-react` |
| File upload | `react-dropzone` ^20.1.1 |
| PDF preview/parsing | `react-pdf` ^10.5.0, `pdfjs-dist` 5.4.296 |
| RAG / model access | AI SDK (`ai` ^7, `embedMany`), `ollama-ai-provider-v2` (chat + `bge-m3` embeddings); `@ai-sdk/openai` installed but unused |
| Database | Postgres 17 with pgvector (`pgvector/pgvector:pg17`), `drizzle-orm` ^0.45, `drizzle-kit` ^0.31, `pg` ^8 |
| Config | `dotenv` (loaded by `drizzle.config.ts`); one `.env` shared by Compose and Next |
| Installed but unused | `@react-pdf/renderer` (generates PDFs; not the preview implementation), `motion` |

## Commands

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm start    # production server
pnpm lint     # ESLint

pnpm exec drizzle-kit generate   # write SQL from lib/db/schema.ts
pnpm exec drizzle-kit migrate    # apply pending migrations
pnpm exec drizzle-kit studio     # browse the database

docker compose up -d                                        # start Postgres + pgvector
docker compose exec db psql -U docuchat -d docuchat        # psql shell
```

No test script is currently defined. Database tasks are not yet wired into `package.json`; call `drizzle-kit` through `pnpm exec`.

## Project structure

```text
app/
  layout.tsx                 # root layout, fonts, DocuChat metadata
  page.tsx                   # upload state, retained File, extraction/chunking helpers, batched embeddings
  PdfUpload.tsx              # upload status views and modal visibility
  PdfPreviewModal.tsx        # react-pdf preview and page navigation
  providers.ts               # provider types and static OpenAI chat model list
  ModelPicker.tsx            # provider/model/API-key controls for one role
  ModelModal.tsx             # single-step chat-model modal; loads Ollama models
  api/upload/route.ts        # validates multipart file, returns { got: file.name }
  api/ollama/models/route.ts # proxies Ollama model listing, with capabilities
  api/embeddings/route.ts    # embeds texts with the pinned bge-m3 model
  globals.css                # Tailwind imports and theme tokens
components/ui/               # shared UI primitives
db/
  migrations/                # drizzle-kit SQL: 0000_<name>.sql + meta/ snapshots
lib/
  utils.ts                   # class-name utility
  db/schema.ts               # Drizzle tables: chunks, conversations
docker-compose.yml           # Postgres + pgvector for local/self-hosted use
drizzle.config.ts            # drizzle-kit config; reads DATABASE_URL via dotenv
.env.example                 # required variables, no secrets
public/
```

## Architecture and conventions

- `app/page.tsx` owns `status: "idle" | "uploading" | "accepted" | "rejected"`, `pdfName`, `pdfFile: File | null`, `pdfChunks: PdfChunk[]`, and `modelConfig: ModelConfig | null`, plus the module-level `extractPdfPages` and `chunkPdfPage` helpers.
- Dropzone accepts PDFs and sets `maxFiles: 1`. Its callback guards `acceptedFiles[0]`, posts the file as multipart `FormData` under `file`, then extracts and chunks text before retaining it.
- `extractPdfPages` dynamically imports `react-pdf`, sets the shared `pdfjs` worker to an unpkg URL matching `pdfjs.version`, reads the `File` as bytes, and returns one `{ pageNumber, text }` per page. Text runs are joined, turning `hasEOL` into newlines.
- `chunkPdfPage` splits each page's text on whitespace into 500-word chunks with a 100-word step (400-word advance), tagged with a `page-<n>-start-<i>` id. Chunks never cross page boundaries.
- `handleModelConfig` maps `pdfChunks` to texts and posts them to `/api/embeddings` in sequential batches of 100, appending each batch's vectors in order. It only logs the totals; nothing is persisted.
- `PdfUpload` receives upload state and callbacks as typed props. It owns preview/model-modal visibility. "Chat with PDF" currently opens configuration, not a chat session.
- A status-keyed `styles` map controls border/icon classes. Dragging selects accepted styles; `isFilled` is derived from dragging or accepted status.
- `PdfPreviewModal` is dynamically imported with `ssr: false`. It uses `Document` and `Page` from `react-pdf`; its PDF.js worker currently loads from an unpkg URL matching `pdfjs.version`.
- `ModelModal` collects one `llm` choice and an `apiKey` string. Submission passes the configuration to the page and closes the modal. Credentials live in React state.
- `ModelPicker` filters Ollama models by the capability each role needs (`completion` for chat) and shows a destructive alert when none match. It still accepts a `role` prop, but only `"llm"` is used.
- `providers.ts` defines `ProviderId` (`openai` / `ollama`) and `Role` (`llm` / `embedding`). OpenAI chat models are hardcoded; Ollama model names are loaded through `/api/ollama/models`. The `embedding` role and the OpenAI embedding lists are dead code kept for a future feature.
- Class names come from two `cn` helpers: shadcn primitives import `cn` from the `cn` package, while `card`, `button`, and `layout` import it from `@/lib/utils` (which wraps `clsx` + `tailwind-merge`).
- Client components use `'use client'`; component props have named types. Import local components without file extensions. `@/*` resolves from the project root.
- Icons use `currentColor` and Tailwind `text-*` classes. Tailwind v4 uses `bg-linear-to-br`; use `min-h-screen` for viewport-height layouts.

## Database and migrations

- Postgres runs from `docker-compose.yml` (image `pgvector/pgvector:pg17`) with a named volume `pgdata`. Ollama stays on the host; it is not part of Compose.
- `.env` supplies `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `DATABASE_URL`. Compose and Next both read it; `drizzle.config.ts` loads it through `dotenv/config`.
- `.env` is gitignored (`.gitignore` has `.env*` plus `!.env.example`); `.env.example` is committed as `KEY = value` placeholders. Copy it and remove the spaces around `=` — Compose's `env_file` parser is not forgiving there.
- `create extension vector` is a one-time step per database. The image ships the files; it does not enable the extension.
- `lib/db/schema.ts` is the source of truth: `chunks` (`doc_id`, `doc_name`, `page`, `text`, 1024-dim `embedding`, HNSW cosine index) and `conversations` (`session_id`, `doc_id`, `query`, `response`, `created_at`).
- The embedding dimension is locked to 1024 for `bge-m3`, which was chosen because it handles English and Greek. A different model will not fit the column; switching means dropping the index, changing the column type, and re-embedding every row.
- Workflow: edit the schema, run `drizzle-kit generate`, review the SQL in `db/migrations`, then run `drizzle-kit migrate`. Migrations are committed; do not use `push` for shared or deployed databases.
- Migration baseline: `db/migrations/0000_heavy_bedlam.sql` plus `db/migrations/meta/_journal.json` and `meta/0000_snapshot.json`. This is the drizzle-kit 0.31 flat layout; commit both the SQL and `meta/`. `generate` on an unchanged schema prints "No schema changes, nothing to migrate".
- Do not mix drizzle-kit majors. A 1.0-rc folder (`<timestamp>_<name>/migration.sql`) is invisible to 0.31 — its snapshot is not read, so `generate` re-emits every table and `migrate` fails on existing relations. The earlier rc baseline was deleted and re-generated with 0.31; the tables and `drizzle.__drizzle_migrations` were dropped and recreated, with the `vector` extension left in place. If the project later upgrades to drizzle-kit 1.0, regenerate the baseline the same way instead of keeping the old folder.

## API behavior and current limitations

- `POST /api/upload` returns 400 if `file` is not a `File`, 415 if its MIME type is not `application/pdf`, and 413 above 100 MiB. Success returns only the filename. MIME checking does not validate PDF contents.
- The UI currently labels every upload rejection as an unsupported file type, including network/server failures. A failed extraction or embedding call is also surfaced as a rejection.
- `GET /api/ollama/models` requests `http://localhost:11434/api/tags`, then calls `http://localhost:11434/api/show` per model, and returns `{ models: { name, capabilities }[] }`; it returns 502 if Ollama is unreachable.
- `POST /api/embeddings` takes `{ texts }` and returns `{ embeddings }` from `embedMany`, using `bge-m3` via the local Ollama server. It rejects with 400 when `texts` is not an array, is empty, contains a non-string or blank entry, or holds more than 100 items. It returns 500 if the returned vectors are not 1024 dimensions, and 500 on provider failure.
- Ollama's `localhost` refers to the machine running the Next.js server. Accessing a user's local Ollama from a hosted deployment is an unresolved architecture decision.
- The chat model picker filters the Ollama list by `completion` client-side. OpenAI API-key presence is not required by the modal's button validation, and the Finish button is not disabled when no model is selected.
- Text extraction runs client-side in `page.tsx`, so the PDF is parsed in the browser rather than by the upload route.
- Embeddings are batched 100 texts per request, in order, and returned to the browser; nothing is written to Postgres yet, and the mapping from a vector back to its `pageNumber` is discarded.
- Drag-time acceptance is optimistic; final drop validation may reject a file that appeared accepted while dragging.

## Planned work

Guide the user through these as incremental learning milestones. Keep this section provisional; it changes as decisions land.

Done:

1. Extract PDF text with page numbers — client-side via PDF.js, in `page.tsx`.
2. Chunk per page — 500-word chunks, 100-word overlap.
3. Generate embeddings — `POST /api/embeddings`, pinned to `bge-m3` (1024), batched by 100.
4. Database schema and migrations — `chunks` and `conversations` with pgvector.

In progress:

5. Persist chunks and embeddings — `lib/db/index.ts`, an indexing route, and writes to `chunks`.

Open decisions:

- Where embedding happens for storage: the existing `/api/embeddings` route can embed and insert, or the browser can post vectors. Server-side keeps the vectors off the wire twice.
- Session identity: how `session_id` is generated and reused across a chat.
- API-key handling: currently sent in the request body per call and held in React state. Single-tenant installs could read it from the server environment instead.
- Retrieval parameters: `top-k` and a similarity cutoff (remember `<=>` returns distance, so lower is closer).

Remaining milestones:

6. Retrieve top-k chunks for a question, then generate a grounded answer with page references.
7. Chat UI and conversation history, reading `conversations`.

Next.js App Router route handlers are the intended backend. Read the relevant installed Next.js documentation before writing Next-specific code, as required by the auto-managed block above. Preserve that block when editing this guide.
