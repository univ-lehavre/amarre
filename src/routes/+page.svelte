<script lang="ts">
  import type { PageProps } from './$types';

  import Collaborate from '$lib/ui/Collaborate.svelte';
  import Administrate from '$lib/ui/Administrate.svelte';
  import ECRIN from '$lib/ui/ECRIN.svelte';
  import TopNavbar from '$lib/ui/TopNavbar.svelte';
  import Rule from '$lib/ui/Rule.svelte';

  let { data }: PageProps = $props();

  const userId = $derived(data.user?.id);
  const hasPushedAccount = $derived(data.pushed?.hasPushedAccount);
  const url = $derived(data.url);
  const email = $derived(data.user?.email);

  console.log('Page data:', data);

  let containerClass = $state<'container' | 'container-fluid' | 'container-fluid w-75'>('container');
</script>

<ECRIN />

<TopNavbar user={data.user} />

<div class={containerClass}>
  <div
    data-bs-spy="scroll"
    data-bs-target="#navbar1"
    data-bs-root-margin="0px 0px -50%"
    data-bs-smooth-scroll="true"
  >
    <Collaborate
      {userId}
      {url}
      {hasPushedAccount}
    />
    <Rule />
    <Administrate
      {userId}
      {email}
      {url}
      {hasPushedAccount}
    />
  </div>
</div>

<style>
  :global(#introduce, #explore, #ask, #collaborate, #publish, #administrate) {
    /* Empêche la navbar sticky de masquer le haut des sections ciblées */
    scroll-margin-top: var(--nav-offset);
  }
</style>
