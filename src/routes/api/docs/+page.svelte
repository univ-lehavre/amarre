<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.defer = true;
    script.onload = () => {
      type SwaggerUIBundleFn = ((config: Record<string, unknown>) => void) & { presets: { apis: unknown } };

      const w = window as unknown as { SwaggerUIBundle: SwaggerUIBundleFn };
      w.SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        presets: [w.SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
        deepLinking: true,
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: -1,
        defaultModelExpandDepth: 2,
        requestInterceptor: (req: unknown) => {
          // Inclure les cookies de session pour les appels same-origin
          type ReqWithCreds = { credentials?: 'include' | 'omit' | 'same-origin' | string };
          const r = req as ReqWithCreds;
          r.credentials = 'include';
          return r;
        },
        syntaxHighlight: { activate: true, theme: 'monokai' },
      });
    };
    document.body.appendChild(script);
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
  />
</svelte:head>

<div
  id="swagger-ui"
  style="margin: 0; padding: 0;"
></div>
