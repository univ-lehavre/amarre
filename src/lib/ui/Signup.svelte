<script lang="ts">
  import type { APIResponse } from '$lib/types';
  import { isEmail } from '$lib/validators';
  import { enhance } from '$app/forms';
  import { fade } from 'svelte/transition';

  let { form } = $props();

  let email = $state('');
  let signuping = $state(false);
  let disabledSubmit = $derived(!isEmail(email) || signuping ? 'disabled' : '');
</script>

<div
  class="modal fade"
  id="SignUp"
  tabindex="-1"
  aria-labelledby="SignUpLabel"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1
          class="modal-title fs-5"
          id="SignUpLabel"
        >
          Authentification à votre compte
        </h1>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <p>
          Pour accéder à mes demandes, je vais m'authentifier. Cette action déposera un cookie nécessaire au bon
          fonctionnement du site dans votre navigateur. Pour le supprimer après l'authentification, il suffira que je me
          déconnecte.
        </p>
        <form
          method="post"
          action="?/signup"
          class="input-group mb-3"
          use:enhance={() => {
            signuping = true;
            return async ({ update }) => {
              await update();
              signuping = false;
            };
          }}
        >
          <span
            class="input-group-text"
            id="basic-addon1">Courriel</span
          >
          <input
            id="email"
            name="email"
            type="email"
            class="form-control"
            placeholder="prenom.nom@univ-lehavre.fr"
            aria-label="Email"
            aria-describedby="basic-addon1"
            bind:value={email}
          />
          <button
            type="submit"
            class="btn btn-primary {disabledSubmit}"
          >
            S'authentifier</button
          >
        </form>
        {#if signuping}
          <div
            class="alert alert-info alert-dismissible fade show align-items-center d-flex"
            role="alert"
          >
            <div
              class="spinner-border me-2"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
            <span> Envoi en cours... </span>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        {/if}
        {#if form?.wrongSignupEmail}
          <div
            class="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <span>
              {form.message} : {form.cause}.
            </span>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        {/if}
        {#if form?.data}
          <div
            class="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            <span> Un courriel d'authentification vous a été envoyé. Veuillez vérifier votre boîte de réception. </span>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        {/if}
      </div>

      <div class="modal-footer"></div>
    </div>
  </div>
</div>
