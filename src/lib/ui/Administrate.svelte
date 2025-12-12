<script lang="ts">
  import Signup from './Signup.svelte';
  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
  let { userId, url, hasPushedAccount, email } = $props();
  let showHeading = $state(false);
</script>

<Signup />

<div id="administrate">
  <HorizontalScroller
    ariaLabel="Administrate cards"
    headingText="Administrate"
    bind:showHeading
  >
    <SectionTile title={!showHeading ? 'Administrer' : ''} />

    <div class="flex-shrink-0">
      <CardItem title="Mon compte">
        {#snippet bodyExtra()}
          {#if email}
            <div
              class="fw-light"
              style="font-family: Gambetta;"
            >
              <p>
                Je suis connecté avec le compte <i>{email}</i>.
              </p>
            </div>
          {/if}
        {/snippet}
        {#snippet footer()}
          <div class="list-group list-group-flush">
            <button
              type="button"
              class="list-group-item list-group-item-action list-group-item-primary {userId ? 'disabled' : ''}"
              data-bs-toggle="modal"
              data-bs-target="#SignUp"
            >
              <div class="d-flex flex-row">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                <div
                  class="list-group list-group-flush fw-light"
                  style="font-family: Gambetta;"
                >
                  Se connecter
                </div>
              </div>
            </button>
            <form
              method="post"
              action="?/logout"
            >
              <button
                type="submit"
                class="list-group-item list-group-item-action list-group-item-warning {userId ? '' : 'disabled'}"
              >
                <div class="d-flex flex-row">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  <div
                    class="list-group list-group-flush fw-light"
                    style="font-family: Gambetta;"
                  >
                    Se déconnecter
                  </div>
                </div>
              </button>
            </form>
          </div>
        {/snippet}
      </CardItem>
    </div>

    <div class="flex-shrink-0">
      <CardItem title="Mes données d'enquête">
        {#snippet bodyExtra()}
          <div
            class="fw-light"
            style="font-family: Gambetta;"
          >
            {#if !userId}
              <p>Je dois m'inscrire pour pouvoir remplir mon enquête.</p>
            {/if}
          </div>
        {/snippet}
        {#snippet footer()}
          <div class="list-group list-group-flush">
            <a
              href="/api/v1/surveys/download"
              class="list-group-item list-group-item-action list-group-item-secondary {userId ? '' : 'disabled'}"
              target="_parent"
              role="button"
            >
              <div class="d-flex flex-row">
                <i class="bi bi-arrow-down me-2"></i>
                <div
                  class="list-group list-group-flush fw-light"
                  style="font-family: Gambetta;"
                >
                  Télécharger
                </div>
              </div>
            </a>
          </div>
        {/snippet}
      </CardItem>
    </div>
  </HorizontalScroller>
</div>
