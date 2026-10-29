// The scss-module.d.ts reference must come before vite/client so that our looser CSS module typings win.
// See: https://vite.dev/guide/features.html#client-types
/// <reference types="./scss-module.d.ts" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // These are injected at build time. See dev-README.md for more information.
  readonly VITE_NODE_ENV: string;
  readonly VITE_PROJECT_ID?: string;
  readonly VITE_MAINNET_PROVIDER_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GTM_ID?: string;
}
