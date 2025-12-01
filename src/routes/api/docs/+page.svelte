<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.defer = true;
    script.onload = () => {
      const w = window as unknown as { SwaggerUIBundle: any };
      w.SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        presets: [w.SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
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
