import { integer, pgTable, text, uuid, vector, index, timestamp } from "drizzle-orm/pg-core"

export const chunksTable = pgTable("chunks", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    doc_id: uuid('doc_id').notNull(),
    doc_name: text('doc_name').notNull(),
    page: integer('page').notNull(),
    text: text('text').notNull(),
    embedding: vector('embedding', { dimensions: 1024 }).notNull()
}, (t) => {
    return [index('chunks_embedding_idx').using('hnsw', t.embedding.op(
        'vector_cosine_ops'
    ))]
})

export const conversations = pgTable("conversations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    session_id: uuid('session_id').notNull(),
    doc_id: uuid('doc_id').notNull(),
    query: text('query').notNull(),
    response: text('response').notNull(),
    created_at: timestamp('created_at').defaultNow()
})