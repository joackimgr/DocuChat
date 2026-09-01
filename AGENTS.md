<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DocuChat — Project Guide

Client-side PDF upload, preview, and chat web app. Users drag & drop a single PDF; the app validates it, shows an accepted/rejected state, and will let them **review** the PDF (page preview + extracted text) and **chat with it** via an LLM backed by a vector database.

> **Current status:** frontend UI only. No backend, no PDF text extraction, and no preview implemented yet. The "Review PDF" / "Chat with PDF" buttons are placeholders (no `onClick`).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.3.3** (App Router) — Turbopack is the default bundler |
| UI | React **19.2.8**, TypeScript **5** (strict) |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`) |
| Package manager | pnpm **11.24.0** |
| Icons | `lucide-react` |
| File upload | `react-dropzone` **v20** |
| Installed but unused | `@react-pdf/renderer` — intended for PDF preview, but it *generates* PDFs; see Gotchas |

## Commands

```bash
pnpm dev      # dev server (Turbopack) → http://localhost:3000
pnpm build    # production build
pnpm start    # start production server
pnpm lint     # eslint
```

## Project structure

```
app/
  layout.tsx      # root layout: Geist fonts, metadata (title "DocuChat", author Ioakeim Pantelakis)
  page.tsx        # home page — client component, owns the upload state machine
  IdleView.tsx    # dropzone prompt (drag & drop / click)
  AcceptView.tsx  # accepted state: filename + "Review PDF" / "Chat with PDF" (placeholder buttons)
  RejectView.tsx  # rejected state: "This file type isn't supported"
  globals.css     # Tailwind v4 import + theme tokens
public/
```

## Architecture & conventions

- **`app/page.tsx` is the state machine.** It holds `status: "idle" | "accepted" | "rejected"` and renders exactly one view component based on it. All upload state (`getRootProps`, `getInputProps`, `isDragActive`) lives here; views receive what they need as props.
- **Dropzone config:** accepts only PDFs (`accept: { 'application/pdf': ['.pdf'] }`), `maxFiles: 1`. `onDrop`'s first argument is *accepted* files only — guard `file[0]` before reading it, because a rejected drop gives an empty array (rejected files arrive in the second argument, `fileRejections`).
- **Theme-by-status pattern:** a `styles` map keyed by status holds `{ border, icon }` Tailwind classes; `active` selects `styles.accepted` while dragging (`isDragActive`), otherwise `styles[status]`. `isFilled` is a derived boolean (`isDragActive || status === "accepted"`) that drives icon fill (`fill="currentColor"`) and animation. Keep this pattern when adding states.
- **Props are typed:** each view declares `type <ComponentName>Props = {...}` and destructures props. Import components without the extension (`./IdleView`, not `./IdleView.tsx` — `allowImportingTsExtensions` is not enabled in `tsconfig.json`).
- **Client components** start with `'use client'`. Path alias `@/*` → `./*`.
- **Icons** are colored via `currentColor` + Tailwind `text-*` classes on the lucide icon.

## Planned features & intended architecture

- **Review PDF:** render the uploaded PDF's pages (preview) plus show extracted text.
- **Extract text:** client-side via pdf.js (`pdfjs-dist` / `react-pdf` `getTextContent()`), then send it to the backend.
- **Backend (decided):** Next.js **API routes** (App Router route handlers, e.g. `app/api/*`) for ingestion.
- **Vector DB / LLM:** chunk the extracted text → embed → upsert into a vector store; "Chat with PDF" = LLM Q&A over retrieved chunks. Stack details TBD.

## Gotchas

- **This is a newer/breaking Next.js.** Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (see the auto-managed block at the top of this file). Don't remove that block — `next dev` re-adds it.
- **Turbopack is the default bundler** and supports Vite-style `?url` imports — required for the pdf.js worker (`import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).
- **Tailwind v4 naming:** use `bg-linear-to-br` (not the old `bg-gradient-to-br`); use `min-h-screen` for viewport centering (`min-h-full` only works if the parent chain has an explicit height).
- **`@react-pdf/renderer` is the wrong tool for previewing an uploaded PDF** — it *generates* PDFs. For previewing/parsing an uploaded PDF, use `react-pdf` or `pdfjs-dist` (not yet installed).
- **Drag-time accept/reject is optimistic:** during a drag only the MIME type is available, and browsers often report an empty type — react-dropzone treats that as accepted. Real validation happens at drop.
