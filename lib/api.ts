const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
  timestamp: string;
  path: string;
}

class ApiClient {
  // ── Token refresh concurrency guard ───────────────────────────────────────
  // If multiple requests fire at the same time and all get 401, only the first
  // one should call /auth/refresh. The rest wait in a queue and reuse the
  // new token once it arrives.
  private isRefreshing = false;
  private refreshQueue: ((newToken: string | null) => void)[] = [];

  // ── Storage helpers ───────────────────────────────────────────────────────

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  // ── Silent refresh ────────────────────────────────────────────────────────
  // Calls POST /auth/refresh with the stored refresh token.
  // Returns the new access token, or null if the refresh token is expired/missing.

  private async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!res.ok) {
        this.clearTokens();
        return null;
      }

      const json = await res.json();
      const data = (json as ApiResponse<{ accessToken: string; refreshToken: string }>).data;
      this.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  // Called when the refresh token is also expired — signals the AuthProvider
  // to clear state and send the user to /login.
  private signalSessionExpired() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
  }

  // ── Core request ──────────────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    // ── Handle 401 with silent token refresh (only once per original request) ──
    if (
      res.status === 401 &&
      !isRetry &&
      !endpoint.includes("/auth/refresh") &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/admin/login")
    ) {
      let newToken: string | null;

      if (this.isRefreshing) {
        // Another request already triggered a refresh — wait for it
        newToken = await new Promise<string | null>((resolve) => {
          this.refreshQueue.push(resolve);
        });
      } else {
        // This request is first to see the 401 — do the refresh
        this.isRefreshing = true;
        newToken = await this.performRefresh();
        // Unblock all queued requests with the outcome
        this.refreshQueue.forEach((resolve) => resolve(newToken));
        this.refreshQueue = [];
        this.isRefreshing = false;
      }

      if (!newToken) {
        // Refresh token also expired — force logout
        this.signalSessionExpired();
        throw new Error("Your session has expired. Please log in again.");
      }

      // Retry the original request once with the fresh token
      const retryHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(url, { ...options, headers: retryHeaders });
      const retryJson = await retryRes.json();

      if (!retryRes.ok) {
        const err = retryJson as ApiError;
        const msg = Array.isArray(err.message) ? err.message[0] : err.message;
        throw new Error(msg || "Something went wrong");
      }

      return (retryJson as ApiResponse<T>).data;
    }

    // ── Normal path ───────────────────────────────────────────────────────────
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

  // ── Public methods ────────────────────────────────────────────────────────

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async getWithParams<T>(
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

  async postForm<T>(endpoint: string, body: FormData): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }
}

export const api = new ApiClient();
