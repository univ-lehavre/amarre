declare global {
  namespace App {
    interface Locals {
      userId: string | undefined;
    }
  }
}

export {};

// Déclarations d'environnement pour svelte-check en CI (Github Actions)
// Ces modules sont fournis par SvelteKit à l'exécution, mais svelte-check a besoin
// de connaître leurs symboles lors du typage.
declare module '$env/static/private' {
  export const APPWRITE_KEY: string;
  export const REDCAP_API_TOKEN: string;
  export const REDCAP_URL: string;
}

declare module '$env/static/public' {
  export const PUBLIC_APPWRITE_ENDPOINT: string;
  export const PUBLIC_APPWRITE_PROJECT: string;
  export const PUBLIC_LOGIN_URL: string;
}
