<script lang="ts">
  import { onMount } from 'svelte';

  let { user } = $props();

  let navEl: HTMLElement | undefined;

  onMount(() => {
    const updateOffset = () => {
      if (!navEl) return;
      const h = Math.ceil(navEl.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--nav-offset', `${h}px`);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  });
</script>

<nav
  id="navbar1"
  class="navbar sticky-top bg-body px-3 mb-3 justify-content-center"
  bind:this={navEl}
>
  <ul class="nav nav-tabs justify-content-center">
    <li class="nav-item">
      <a
        class="nav-link"
        href="#collaborate"
        ><i
          class="bi bi-people me-0 me-md-2"
          aria-hidden="true"
        ></i><span class="d-none d-md-inline">Déposer</span></a
      >
    </li>

    <li class="nav-item">
      <a
        class="nav-link"
        href="#administrate"
        ><i
          class="bi bi-gear me-0 me-md-2"
          aria-hidden="true"
        ></i><span class="d-none d-md-inline">Administrer</span></a
      >
    </li>
  </ul>
</nav>
