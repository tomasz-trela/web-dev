const BASE_URL = 'http://localhost:8080/api';

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let body: BodyInit | null | undefined = options.body;
  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
  }

  const response = await fetch(url, { ...options, headers, body });

  if (!response.ok) {
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;
    throw new ApiError(response.status, parsed);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export default {
  get: <T>(endpoint: string) => fetchClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) =>
    fetchClient<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) =>
    fetchClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchClient<T>(endpoint, { method: 'DELETE' }),
};
