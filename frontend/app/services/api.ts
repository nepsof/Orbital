const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2831';

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  status: number;
  path?: string; // For single folder picker
  paths?: string[]; // For multiple folder picker
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: data.message || 'Something went wrong',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch {
    return {
      error: 'Network error',
      status: 0,
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<ApiResponse<T>>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) => 
    fetchApi<ApiResponse<T>>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => 
    fetchApi<ApiResponse<T>>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) => 
    fetchApi<ApiResponse<T>>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchApi<ApiResponse<T>>(endpoint, { method: 'DELETE' }),
};

export default api;
