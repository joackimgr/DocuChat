# DocuChat

Ask questions about a PDF and get answers that show the page they came from. Everything runs on your machine: the app, the database, and the models.

DocuChat extracts a document's text in the browser, splits it into overlapping chunks, embeds each chunk with `bge-m3` through [Ollama](https://ollama.com), and stores the vectors in Postgres with [pgvector](https://github.com/pgvector/pgvector). A question is embedded the same way, the five closest chunks are retrieved, and a local chat model answers from those excerpts only — citing pages as it goes.

No cloud provider, no API keys, no data leaving the machine.

## How it works

```
indexing        PDF → text per page → 500-word chunks → bge-m3 → chunks table
question        question → bge-m3 → 5 nearest chunks → prompt with pages → streamed answer
```

- Chunks never cross page boundaries, so every excerpt can be cited.
- The question and the chunks must be embedded by the same model; `bge-m3` outputs 1024 dimensions.
- Answers are instructed to stay inside the retrieved excerpts and to say so when the document does not contain the answer.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn components |
| PDF | `react-pdf` / `pdfjs-dist` for preview and text extraction |
| Models | AI SDK (`streamText`, `embedMany`), `@ai-sdk/react` (`useChat`), `ollama-ai-provider-v2` |
| Embeddings | `bge-m3` (1024 dims, English + Greek) |
| Database | Postgres 17 + pgvector, Drizzle ORM and migrations |

## Requirements

- Node.js 20+ and pnpm
- Docker (for Postgres)
- [Ollama](https://ollama.com/download) running on the host

Pull the embedding model and at least one chat model:

```bash
ollama pull bge-m3
ollama pull gemma3:4b        # or any model with the "completion" capability
```

Small models work, but expect weaker instruction-following. 8B and up give noticeably better Greek and more reliable page citations.

## Setup

```bash
git clone git@github.com:joackimgr/DocuChat.git
cd DocuChat

pnpm install

cp .env.example .env        # change the password if you like
docker compose up -d

# one time per database: the image ships pgvector but does not enable it
docker compose exec db psql -U docuchat -d docuchat -c 'create extension if not exists vector'

pnpm exec drizzle-kit migrate
pnpm dev
```

Open <http://localhost:3000>.

### Environment

`.env` is shared by Compose and the app:

```bash
POSTGRES_USER=docuchat
POSTGRES_PASSWORD=change-me
POSTGRES_DB=docuchat
DATABASE_URL=postgresql://docuchat:change-me@localhost:5432/docuchat
```

## Using it

1. Drop a PDF onto the page.
2. Press **Chat with PDF**, pick a model, press **Finish**. The modal shows progress while the chunks are embedded and stored.
3. You land on `/chat`. Ask a question. The answer streams in and names the page it came from.
4. Switch models from the dropdown under the transcript at any time — it applies to your next question, and the conversation is kept.

5. If you close the tab and come back, the home page offers **"Continue chatting with it"** for the document still in the database.

Opening `/chat?docId=…&name=…` directly works too, which is useful for testing with an already-indexed document. Without a `model` parameter the first installed model is selected and can be changed from the dropdown.

### One document at a time

The app stores exactly one indexed document:

- Indexing a PDF deletes any previously stored one.
- **New PDF** deletes the current document before returning home.
- Closing the tab keeps it, so you can continue later.

Nothing accumulates, and there is no cleanup job to run.

## Limits

- **Single user.** There is no authentication. Run it on your own machine; do not expose it.
- **One embedding model per database.** The column is `vector(1024)`. Changing the embedding model means dropping the index, altering the column, and re-indexing every document.
- **Indexing happens in the browser.** Keep the tab open until it finishes. Measured roughly 0.26 s per 500-word chunk, so 600 chunks is about two and a half minutes.
- **The transcript is not persisted.** The `conversations` table exists but is not written yet. Reloading or resuming a document gives you the PDF back, not the previous questions.
- **Similarity scores are not calibrated.** `1 - cosine distance` on `bge-m3` topped out near 0.49 on a real Greek document; a 0.5 cutoff would return nothing. There is no cutoff today.
- **Text extraction is best-effort.** Some PDFs produce odd spacing, especially Greek, which slightly hurts retrieval quality.

## Project status

Working end to end: upload, index, retrieve, stream a grounded answer, switch models mid-conversation, resume a stored document.

Next: persist conversations in the `conversations` table and reload them on `/chat`. Route-level details and the working conventions live in [`AGENTS.md`](./AGENTS.md).

## License

MIT — see [LICENSE](./LICENSE).
