const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// Auth
// ============================================================

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token =
    localStorage.getItem("access_token");

  console.log(
    "🔐 access_token:",
    token ? "FOUND" : "NOT FOUND",
  );

  return token;
}

// ============================================================
// Headers
// ============================================================

function buildHeaders(
  options?: RequestInit,
  token?: string | null,
): Headers {
  const headers = new Headers(
    options?.headers,
  );

  if (!headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  headers.set(
    "Accept",
    "application/json",
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  return headers;
}

// ============================================================
// Response
// ============================================================

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log(
    "🔥 API status:",
    response.status,
  );

  console.log(
    "🔥 API response:",
    data,
  );

  if (!response.ok) {
    if (response.status === 401) {
      console.error(
        "🔐 401 Unauthorized",
      );

      console.error(
        "🔐 Authentication credentials were not provided.",
      );
    }

    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (
        data as {
          error?: unknown;
        }
      ).error === "object" &&
      (
        data as {
          error?: unknown;
        }
      ).error !== null &&
      "message" in
        (
          data as {
            error: Record<
              string,
              unknown
            >;
          }
        ).error &&
      typeof (
        data as {
          error: {
            message?: unknown;
          };
        }
      ).error.message === "string"
        ? (
            data as {
              error: {
                message: string;
              };
            }
          ).error.message
        : typeof data === "object" &&
            data !== null &&
            "detail" in data &&
            typeof (
              data as {
                detail?: unknown;
              }
            ).detail === "string"
          ? (
              data as {
                detail: string;
              }
            ).detail
          : `API request failed: ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

// ============================================================
// GET - Public
// ============================================================

export async function apiGet<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔥 apiGet:",
    url,
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(options),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// POST - Public
// ============================================================

export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔥 apiPost:",
    url,
  );

  console.log(
    "🔥 apiPost body:",
    body,
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(options),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// PUT - Public
// ============================================================

export async function apiPut<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  const response = await fetch(
    url,
    {
      ...options,
      method: "PUT",
      cache: "no-store",
      headers: buildHeaders(options),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// PATCH - Public
// ============================================================

export async function apiPatch<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  const response = await fetch(
    url,
    {
      ...options,
      method: "PATCH",
      cache: "no-store",
      headers: buildHeaders(options),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// DELETE - Public
// ============================================================

export async function apiDelete<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url =
    `${API_BASE_URL}${endpoint}`;

  const response = await fetch(
    url,
    {
      ...options,
      method: "DELETE",
      cache: "no-store",
      headers: buildHeaders(options),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// GET - Authenticated
// ============================================================

export async function apiGetWithAuth<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "توکن احراز هویت پیدا نشد. لطفاً دوباره وارد حساب شوید.",
    );
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔐 apiGetWithAuth:",
    url,
  );

  console.log(
    "🔐 Authorization: Bearer [FOUND]",
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(
        options,
        token,
      ),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// POST - Authenticated
// ============================================================

export async function apiPostWithAuth<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "توکن احراز هویت پیدا نشد. لطفاً دوباره وارد حساب شوید.",
    );
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔐 apiPostWithAuth:",
    url,
  );

  console.log(
    "🔐 Authorization: Bearer [FOUND]",
  );

  console.log(
    "🔐 Body:",
    body,
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "POST",
      cache: "no-store",
      headers: buildHeaders(
        options,
        token,
      ),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// PUT - Authenticated
// ============================================================

export async function apiPutWithAuth<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "توکن احراز هویت پیدا نشد.",
    );
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  const response = await fetch(
    url,
    {
      ...options,
      method: "PUT",
      cache: "no-store",
      headers: buildHeaders(
        options,
        token,
      ),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// PATCH - Authenticated
// ============================================================

export async function apiPatchWithAuth<T>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "توکن احراز هویت پیدا نشد.",
    );
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔐 apiPatchWithAuth:",
    url,
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "PATCH",
      cache: "no-store",
      headers: buildHeaders(
        options,
        token,
      ),
      body: JSON.stringify(body),
    },
  );

  return handleResponse<T>(
    response,
  );
}

// ============================================================
// DELETE - Authenticated
// ============================================================

export async function apiDeleteWithAuth<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "توکن احراز هویت پیدا نشد.",
    );
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    "🔐 apiDeleteWithAuth:",
    url,
  );

  const response = await fetch(
    url,
    {
      ...options,
      method: "DELETE",
      cache: "no-store",
      headers: buildHeaders(
        options,
        token,
      ),
    },
  );

  return handleResponse<T>(
    response,
  );
}