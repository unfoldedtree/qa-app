/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string | boolean | undefined>> {
    readonly VITE_EXCHANGE_URL: string,
    readonly VITE_EXCHANGE_API_URL: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}