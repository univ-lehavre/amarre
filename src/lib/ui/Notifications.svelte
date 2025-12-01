<script lang="ts">
  import { NotificationCenter } from '$lib/notifications/index.svelte';
  import { getContext } from 'svelte';
  import Notification from './Notification.svelte';
  const center = getContext('notificationCenter') as NotificationCenter;
</script>

<div class="toast-container position-fixed top-0 end-0 p-3">
  {#each center.items as notif}
    {#if notif.show}
      <Notification id={notif.id} />
    {/if}
  {/each}
</div>
