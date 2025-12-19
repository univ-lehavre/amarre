<script lang="ts">
  import { DateTime } from 'luxon';

  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';
  import { resolve } from '$app/paths';

  let { requests } = $props();
  let showHeading = $state(false);
</script>

<div id="follow">
  <HorizontalScroller
    ariaLabel="Follow cards"
    headingText="Follow"
    bind:showHeading
  >
    <SectionTile title={!showHeading ? 'Suivre' : ''} />
    {#each requests as request (request.record_id)}
      <div class="flex-shrink-0">
        <CardItem>
          {#snippet description()}
            Ma demande {request.record_id} est en cours de traitement.
          {/snippet}
          {#snippet actions()}
            <div class="list-group-item list-group-item-{request.form_complete === '2' ? 'success' : 'warning'}">
              {request.form_complete === '2' ? 'Mon formulaire est complet' : 'Je dois compléter mon formulaire'}.
            </div>
            <div
              class="list-group-item list-group-item-{request.form_complete !== '2'
                ? 'info'
                : request.composante_complete === '2'
                  ? 'success'
                  : 'warning'}"
            >
              Ma composante {request.form_complete !== '2'
                ? 'attend mon formulaire'
                : request.composante_complete === '2'
                  ? 'a informé sa décision'
                  : 'se concerte'}.
            </div>
            <div
              class="list-group-item list-group-item-{request.form_complete !== '2'
                ? 'info'
                : request.labo_complete === '2'
                  ? 'success'
                  : 'warning'}"
            >
              Mon laboratoire {request.form_complete !== '2'
                ? 'attend mon formulaire'
                : request.labo_complete === '2'
                  ? 'a informé sa décision'
                  : 'se concerte'}.
            </div>
            <div
              class="list-group-item list-group-item-{request.form_complete !== '2'
                ? 'info'
                : request.encadrant_complete === '2'
                  ? 'success'
                  : 'warning'}"
            >
              Mon encadrant {request.form_complete !== '2'
                ? 'attend mon formulaire'
                : request.encadrant_complete === '2'
                  ? 'a informé sa décision'
                  : 'se concerte'}.
            </div>
            <div
              class="list-group-item list-group-item-{request.form_complete !== '2'
                ? 'info'
                : request.validation_finale_complete === '2'
                  ? 'success'
                  : 'warning'}"
            >
              {request.form_complete !== '2'
                ? "Ma validation finale n'est pas disponible tant que mon formulaire n'est pas complet"
                : request.validation_finale_complete === '2'
                  ? 'Ma validation finale est complète'
                  : 'Je dois compléter ma validation finale'}.
            </div>
          {/snippet}
          {#snippet links()}
            {#if request.form}
              <a
                href={resolve(request.form)}
                class="card-link">Formulaire</a
              >
            {/if}
            {#if request.validation_finale}
              <a
                href={resolve(request.validation_finale)}
                class="card-link">Validation finale</a
              >
            {/if}
          {/snippet}
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
