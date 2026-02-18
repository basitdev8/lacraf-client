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
  // ── Token refresh concurrency guard ───────────────────────────────────────
  private isRefreshing = false;
  private refreshQueue: ((newToken: string | null) => void)[] = [];

  // ── Storage helpers ───────────────────────────────────────────────────────

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminAccessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminRefreshToken");
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

  // ── Silent refresh ────────────────────────────────────────────────────────

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
      const data = (
        json as ApiResponse<{ accessToken: string; refreshToken: string }>
      ).data;
      this.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  private signalSessionExpired() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin:session-expired"));
    }
  }

  // ── Core request ──────────────────────────────────────────────────────────

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

    // ── Handle 401 with silent token refresh ──────────────────────────────
    if (
      res.status === 401 &&
      !endpoint.includes("/auth/refresh") &&
      !endpoint.includes("/admin/login")
    ) {
      let newToken: string | null;

      if (this.isRefreshing) {
        newToken = await new Promise<string | null>((resolve) => {
          this.refreshQueue.push(resolve);
        });
      } else {
        this.isRefreshing = true;
        newToken = await this.performRefresh();
        this.refreshQueue.forEach((resolve) => resolve(newToken));
        this.refreshQueue = [];
        this.isRefreshing = false;
      }

      if (!newToken) {
        this.signalSessionExpired();
        throw new Error("Your session has expired. Please log in again.");
      }

      // Retry with fresh token
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

    // ── Normal path ───────────────────────────────────────────────────────
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
