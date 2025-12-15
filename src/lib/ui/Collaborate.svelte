<script lang="ts">
  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
  let { userId } = $props();
  let showHeading = $state(false);
</script>

<div id="collaborate">
  <HorizontalScroller
    ariaLabel="Collaborate cards"
    headingText="Collaborate"
    bind:showHeading
  >
    <SectionTile title={!showHeading ? 'Déposer' : ''} />
    <div class="flex-shrink-0">
      <CardItem>
        {#snippet title()}
          Une demande
        {/snippet}
        {#snippet description()}
          {userId ? '' : "Je dois m'authentifier avant de déposer ou suivre une demande."}
        {/snippet}
        {#snippet actions()}
          <button
            type="button"
            class="list-group-item list-group-item-action {userId ? 'disabled' : 'active'}"
            data-bs-toggle="modal"
            data-bs-target="#SignUp"
          >
            <div class="d-flex flex-row {userId ? '' : 'fs-5'}">
              <i class="bi bi-box-arrow-in-right me-2"></i>
              <div
                class="list-group list-group-flush fw-{userId ? 'light' : 'bold mb-1'}"
                style="font-family: Gambetta;"
              >
                S'authentifier
              </div>
            </div>
          </button>
          <form
            method="post"
            action="?/newSurvey"
          >
            <button
              type="submit"
              class="list-group-item list-group-item-action {userId ? 'active' : 'disabled'}"
            >
              <div class="d-flex flex-row {userId ? 'fs-5' : ''}">
                <i class="bi bi-clipboard2-plus me-2"></i>
                <div
                  class="list-group list-group-flush fw-{userId ? 'bold mb-1' : 'light'}"
                  style="font-family: Gambetta;"
                >
                  Créer une nouvelle
                </div>
              </div>
            </button>
          </form>
        {/snippet}</CardItem
      >
    </div>
  </HorizontalScroller>
</div>
