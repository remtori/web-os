/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DESKTOP_OS_ORIGIN: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
