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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5092/api/openweather";

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCurrent = useCallback(
    async ({ lat, lon, units = "metric", lang = "en" }) => {
      try {
        setLoading(true);
        setError(null);
        const resp = await axios.get(`${API_BASE}/current`, {
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
    async ({ lat, lon, units = "metric", lang = "en" }) => {
      try {
        setError(null);
        const resp = await axios.get(`${API_BASE}/hourly`, {
          params: { lat, lon, units, lang },
          headers: authHeader,
        });
        setHourly(resp.data || []);
        return resp.data || [];
      } catch (err) {
        console.error("fetchHourly failed", err);
        setError(err);
        return [];
      }
    },
    [token]
  );

  const fetchDaily = useCallback(
    async ({ lat, lon, units = "metric", lang = "en" }) => {
      try {
        setError(null);
        const resp = await axios.get(`${API_BASE}/daily`, {
          params: { lat, lon, units, lang },
          headers: authHeader,
        });
        setDaily(resp.data || []);
        return resp.data || [];
      } catch (err) {
        console.error("fetchDaily failed", err);
        setError(err);
        return [];
      }
    },
    [token]
  );

  const value = useMemo(
    () => ({
      selected,
      setSelected,
      current,
      hourly,
      daily,
      loading,
      error,
      fetchCurrent,
      fetchHourly,
      fetchDaily,
    }),
    [
      selected,
      current,
      hourly,
      daily,
      loading,
      error,
      fetchCurrent,
      fetchHourly,
      fetchDaily,
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
