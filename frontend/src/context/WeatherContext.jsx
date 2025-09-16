import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const { token } = useAuth();

  const [selected, setSelected] = useState(null);

  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);

  const [searchResults, setSearchResults] = useState([]);

  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const OPENWEATHER_BASE = "http://localhost:5092/api/openweather";
  const WEATHER_BASE = "http://localhost:5092/api/weather";
  const FAVORITES_BASE = "http://localhost:5092/api/favorites";

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCurrent = useCallback(
    async ({ lat, lon, units = "metric", lang = "en" }) => {
      try {
        setLoading(true);
        setError(null);
        const resp = await axios.get(`${OPENWEATHER_BASE}/current`, {
          params: { lat, lon, units, lang },
          headers: authHeader,
        });
        setCurrent(resp.data);
        return resp.data;
      } catch (err) {
        console.error("fetchCurrent failed", err);
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const fetchHourly = useCallback(
    async ({ lat, lon, hours = 24, units = "metric", lang = "en" }) => {
      try {
        setError(null);
        const resp = await axios.get(`${WEATHER_BASE}/hourly`, {
          params: { lat, lon, hours, units, lang },
          headers: authHeader,
        });
        const data = resp.data || [];
        setHourly(data);
        return data;
      } catch (err) {
        console.error("fetchHourly failed", err);
        setError(err);
        return [];
      }
    },
    [token]
  );

  const fetchDaily = useCallback(
    async ({ lat, lon, days = 7, units = "metric", lang = "en" }) => {
      try {
        setError(null);
        const resp = await axios.get(`${WEATHER_BASE}/weekly`, {
          params: { lat, lon, days, units, lang },
          headers: authHeader,
        });
        const data = resp.data || [];
        setDaily(data);
        return data;
      } catch (err) {
        console.error("fetchDaily failed", err);
        setError(err);
        return [];
      }
    },
    [token]
  );

  const searchLocations = useCallback(
    async (query) => {
      if (!query?.trim()) {
        setSearchResults([]);
        return [];
      }
      try {
        setError(null);
        const resp = await axios.get(`${OPENWEATHER_BASE}/geocode`, {
          params: { query },
          headers: authHeader,
        });
        const data = Array.isArray(resp.data) ? resp.data : [];
        setSearchResults(data);
        return data;
      } catch (err) {
        console.error("searchLocations failed", err);
        setError(err);
        setSearchResults([]);
        return [];
      }
    },
    [token]
  );

  const selectLocation = useCallback((loc) => setSelected(loc), []);

  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return [];
    }
    try {
      const resp = await axios.get(FAVORITES_BASE, { headers: authHeader });
      const data = Array.isArray(resp.data) ? resp.data : [];
      setFavorites(data);
      return data;
    } catch (err) {
      console.error("loadFavorites failed", err);
      return [];
    }
  }, [token]);

  const addFavorite = useCallback(
    async (loc) => {
      if (!token || !loc) return null;
      try {
        const body = {
          name: loc.name,
          countryCode: loc.country,
          state: loc.state ?? null,
          latitude: loc.lat,
          longitude: loc.lon,
        };
        const resp = await axios.post(FAVORITES_BASE, body, {
          headers: authHeader,
        });
        await loadFavorites();
        return resp.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          await loadFavorites();
          return null;
        }
        console.error("addFavorite failed", err);
        throw err;
      }
    },
    [token, loadFavorites]
  );

  const removeFavorite = useCallback(
    async (favoriteId) => {
      if (!token) return false;
      try {
        await axios.delete(`${FAVORITES_BASE}/${favoriteId}`, {
          headers: authHeader,
        });
        await loadFavorites();
        return true;
      } catch (err) {
        console.error("removeFavorite failed", err);
        return false;
      }
    },
    [token, loadFavorites]
  );

  const findFavoriteFor = useCallback(
    (loc) => {
      if (!loc || favorites.length === 0) return null;
      const key = (n) => Number.parseFloat(n).toFixed(4);
      return (
        favorites.find(
          (f) =>
            key(f.latitude) === key(loc.lat) &&
            key(f.longitude) === key(loc.lon)
        ) || null
      );
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (loc) => {
      if (!token) return { ok: false, reason: "auth" };
      const existing = findFavoriteFor(loc);
      if (existing) {
        await removeFavorite(existing.id);
        return { ok: true, removed: true, id: existing.id };
      } else {
        const created = await addFavorite(loc);
        return { ok: true, created };
      }
    },
    [token, findFavoriteFor, removeFavorite, addFavorite]
  );

  useEffect(() => {
    (async () => {
      await loadFavorites();
    })();
  }, [token, loadFavorites]);

  const isSelectedFavorite = useMemo(() => {
    if (!selected || favorites.length === 0) return null;
    const key = (number) => Number.parseFloat(number).toFixed(4);
    return (
      favorites.find(
        (f) =>
          key(f.latitude) === key(selected.lat) &&
          key(f.longitude) === key(selected.lon)
      ) || null
    );
  }, [favorites, selected]);

  const value = useMemo(
    () => ({
      token,

      selected,
      setSelected,
      selectLocation,

      current,
      hourly,
      daily,

      searchResults,
      searchLocations,

      favorites,
      loadFavorites,
      addFavorite,
      removeFavorite,
      findFavoriteFor,
      toggleFavorite,
      isSelectedFavorite,

      loading,
      error,

      fetchCurrent,
      fetchHourly,
      fetchDaily,
    }),
    [
      token,
      selected,
      current,
      hourly,
      daily,
      searchResults,
      favorites,
      findFavoriteFor,
      toggleFavorite,
      isSelectedFavorite,
      loading,
      error,
      fetchCurrent,
      fetchHourly,
      fetchDaily,
      searchLocations,
      selectLocation,
      loadFavorites,
      addFavorite,
      removeFavorite,
    ]
  );

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used inside <WeatherProvider>");
  return ctx;
}
