/// <reference types="react-scripts" />

declare namespace NodeJS {
  // These are injected by fleek (our IPFS hosting service).
  // See README.md for more information.
  interface ProcessEnv {
    readonly REACT_APP_NODE_ENV: string;
  }
}
