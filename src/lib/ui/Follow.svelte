<script lang="ts">
  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
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
    <div class="flex-shrink-0">
      <CardItem>
        {#snippet actions()}
          <a
            href={url}
            class="list-group-item list-group-item-action {url ? 'active' : 'disabled'}"
          >
            <div class="d-flex flex-row {url ? 'fs-5' : ''}">
              <i class="bi bi-clipboard2-data me-2"></i>
              <div
                class="list-group list-group-flush fw-{url ? 'bold mb-1' : 'light'}"
                style="font-family: Gambetta;"
              >
                Éditer ma demande
              </div>
            </div>
          </a>
        {/snippet}</CardItem
      >
    </div>
  </HorizontalScroller>
</div>
