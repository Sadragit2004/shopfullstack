// lib/api/client.ts
const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// apiGet
// ============================================================
export async function apiGet<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    },
  );

  console.log('🔥 apiGet - endpoint:', endpoint);
  console.log('🔥 apiGet - response status:', response.status);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  const data = await response.json();
  console.log('🔥 apiGet - raw data:', data);

  return data;
}

// ============================================================
// apiPost
// ============================================================
export async function apiPost<T>(
  endpoint: string,
  body: any,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...options,
    },
  );

  console.log('🔥 apiPost - endpoint:', endpoint);
  console.log('🔥 apiPost - response status:', response.status);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  const data = await response.json();
  console.log('🔥 apiPost - raw data:', data);

  return data;
}

// ============================================================
// apiPut
// ============================================================
export async function apiPut<T>(
  endpoint: string,
  body: any,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'PUT',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...options,
    },
  );

  console.log('🔥 apiPut - endpoint:', endpoint);
  console.log('🔥 apiPut - response status:', response.status);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  const data = await response.json();
  console.log('🔥 apiPut - raw data:', data);

  return data;
}

// ============================================================
// apiDelete
// ============================================================
export async function apiDelete<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'DELETE',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    },
  );

  console.log('🔥 apiDelete - endpoint:', endpoint);
  console.log('🔥 apiDelete - response status:', response.status);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  const data = await response.json();
  console.log('🔥 apiDelete - raw data:', data);

  return data;
}

// ============================================================
// apiGetWithAuth - برای درخواست‌های نیازمند توکن
// ============================================================
export async function apiGetWithAuth<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    },
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}

// ============================================================
// apiPostWithAuth - برای درخواست‌های POST نیازمند توکن
// ============================================================
export async function apiPostWithAuth<T>(
  endpoint: string,
  body: any,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
      ...options,
    },
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}