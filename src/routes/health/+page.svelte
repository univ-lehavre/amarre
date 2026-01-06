<script lang="ts">
  import type { PageProps } from './$types';
  import { onMount } from 'svelte';

  // Configuration
  const AUTO_REFRESH_INTERVAL_MS = 10000; // 10 seconds
  const LATENCY_GOOD_THRESHOLD_MS = 1000; // Under 1s is good
  const LATENCY_DEGRADED_THRESHOLD_MS = 3000; // 1-3s is degraded, over 3s is bad

  let { data }: PageProps = $props();

  let autoRefresh = $state(false);
  let refreshInterval = $state<number | null>(null);
  let isRefreshing = $state(false);

  const refreshData = async () => {
    isRefreshing = true;
    try {
      const response = await fetch('/api/v1/health/status');
      const newData = await response.json();
      data.healthData = newData;
      data.statusCode = response.status;
    } catch (error) {
      console.error('Failed to refresh health data:', error);
      // Show error in UI
      data.healthData = {
        data: null,
        error: { code: 'refresh_failed', message: 'Failed to refresh health data. Information may be outdated.' },
      };
      data.statusCode = 500;
    } finally {
      isRefreshing = false;
    }
  };

  const toggleAutoRefresh = () => {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
      refreshInterval = window.setInterval(refreshData, AUTO_REFRESH_INTERVAL_MS);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  onMount(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  const healthData = $derived(data.healthData);
  const overallStatus = $derived(healthData?.data?.status || 'unknown');
  const timestamp = $derived(healthData?.data?.timestamp);
  const uptime = $derived(healthData?.data?.uptime);
  const services = $derived(healthData?.data?.services || []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy ✓';
      case 'degraded':
        return 'Degraded ⚠';
      case 'unhealthy':
        return 'Unhealthy ✗';
      default:
        return 'Unknown ?';
    }
  };
</script>

<svelte:head>
  <title>System Health - AMARRE</title>
</svelte:head>

<div class="container my-5">
  <div class="row">
    <div class="col-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-4">System Health</h1>
        <div>
          <button
            class="btn btn-outline-primary me-2"
            onclick={refreshData}
            disabled={isRefreshing}
            aria-label="Refresh health status"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            class="btn {autoRefresh ? 'btn-success' : 'btn-outline-secondary'}"
            onclick={toggleAutoRefresh}
            aria-pressed={autoRefresh}
            aria-label="Toggle automatic refresh every 10 seconds"
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {#if healthData?.error}
        <div
          class="alert alert-danger"
          role="alert"
        >
          <h4 class="alert-heading">Error</h4>
          <p><strong>{healthData.error.code}</strong>: {healthData.error.message}</p>
        </div>
      {:else if healthData?.data}
        <!-- Overall Status Card -->
        <div class="card mb-4 border-{getStatusColor(overallStatus)}">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h2 class="card-title mb-3">
                  <span class="badge bg-{getStatusColor(overallStatus)} fs-4">
                    {getStatusIcon(overallStatus)}
                    {overallStatus.toUpperCase()}
                  </span>
                </h2>
                <p class="card-text mb-2">
                  <strong>Server Uptime:</strong>
                  {uptime ? formatUptime(uptime) : 'N/A'}
                </p>
                <p class="card-text text-muted">
                  <strong>Last Checked:</strong>
                  {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div class="col-md-4 text-center">
                <div class="display-1 text-{getStatusColor(overallStatus)}">
                  {getStatusIcon(overallStatus)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Services Status -->
        <h3 class="mb-3">Service Status</h3>
        {#if services.length > 0}
          <div class="row">
            {#each services as service (service.name)}
              <div class="col-md-6 mb-3">
                <div class="card h-100 border-{getStatusColor(service.status)}">
                  <div class="card-body">
                    <h5 class="card-title d-flex justify-content-between align-items-center">
                      <span>{service.name}</span>
                      <span class="badge bg-{getStatusColor(service.status)}">
                        {getStatusIcon(service.status)}
                        {service.status}
                      </span>
                    </h5>
                    {#if service.message}
                      <p class="card-text text-muted small">{service.message}</p>
                    {/if}
                    {#if service.latencyMs !== undefined}
                      <p class="card-text">
                        <strong>Latency:</strong>
                        <span
                          class="text-{service.latencyMs < LATENCY_GOOD_THRESHOLD_MS
                            ? 'success'
                            : service.latencyMs < LATENCY_DEGRADED_THRESHOLD_MS
                              ? 'warning'
                              : 'danger'}"
                        >
                          {service.latencyMs}ms
                        </span>
                      </p>
                    {/if}
                    <p class="card-text text-muted small">
                      <strong>Checked:</strong>
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div
            class="alert alert-info"
            role="alert"
          >
            No services to monitor at the moment.
          </div>
        {/if}
      {:else}
        <div class="text-center py-5">
          <div
            class="spinner-border text-primary"
            role="status"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading health status...</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .display-1 {
    font-size: 6rem;
    font-weight: 300;
  }

  .card {
    transition: box-shadow 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .badge {
    font-weight: 500;
  }
</style>
