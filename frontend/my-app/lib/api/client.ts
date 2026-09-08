// lib/api/client.ts
const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiGet<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      cache: "no-store", // <-- این رو عوض کردم
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
  console.log('🔥 apiGet - data.category:', data?.data?.category);
  console.log('🔥 apiGet - description:', data?.data?.category?.description);

  return data;
}

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

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}

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

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}

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

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`,
    );
  }

  return response.json();
}