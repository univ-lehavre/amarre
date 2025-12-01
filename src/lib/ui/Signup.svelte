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
          Sign up
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
          To gain access to additional content, please authenticate yourself. This action will set a necessary cookie in
          your browser. To remove it after authentication, just log out.
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
            class="btn btn-primary {disabledSubmit}">Sign up</button
          >
        </form>
      </div>

      <div class="modal-footer"></div>
    </div>
  </div>
</div>
