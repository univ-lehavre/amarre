<script lang="ts">
  import { isEmail } from '$lib/validators';

  import { getContext } from 'svelte';
  import { NotificationCenter, Color } from '$lib/notifications/index.svelte';

  let email = $state('');
  let disabledSubmit = $derived(isEmail(email) ? '' : 'disabled');
  //let { form } = $props();

  //   const center = getContext('notificationCenter') as NotificationCenter;

  //   const signal = form?.done
  //     ? {
  //         type: Color.Primary,
  //         title: 'Registration',
  //         message: 'We just send you an email. Please check your mailbox to complete your authentication.',
  //       }
  //     : form?.error
  //       ? {
  //           type: Color.Warning,
  //           title: 'Registration',
  //           message: 'Unable to register. Please inform your administrator giving the following details',
  //           log: form,
  //         }
  //       : undefined;
  //   if (signal) center.add(signal);
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
          Connexion à votre compte
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
          Pour accéder à du contenu supplémentaire, veuillez vous authentifier. Cette action déposera un cookie
          nécessaire au bon fonctionnement du site dans votre navigateur. Pour le supprimer après l'authentification, il
          suffira de vous déconnecter.
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
            class="btn btn-primary {disabledSubmit}">Connexion</button
          >
        </form>
      </div>

      <div class="modal-footer"></div>
    </div>
  </div>
</div>
