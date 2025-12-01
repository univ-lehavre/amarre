<script lang="ts">
  import { NotificationCenter } from '$lib/notifications/index.svelte';
  import { DateTime } from 'luxon';
  import { getContext, onDestroy } from 'svelte';

  interface Props {
    id: string;
  }

  let { id }: Props = $props();

  const center = getContext('notificationCenter') as NotificationCenter;
  const { delay, type, createdAt, show, title, message, log } = center.find(id);

  let timeout: NodeJS.Timeout;
  if (delay) timeout = setTimeout(() => center.hide(id), delay);

  let closeColor = ['primary', 'secondary', 'success', 'danger', 'dark'].includes(type) ? 'btn-close-white' : undefined;

  let timeago = $state('');
  const refresh = () => {
    const r = DateTime.fromISO(createdAt).toRelative();
    if (r) timeago = r;
  };
  refresh();
  const secondInterval = setInterval(() => refresh(), 1000);

  let minuteInterval: NodeJS.Timeout;
  const minuteIntervalLaunch = setTimeout(() => {
    clearInterval(secondInterval);
    refresh();
    minuteInterval = setInterval(() => refresh(), 60000);
  }, 60000);

  onDestroy(() => {
    clearTimeout(timeout);
    clearTimeout(minuteIntervalLaunch);
    clearInterval(minuteInterval);
    clearInterval(secondInterval);
  });
</script>

{#snippet closeButton(id: string, closeColor?: string, m?: string)}
  <button
    type="button"
    class="btn-close {closeColor} {m}"
    data-bs-dismiss="toast"
    aria-label="Close"
    onclick={() => center.hide(id)}
  ></button>
{/snippet}

<div
  class="toast {show ? 'show' : ''} text-bg-{type} align-items-center border-0"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  {#if title}
    <div class="toast-header">
      <strong class="me-auto">{title}</strong>
      <small>{timeago}</small>
      {@render closeButton(id)}
    </div>
  {/if}
  <div class="d-flex">
    <div class="toast-body text-break">
      {message}

      {#if log}
        <div class="mt-2 pt-2 border-top">
          {JSON.stringify(log)}
        </div>
      {/if}
    </div>

    {#if !title}
      {@render closeButton(id, closeColor, 'me-2 m-auto')}
    {/if}
  </div>
</div>
