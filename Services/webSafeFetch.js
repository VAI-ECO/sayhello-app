// Web-safe fetch wrapper that handles errors gracefully
// This prevents network errors from crashing the app on web preview

const webSafeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // If the response is not ok, return a safe mock response for web preview
    if (!response.ok && typeof window !== 'undefined') {
      console.warn('[Web Preview] Network request failed, returning mock data:', url);
      return {
        ok: false,
        status: response.status,
        json: async () => ({
          error: 'Web preview mode - mock data',
          message: 'This would contain real data on a mobile device'
        }),
        text: async () => 'Web preview mode - mock data',
      };
    }

    return response;
  } catch (error) {
    console.warn('[Web Preview] Network error caught, returning safe mock:', error.message);
    // Return a safe mock response that won't crash the app
    return {
      ok: false,
      status: 0,
      json: async () => ({
        error: 'Network error in web preview',
        message: 'This would work on a mobile device',
        data: []
      }),
      text: async () => 'Network error in web preview',
    };
  }
};

// Axios-style wrapper for compatibility
export const safeAxios = {
  get: async (url, config) => {
    const response = await webSafeFetch(url, {
      method: 'GET',
      ...config
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },
  post: async (url, data, config) => {
    const response = await webSafeFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      ...config
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },
  put: async (url, data, config) => {
    const response = await webSafeFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...config?.headers },
      ...config
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },
  delete: async (url, config) => {
    const response = await webSafeFetch(url, {
      method: 'DELETE',
      ...config
    });
    return {
      data: await response.json(),
      status: response.status,
      ok: response.ok,
    };
  },
};

export default webSafeFetch;
