export type ProviderId = "openai" | "ollama"

export type Role = "llm" | "embedding"

export type ProviderInfo = {
    label: string
    needsApiKey: boolean
    supports: Role[]
    models: Record<Role, string[]>
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
    openai: {
        label: "OpenAI",
        needsApiKey: true,
        supports: ["llm", "embedding"],
        models: {
            llm: ["gpt-4o-mini", "gpt-4o"],
            embedding: ["text-embedding-3-small", "text-embedding-3-large"],
        },
    },
    ollama: {
        label: "Ollama",
        needsApiKey: false,
        supports: ["llm", "embedding"],
        models: {
            llm: [],
            embedding: []
        },
    },
}