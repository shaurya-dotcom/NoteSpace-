const BASE_URL = 'http://localhost:5000/api';

let accessToken = localStorage.getItem('accessToken') || '';

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
};

export const apiFetch = async (endpoint, options = {}) => {
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    }
  };

  let res = await fetch(`${BASE_URL}${endpoint}`, config);

  // If access token expired (403), try refreshing once
  if (res.status === 403 && !endpoint.includes('/auth/')) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      res = await fetch(`${BASE_URL}${endpoint}`, config);
    } else {
      setAccessToken('');
      window.location.href = '/login';
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'API Request Failed');
  return data;
};