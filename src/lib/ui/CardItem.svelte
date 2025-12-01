<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    imageSrc?: string | null;
    imageAlt?: string;
    width?: string; // e.g. '18rem'
    horizontalWidth?: string; // largeur en layout horizontal
    bodyExtra?: Snippet; // contenu additionnel dans .card-body après la description
    footer?: Snippet; // contenu après le body (ex: list-group)
    actions?: Snippet; // icônes/boutons alignés dans le body, après la description
    layout?: 'vertical' | 'horizontal'; // disposition de la carte
  }

  let {
    title = undefined,
    description = undefined,
    imageSrc = null,
    imageAlt = '',
    width = '18rem',
    horizontalWidth = 'auto',
    bodyExtra = undefined,
    footer = undefined,
    actions = undefined,
    layout = undefined,
  }: Props = $props();
</script>

<div
  class="card h-100"
  style={`width: var(--card-width, ${width})`}
>
  {#if imageSrc}
    <img
      src={imageSrc}
      class="card-img-top"
      alt={imageAlt}
    />
  {/if}

  <div class="card-body">
    {#if title}
      <div
        class="card-title fw-bolder fs-4"
        style="font-family: Gambetta;"
      >
        {title}
      </div>
    {/if}
    {#if description}
      <p
        class="card-text fw-light"
        style="font-family: Gambetta;"
      >
        {description}
      </p>
    {/if}
    {#if actions}
      <div class="d-flex align-items-center gap-2 mt-2">
        {@render actions?.()}
      </div>
    {/if}
    {@render bodyExtra?.()}
  </div>

  {@render footer?.()}
</div>
