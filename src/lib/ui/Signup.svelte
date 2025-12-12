<script lang="ts">
  import { isEmail } from '$lib/validators';

  let email = $state('');
  let disabledSubmit = $derived(isEmail(email) ? '' : 'disabled');
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
        >
          <span
            class="input-group-text"
            id="basic-addon1">Email</span
          >
          <input
            id="email"
            name="email"
            type="email"
            class="form-control"
            placeholder="Your professional email"
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
      </div>

      <div class="modal-footer"></div>
    </div>
  </div>
</div>
