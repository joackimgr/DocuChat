<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DocuChat — Project Guide

A learning project for chatting with an uploaded PDF using retrieval-augmented generation (RAG). The intended experience supports user-provided OpenAI API keys and local models through Ollama, with separate choices for chat and embedding models.

## Collaboration: mentor / tutor

- The user writes the feature code to learn; act as a senior engineer mentoring a junior engineer.
- Read the current implementation before proposing tasks. This guide can become stale; verify claims against the code.
- Give small implementation tasks, explain relevant concepts and tradeoffs, and review the user's attempts. Prefer hints and guiding questions over complete solutions.
- The user is comfortable with React state/props, asynchronous JavaScript, and API routes; avoid re-teaching basics unless needed.
- Do not implement features or provide full solutions unless explicitly requested. Explicit requests for edits, such as updating this guide, authorize those edits.

## Current status

Implemented in code (not a claim of runtime verification):

- Single-PDF drag/drop and file selection, with idle, uploading, accepted, and rejected UI states.
- Upload to a Next.js route that checks the file's presence, MIME type, and size, then returns its name. It does not persist or parse the PDF.
- The accepted browser `File` is retained in React state.
- PDF preview using `react-pdf`, with previous/next page controls.
- A two-step modal for selecting chat and embedding providers/models and entering an OpenAI API key.
- An API route listing models from a locally running Ollama instance.

Not implemented: application-level text extraction, chunking, embeddings, vector storage, retrieval, chat UI, or model inference. Submitted model configuration is stored in `page.tsx` but not consumed yet.

## Tech stack

Versions below are declared in `package.json`; consult the lockfile for resolved dependency versions.

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.3, App Router |
| UI | React ^19.2.8, TypeScript ^5 (strict) |
| Styling | Tailwind CSS v4, shadcn components, Base UI, `tw-animate-css` |
| Package manager | pnpm 11.24.0 |
| Icons | `lucide-react` |
| File upload | `react-dropzone` ^20.1.1 |
| PDF preview/parsing | `react-pdf` ^10.5.0, `pdfjs-dist` 5.4.296 |
| Installed but unused | `@react-pdf/renderer` (generates PDFs; not the preview implementation) |

## Commands

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm start    # production server
pnpm lint     # ESLint
```

No test script is currently defined.

## Project structure

```text
app/
  layout.tsx                 # root layout, fonts, DocuChat metadata
  page.tsx                   # upload state, retained File, submitted model config
  PdfUpload.tsx              # upload status views and modal visibility
  PdfPreviewModal.tsx        # react-pdf preview and page navigation
  providers.ts               # provider types, capabilities, static OpenAI model lists
  ModelPicker.tsx            # provider/model/API-key controls for one role
  ModelModal.tsx             # two-step chat/embedding setup; loads Ollama models
  api/upload/route.ts        # validates multipart file, returns { got: file.name }
  api/ollama/models/route.ts # proxies Ollama model listing
  globals.css                # Tailwind imports and theme tokens
components/ui/               # shared UI primitives
lib/utils.ts                 # class-name utility
public/
```

## Architecture and conventions

- `app/page.tsx` owns `status: "idle" | "uploading" | "accepted" | "rejected"`, `pdfName`, `pdfFile: File | null`, and `modelConfig: ModelConfig | null`.
- Dropzone accepts PDFs and sets `maxFiles: 1`. Its callback guards `acceptedFiles[0]`, posts the file as multipart `FormData` under `file`, and retains it after a successful response.
- `PdfUpload` receives upload state and callbacks as typed props. It owns preview/model-modal visibility. "Chat with PDF" currently opens configuration, not a chat session.
- A status-keyed `styles` map controls border/icon classes. Dragging selects accepted styles; `isFilled` is derived from dragging or accepted status.
- `PdfPreviewModal` is dynamically imported with `ssr: false`. It uses `Document` and `Page` from `react-pdf`; its PDF.js worker currently loads from an unpkg URL matching `pdfjs.version`.
- `ModelModal` collects independent `llm` and `embedding` choices and one shared `apiKey` string. Submission passes the configuration to the page and closes the modal. Credentials currently live in React state.
- `providers.ts` defines `ProviderId` (`openai` / `ollama`) and `Role` (`llm` / `embedding`). OpenAI models are hardcoded; Ollama model names are loaded through `/api/ollama/models`.
- Client components use `'use client'`; component props have named types. Import local components without file extensions. `@/*` resolves from the project root.
- Icons use `currentColor` and Tailwind `text-*` classes. Tailwind v4 uses `bg-linear-to-br`; use `min-h-screen` for viewport-height layouts.

## API behavior and current limitations

- `POST /api/upload` returns 400 if `file` is not a `File`, 415 if its MIME type is not `application/pdf`, and 413 above 100 MiB. Success returns only the filename. MIME checking does not validate PDF contents.
- The UI currently labels every upload rejection as an unsupported file type, including network/server failures.
- `GET /api/ollama/models` requests `http://localhost:11434/api/tags`, returns `{ models: string[] }`, and returns 502 on failure.
- Ollama's `localhost` refers to the machine running the Next.js server. Accessing a user's local Ollama from a hosted deployment is an unresolved architecture decision.
- Both model roles currently receive the same Ollama list; the UI does not check model capabilities. OpenAI API-key presence is not required by the modal's button validation.
- PDF preview renders a text layer, but there is no extraction pipeline producing text for RAG.
- Drag-time acceptance is optimistic; final drop validation may reject a file that appeared accepted while dragging.

## Planned work

Guide the user through these as incremental learning milestones:

1. Extract PDF text while preserving page numbers for later citations. The earlier plan was client-side PDF.js extraction; confirm the processing boundary before implementing it.
2. Split extracted text into chunks with document/page metadata.
3. Generate embeddings with the chosen provider and store chunks/vectors. Vector-store choice and persistence are still undecided.
4. Retrieve relevant chunks for a question and generate grounded answers with page references.
5. Connect the chat UI and model configuration, including deliberate API-key handling and local-versus-hosted Ollama behavior.

Next.js App Router route handlers are the intended backend. Read the relevant installed Next.js documentation before writing Next-specific code, as required by the auto-managed block above. Preserve that block when editing this guide.
