import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/v1/health/status');
    const data = await response.json();
    return { healthData: data, statusCode: response.status };
  } catch (error) {
    return {
      healthData: {
        data: null,
        error: {
          code: 'fetch_error',
          message: error instanceof Error ? error.message : 'Failed to fetch health status',
        },
      },
      statusCode: 500,
    };
  }
};
