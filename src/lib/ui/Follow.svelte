<script lang="ts">
  import { DateTime } from 'luxon';
  import type { SurveyRequestItem } from '$lib/types/api/surveys';

  import HorizontalScroller from '$lib/ui/HorizontalScroller.svelte';
  import SectionTile from '$lib/ui/SectionTile.svelte';
  import CardItem from '$lib/ui/CardItem.svelte';

  let { requests } = $props();
  let showHeading = $state(false);

  function calculateProgress(request: SurveyRequestItem): number {
    const steps = [
      request.form_complete === '2',
      request.composante_complete === '2',
      request.labo_complete === '2',
      request.encadrant_complete === '2',
      request.validation_finale_complete === '2'
    ];
    const completed = steps.filter(step => step).length;
    return Math.round((completed / steps.length) * 100);
  }

  function getStatusInfo(condition: boolean, isBlocked: boolean = false) {
    if (isBlocked) {
      return { icon: 'bi-dash-circle-fill', color: 'text-secondary', bgColor: 'bg-light' };
    }
    return condition
      ? { icon: 'bi-check-circle-fill', color: 'text-success', bgColor: 'bg-success-subtle' }
      : { icon: 'bi-clock-fill', color: 'text-warning', bgColor: 'bg-warning-subtle' };
  }
</script>

<div id="follow">
  <HorizontalScroller
    ariaLabel="Follow cards"
    headingText="Follow"
    bind:showHeading
  >
    <SectionTile title={!showHeading ? 'Suivre' : ''} />
    {#each requests as request (request.record_id)}
      {@const progress = calculateProgress(request)}
      {@const formBlocked = false}
      {@const composanteBlocked = request.form_complete !== '2'}
      {@const laboBlocked = request.form_complete !== '2'}
      {@const encadrantBlocked = request.form_complete !== '2'}
      {@const validationBlocked = request.form_complete !== '2'}
      
      {@const formStatus = getStatusInfo(request.form_complete === '2', formBlocked)}
      {@const composanteStatus = getStatusInfo(request.composante_complete === '2', composanteBlocked)}
      {@const laboStatus = getStatusInfo(request.labo_complete === '2', laboBlocked)}
      {@const encadrantStatus = getStatusInfo(request.encadrant_complete === '2', encadrantBlocked)}
      {@const validationStatus = getStatusInfo(request.validation_finale_complete === '2', validationBlocked)}
      
      <div class="flex-shrink-0">
        <CardItem>
          {#snippet description()}
            <div class="mb-3">
              Ma demande {request.record_id} est en cours de traitement.
            </div>
            <!-- Progress Bar -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted fw-semibold">Progression globale</small>
                <small class="text-muted fw-bold">{progress}%</small>
              </div>
              <div class="progress" style="height: 8px;">
                <div
                  class="progress-bar bg-{progress === 100 ? 'success' : 'primary'}"
                  role="progressbar"
                  style="width: {progress}%"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          {/snippet}
          {#snippet actions()}
            <!-- Status Items with Semaphore-style indicators -->
            <div class="list-group-item d-flex align-items-center gap-3 {formStatus.bgColor}">
              <i class="bi {formStatus.icon} {formStatus.color} fs-5"></i>
              <div class="flex-grow-1">
                <strong>Mon formulaire</strong>
                <div class="small text-muted">
                  {request.form_complete === '2' ? 'Formulaire complet' : 'À compléter'}
                </div>
              </div>
            </div>
            
            <div class="list-group-item d-flex align-items-center gap-3 {composanteStatus.bgColor}">
              <i class="bi {composanteStatus.icon} {composanteStatus.color} fs-5"></i>
              <div class="flex-grow-1">
                <strong>Ma composante</strong>
                <div class="small text-muted">
                  {request.form_complete !== '2'
                    ? 'Attend mon formulaire'
                    : request.composante_complete === '2'
                      ? 'Décision informée'
                      : 'En concertation'}
                </div>
              </div>
            </div>
            
            <div class="list-group-item d-flex align-items-center gap-3 {laboStatus.bgColor}">
              <i class="bi {laboStatus.icon} {laboStatus.color} fs-5"></i>
              <div class="flex-grow-1">
                <strong>Mon laboratoire</strong>
                <div class="small text-muted">
                  {request.form_complete !== '2'
                    ? 'Attend mon formulaire'
                    : request.labo_complete === '2'
                      ? 'Décision informée'
                      : 'En concertation'}
                </div>
              </div>
            </div>
            
            <div class="list-group-item d-flex align-items-center gap-3 {encadrantStatus.bgColor}">
              <i class="bi {encadrantStatus.icon} {encadrantStatus.color} fs-5"></i>
              <div class="flex-grow-1">
                <strong>Mon encadrant</strong>
                <div class="small text-muted">
                  {request.form_complete !== '2'
                    ? 'Attend mon formulaire'
                    : request.encadrant_complete === '2'
                      ? 'Décision informée'
                      : 'En concertation'}
                </div>
              </div>
            </div>
            
            <div class="list-group-item d-flex align-items-center gap-3 {validationStatus.bgColor}">
              <i class="bi {validationStatus.icon} {validationStatus.color} fs-5"></i>
              <div class="flex-grow-1">
                <strong>Validation finale</strong>
                <div class="small text-muted">
                  {request.form_complete !== '2'
                    ? 'Pas disponible'
                    : request.validation_finale_complete === '2'
                      ? 'Complète'
                      : 'À compléter'}
                </div>
              </div>
            </div>
          {/snippet}
          {#snippet links()}
            {#if request.form}
              <!-- eslint-disable svelte/no-navigation-without-resolve -->
              <a
                href={request.form}
                class="card-link">Formulaire</a
              >
              <!-- eslint-enable svelte/no-navigation-without-resolve -->
            {/if}
            {#if request.validation_finale}
              <!-- eslint-disable svelte/no-navigation-without-resolve -->
              <a
                href={request.validation_finale}
                class="card-link">Validation finale</a
              >
              <!-- eslint-enable svelte/no-navigation-without-resolve -->
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
