/// <reference types="vite/client" />

// Vue SFC shim so TS understands .vue imports
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
	export default component;
}

// Strong typing for custom Vite env vars
interface ImportMetaEnv {
	readonly VITE_APP_BASE_PATH: string;
	readonly MOCK_API?: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
