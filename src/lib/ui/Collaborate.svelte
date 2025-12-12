<script lang="ts">
  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
  let { userId, url } = $props();
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
      <CardItem title="Une nouvelle demande">
        {#snippet footer()}
          <div class="list-group list-group-flush">
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
                  Se connecter
                </div>
              </div>
              {#if !userId}
                <p
                  class="fw-light"
                  style="font-family: Gambetta;"
                >
                  Afin de déposer une nouvelle demande, je dois d'abord me connecter à mon compte.
                </p>
              {/if}
            </button>
            <form
              method="post"
              action="?/consent"
            >
              <button
                type="submit"
                class="list-group-item list-group-item-action {userId && !url ? 'active' : 'disabled'}"
              >
                <div class="d-flex flex-row {userId && !url ? 'fs-5' : ''}">
                  <i class="bi bi-link-45deg me-2"></i>
                  <div
                    class="list-group list-group-flush fw-{userId && !url ? 'bold mb-1' : 'light'}"
                    style="font-family: Gambetta;"
                  >
                    Créer une nouvelle
                  </div>
                </div>
                {#if userId && !url}
                  <p
                    class="fw-light"
                    style="font-family: Gambetta;"
                  >
                    Avant de pouvoir remplir ma nouvelle demande, je dois accepter la politique de données.
                  </p>
                {/if}
              </button>
            </form>
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
                  Déposer ma nouvelle demande
                </div>
              </div>
            </a>
          </div>
        {/snippet}</CardItem
      >
    </div>
  </HorizontalScroller>
</div>
