const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
}

class AdminApiClient {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminAccessToken");
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("adminAccessToken", accessToken);
    localStorage.setItem("adminRefreshToken", refreshToken);
  }

  clearTokens() {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      const error = json as ApiError;
      const message = Array.isArray(error.message)
        ? error.message[0]
        : error.message;
      throw new Error(message || "Something went wrong");
    }

    return (json as ApiResponse<T>).data;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && String(val) !== "") {
          searchParams.set(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: "GET" });
  }
}

export const adminApi = new AdminApiClient();
