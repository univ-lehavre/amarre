<script lang="ts">
  import Notifications from '$lib/ui/Notifications.svelte';
  import { NotificationCenter } from '$lib/notifications/index.svelte';
  import { setContext } from 'svelte';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  const center = new NotificationCenter();

  setContext('notificationCenter', center);
</script>

<Notifications />

{@render children()}
