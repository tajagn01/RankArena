/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * API Client - Centralized API access with optimizations
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Request deduplication (prevents duplicate concurrent requests)
 * - Automatic timeout handling
 * - Retry on network failures
 * - Consistent error handling
 */

import API_URL from "../config";

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════
const pendingRequests = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// CORE FETCH WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
async function request(url, options = {}) {
  const {
    method = 'GET',
    body = null,
    timeout = 15000,
    dedupe = true,
    retries = 1,
  } = options;

  // Create unique key for deduplication
  const requestKey = `${method}:${url}:${body ? JSON.stringify(body) : ''}`;

  // Return existing request if duplicate
  if (dedupe && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
        credentials: 'include', // Include cookies in requests
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (retries > 0 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
        await new Promise(r => setTimeout(r, 1000));
        return request(url, { ...options, retries: retries - 1, dedupe: false });
      }

      throw err;
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();

  if (dedupe) {
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API METHODS
// ═══════════════════════════════════════════════════════════════════════════════
export const api = {
  // Auth
  login: (credentials) => 
    request(`${API_URL}/api/auth/login`, { method: 'POST', body: credentials }),

  signup: (userData) =>
    request(`${API_URL}/api/auth/signup`, { method: 'POST', body: userData }),

  logout: () =>
    request(`${API_URL}/api/auth/logout`, { method: 'POST' }),

  // Get current user from session
  getCurrentUser: () =>
    request(`${API_URL}/api/auth/me`, { method: 'GET' }),

  // University
  getUniversityUsers: async (university) => {
    const data = await request(`${API_URL}/api/auth/university-users`, {
      method: 'POST',
      body: { university },
    });
    // Handle both { users: [...] } and direct array responses
    return Array.isArray(data) ? data : (data?.users ?? []);
  },

  refreshUniversity: (university) =>
    request(`${API_URL}/api/refresh-university`, {
      method: 'POST',
      body: { university },
    }),

  // Universities list
  getUniversities: () =>
    request(`${API_URL}/api/universities`),
};

export default api;
