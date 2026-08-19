const TOKEN_KEY = 'genshield_access_token';
const USER_KEY = 'genshield_user';

export const storage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      console.error('Failed to save token to localStorage');
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      console.error('Failed to remove token from localStorage');
    }
  },

  getUser: <T>(): T | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  setUser: <T>(user: T): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      console.error('Failed to save user to localStorage');
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      console.error('Failed to remove user from localStorage');
    }
  },

  clearAuth: (): void => {
    storage.removeToken();
    storage.removeUser();
  },
};
