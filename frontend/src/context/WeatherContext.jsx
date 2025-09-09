import React, { createContext, useContext, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/client";

function debounce(fn, delay = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const WeatherCtx = createContext(null);

export function WeatherProvider({ children }) {
  const [token, setToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function applyToken(jwt) {
    setToken(jwt);
    setAuthToken(jwt);
  }

  const doSearch = async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }
    if (!token) {
      setError("Not authenticated — login first.");
      return;
    }
    try {
      setError(null);
      const resp = await api.get(
        `/api/openweather/geocode?query=${encodeURIComponent(query)}`
      );
      setSearchResults(resp.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const searchLocations = useMemo(() => debounce(doSearch, 350), [token]);

  const selectLocation = (loc) => {
    if (!loc) return;
    setSelected({
      name: loc.name,
      country: loc.country ?? "",
      lat: loc.lat,
      lon: loc.lon,
    });
  };

  const fetchCurrent = async ({ lat, lon, units = "metric", lang = "en" }) => {
    if (!token) {
      setError("Not authenticated — login first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get(
        `/api/openweather/current?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}`
      );
      setCurrent(resp.data);
    } catch (e) {
      setError(
        e?.response?.data?.detail || e?.response?.data?.error || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchHourly = async () => {
    return [];
  };
  const fetchDaily = async () => {
    return [];
  };

  const value = {
    token,
    applyToken,
    searchResults,
    searchLocations,
    selectLocation,
    selected,
    current,
    fetchCurrent,
    fetchHourly,
    fetchDaily,
    loading,
    error,
  };

  return <WeatherCtx.Provider value={value}>{children}</WeatherCtx.Provider>;
}

export function useWeather() {
  const ctx = useContext(WeatherCtx);
  if (!ctx) throw new Error("useWeather must be used inside WeatherProvider");
  return ctx;
}
