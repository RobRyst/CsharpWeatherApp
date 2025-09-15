import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setAuthToken } from "../api/client";

const TOKEN_KEY = "token";
const EXPIRES_AT_KEY = "token_expires_at";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeAuthResponse = (data) => {
    if (!data) return { token: null, expiresIn: null, user: null };
    const token = data.token ?? data.Token ?? null;
    const expiresIn = data.expiresIn ?? data.ExpiresIn ?? null;
    const user = data.user ??
      data.User ?? {
        id: data.id ?? data.Id,
        username: data.username ?? data.Username,
        email: data.email ?? data.Email,
        role: data.role ?? data.Role,
      };
    return { token, expiresIn, user };
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [storedToken, storedExpiresAt] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(EXPIRES_AT_KEY),
        ]);

        const now = Date.now();
        const exp = storedExpiresAt ? Number(storedExpiresAt) : null;

        if (storedToken && exp && exp > now + 5000) {
          setToken(storedToken);
          setExpiresAt(exp);
          setAuthToken(storedToken);
          await refreshProfileInternal(storedToken);
        } else {
          await clearStorage();
        }
      } catch (e) {
        await clearStorage();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearStorage = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRES_AT_KEY]);
  }, []);

  const applyToken = useCallback(
    async (jwt, userInfo = null, expiresInSeconds = 3600) => {
      if (!jwt) {
        await clearStorage();
        return;
      }
      const expMs =
        Date.now() + Math.max(1, Number(expiresInSeconds || 3600)) * 1000;

      setAuthToken(jwt);
      setToken(jwt);
      setUser(userInfo || null);
      setExpiresAt(expMs);

      await AsyncStorage.setItem(TOKEN_KEY, jwt);
      await AsyncStorage.setItem(EXPIRES_AT_KEY, String(expMs));

      if (!userInfo) {
        try {
          await refreshProfileInternal(jwt);
        } catch {}
      }
    },
    [clearStorage]
  );

  const refreshProfileInternal = useCallback(
    async (jwtOptional) => {
      try {
        const resp = await api.get("/api/auth/me", {
          headers: jwtOptional
            ? { Authorization: `Bearer ${jwtOptional}` }
            : {},
        });
        const me = resp?.data ?? null;
        if (me) {
          setUser({
            id: me.id ?? me.Id,
            username: me.username ?? me.Username,
            email: me.email ?? me.Email,
            role: me.role ?? me.Role,
          });
        }
        return me;
      } catch (e) {
        await clearStorage();
        throw e;
      }
    },
    [clearStorage]
  );

  const refreshProfile = useCallback(async () => {
    setError(null);
    return refreshProfileInternal();
  }, [refreshProfileInternal]);

  const login = useCallback(
    async ({ usernameOrEmail, password }) => {
      setError(null);
      try {
        const resp = await api.post("/api/auth/login", {
          usernameOrEmail,
          password,
        });
        const {
          token: jwt,
          expiresIn,
          user: userInfo,
        } = normalizeAuthResponse(resp?.data);
        await applyToken(jwt, userInfo, expiresIn || 3600);
        return true;
      } catch (e) {
        setError(e);
        throw e;
      }
    },
    [applyToken]
  );

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      const resp = await api.post("/api/auth/register", payload);
      return resp?.data ?? null;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearStorage();
  }, [clearStorage]);

  useEffect(() => {
    if (!expiresAt) return;
    const now = Date.now();
    const ms = Math.max(0, expiresAt - now);
    const t = setTimeout(() => {
      clearStorage();
    }, ms);
    return () => clearTimeout(t);
  }, [expiresAt, clearStorage]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loading,
      error,
      applyToken,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [
      token,
      user,
      loading,
      error,
      applyToken,
      login,
      register,
      logout,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
