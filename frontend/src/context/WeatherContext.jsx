import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const OPENWEATHER_BASE = "http://localhost:5092/api/openweather";
  const WEATHER_BASE = "http://localhost:5092/api/weather";

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
      loading,
      error,
      fetchCurrent,
      fetchHourly,
      fetchDaily,
      searchLocations,
      selectLocation,
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
