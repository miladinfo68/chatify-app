// tokenManager.ts

export interface TokenManager {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

export class TokenManagerService implements TokenManager {
  private tokenKey = process.env.AUTH_TOKEN_NAME ?? "JWT_TOKEN";

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.tokenKey);
  }
}

// Export a shared instance
export const tokenManager = new TokenManagerService();
