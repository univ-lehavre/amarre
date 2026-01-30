<script lang="ts">
  const logos = [
    { src: '/logos/ulhn.svg', alt: 'Université Le Havre Normandie' },
    { src: '/logos/cptmp.png', alt: 'Campus Polytechnique des Territoires Maritimes et Portuaires' },
    { src: '/logos/eunicoast.png', alt: 'EUNICoast' },
    { src: '/logos/france-2030.png', alt: 'France 2030' },
    { src: '/logos/region-normandie.jpg', alt: 'Région Normandie' },
  ];
</script>

<footer class="footer py-4">
  <div class="container">
    <div class="d-flex justify-content-center align-items-center gap-4 flex-wrap">
      {#each logos as logo (logo.src)}
        <img
          src={logo.src}
          alt={logo.alt}
          class="logo"
        />
      {/each}
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: white;
  }

  .logo {
    height: 60px;
    width: auto;
    object-fit: contain;
  }
</style>
