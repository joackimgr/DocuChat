export type Role = "llm" | "embedding"

export type OllamaModel = {
  name: string
  capabilities: string[]
}

export const EMBEDDING_MODEL = "bge-m3"
