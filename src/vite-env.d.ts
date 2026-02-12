// /// <reference types="vite/client" />
// /// <reference types="vite-plugin-electron/client" />

// Manual declarations to fix "Cannot find type definition" errors when packages are missing
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_DEV_SERVER_URL?: string;
  readonly VITE_PUBLIC?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}