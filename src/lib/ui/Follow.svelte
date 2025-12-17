<script lang="ts">
  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
  import { DateTime } from 'luxon';

  let { requests } = $props();
  let url = undefined;
  let showHeading = $state(false);
</script>

<div id="follow">
  <HorizontalScroller
    ariaLabel="Follow cards"
    headingText="Follow"
    bind:showHeading
  >
    <SectionTile title={!showHeading ? 'Suivre' : ''} />
    {#each requests as request}
      <div class="flex-shrink-0">
        <CardItem>
          {#snippet description()}
            Ma demande {request.record_id} est en cours de traitement.
          {/snippet}
          {#snippet actions()}{/snippet}
          {#snippet footer()}
            <small class="text-body-secondary">
              Créée {DateTime.fromISO(request.created_at).toRelative({ locale: 'fr' })}
            </small>
          {/snippet}
        </CardItem>
      </div>
    {/each}
  </HorizontalScroller>
</div>
