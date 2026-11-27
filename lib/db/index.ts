import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const globalForDb = globalThis as unknown as {
    __db?: NodePgDatabase<typeof schema>
}
export const db = globalForDb.__db ?? drizzle({ client: pool, schema })
globalForDb.__db = db