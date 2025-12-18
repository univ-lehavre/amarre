<script lang="ts">
  import type { PageProps } from './$types';

  import Collaborate from '$lib/ui/Collaborate.svelte';
  import Administrate from '$lib/ui/Administrate.svelte';
  import ECRIN from '$lib/ui/MainTitle.svelte';
  import TopNavbar from '$lib/ui/TopNavbar.svelte';
  import Rule from '$lib/ui/Rule.svelte';
  import Follow from '$lib/ui/Follow.svelte';

  let { data, form }: PageProps = $props();

  const userId = $derived(data.user?.id);
  const email = $derived(data.user?.email);

  let containerClass = $state<'container' | 'container-fluid' | 'container-fluid w-75'>('container');
</script>

<ECRIN />

<TopNavbar />

<div class={containerClass}>
  <div
    data-bs-spy="scroll"
    data-bs-target="#navbar1"
    data-bs-root-margin="0px 0px -50%"
    data-bs-smooth-scroll="true"
  >
    <Collaborate {userId} />
    <Rule />
    {#if data.requests && data.requests.length > 0}
      <Follow requests={data.requests} />
      <Rule />
    {/if}
    <Administrate
      {userId}
      {email}
      {form}
    />
  </div>
</div>

<style>
  :global(#introduce, #explore, #ask, #collaborate, #publish, #administrate) {
    /* Empêche la navbar sticky de masquer le haut des sections ciblées */
    scroll-margin-top: var(--nav-offset);
  }
</style>
