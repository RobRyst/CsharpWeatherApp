export function isDayFromOpenWeather(current) {
  const icon = current?.weather?.[0]?.icon;
  if (typeof icon === "string" && (icon.endsWith("d") || icon.endsWith("n"))) {
    return icon.endsWith("d");
  }
  const now = (current?.dt ?? 0) * 1000;
  const sunrise = (current?.sys?.sunrise ?? 0) * 1000;
  const sunset = (current?.sys?.sunset ?? 0) * 1000;
  if (now && sunrise && sunset) return now >= sunrise && now < sunset;
  return true;
}

export function conditionToKey(current) {
  const icon = current?.weather?.[0]?.icon ?? "";
  const main = (current?.weather?.[0]?.main ?? "").toLowerCase();

  const prefix = icon.slice(0, 2);
  if (prefix === "01") return "clear";
  if (prefix === "02" || prefix === "03") return "partly";
  if (prefix === "04") return "clouds";
  if (prefix === "09" || prefix === "10") return "rain";
  if (prefix === "11") return "thunder";
  if (prefix === "13") return "snow";
  if (prefix === "50") return "mist";

  if (main.includes("thunder")) return "thunder";
  if (main.includes("snow")) return "snow";
  if (main.includes("rain") || main.includes("drizzle")) return "rain";
  if (main.includes("cloud")) return "clouds";
  if (main.includes("mist") || main.includes("fog") || main.includes("haze"))
    return "mist";
  if (main.includes("clear")) return "clear";

  return "default";
}

export const WEATHER_GRADIENTS = {
  clear_day: ["#74EBD5", "#9FACE6"],
  partly_day: ["#7FCDFF", "#4A80F0"],
  clouds_day: ["#b9c6d6", "#6b7a8f"],
  rain_day: ["#9aa9b2", "#4d6572"],
  thunder_day: ["#6d7e8e", "#263238"],
  snow_day: ["#e6f2ff", "#a3b8d6"],
  mist_day: ["#cfd8dc", "#90a4ae"],

  clear_night: ["#0f2027", "#203a43"],
  partly_night: ["#1b2735", "#090a0f"],
  clouds_night: ["#2a3a4a", "#0f1a24"],
  rain_night: ["#263238", "#0d1419"],
  thunder_night: ["#1c2230", "#0b0f16"],
  snow_night: ["#3a4756", "#1e272f"],
  mist_night: ["#37474f", "#263238"],

  default_day: ["#6a85b6", "#bac8e0"],
  default_night: ["#0f2027", "#203a43"],
};

export function pickGradient(current) {
  const day = isDayFromOpenWeather(current);
  const key = conditionToKey(current);
  const mapKey = `${key}_${day ? "day" : "night"}`;
  return (
    WEATHER_GRADIENTS[mapKey] ??
    WEATHER_GRADIENTS[day ? "default_day" : "default_night"]
  );
}
