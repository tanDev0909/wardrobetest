// Real weather via Open-Meteo (free, no API key). Always degrades gracefully:
// if geolocation is denied or the request fails, we return a neutral fallback
// that the Today screen lets the user override manually.

import type { Weather } from "@/types";

export const FALLBACK_WEATHER: Weather = {
  tempC: 20,
  condition: "mild",
  isFallback: true,
};

// WMO weather codes → our small condition vocabulary.
function codeToCondition(code: number, tempC: number): string {
  if (code === 0) return tempC < 10 ? "cold" : "sunny";
  if (code >= 1 && code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "cloudy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 85 && code <= 86) return "snowy";
  if (code >= 95) return "rainy";
  return tempC < 10 ? "cold" : "mild";
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 600000,
    });
  });
}

export async function getWeather(): Promise<Weather> {
  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
      `&longitude=${longitude}&current=temperature_2m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
    const data = await res.json();
    const tempC = Math.round(data?.current?.temperature_2m);
    const code = Number(data?.current?.weather_code ?? 0);
    if (Number.isNaN(tempC)) throw new Error("Malformed weather payload");
    return {
      tempC,
      condition: codeToCondition(code, tempC),
      isFallback: false,
    };
  } catch {
    return FALLBACK_WEATHER;
  }
}
