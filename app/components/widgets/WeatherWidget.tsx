'use client';

import React, { useEffect, useState } from 'react';
import type { WeatherWidgetConfig, WeatherData } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

function renderWeatherIcon(code: number, isDay: boolean = true) {
  if (code === 0) {
    return isDay ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    );
  }
  if (code === 1 || code === 2 || code === 3) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>
    );
  }
  if (code >= 45 && code <= 48) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="5" y1="18" x2="19" y2="18"/></svg>
    );
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 13v8M8 13v8M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>
    );
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="17" x2="12" y2="17.01"/><line x1="16" y1="15" x2="16" y2="15.01"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>
    );
  }
  if (code >= 95 && code <= 99) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
  );
}

function getWeatherText(code: number) {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

interface GeoResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export default function WeatherWidget({ config }: { config: WeatherWidgetConfig }) {
  const [weatherConfig, setWeatherConfig] = useState<{
    location: string;
    latitude: number;
    longitude: number;
    units: 'metric' | 'imperial';
  }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-weather-${config.id || 'default'}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.latitude && parsed.longitude) return parsed;
        } catch {}
      }
    }
    return {
      location: config.location || 'New York',
      latitude: config.latitude || 40.7128,
      longitude: config.longitude || -74.006,
      units: config.units || 'metric',
    };
  });

  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-weather-${config.id || 'default'}`, JSON.stringify(weatherConfig));
    }
  }, [weatherConfig, config.id]);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/weather?lat=${weatherConfig.latitude}&lon=${weatherConfig.longitude}&units=${weatherConfig.units}`
        );
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [weatherConfig]);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setGeoResults([]);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5`
      );
      if (res.ok) {
        const json = await res.json();
        setGeoResults(json.results || []);
      }
    } catch {
      // Ignore
    } finally {
      setSearching(false);
    }
  };

  const selectCity = (city: GeoResult) => {
    const locName = `${city.name}${city.country ? `, ${city.country}` : ''}`;
    setWeatherConfig({
      ...weatherConfig,
      location: locName,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setSearchQuery('');
    setGeoResults([]);
    setShowSettings(false);
  };

  return (
    <WidgetShell
      title={config.title || weatherConfig.location || 'Weather'}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
      headerAction={
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-[11px] font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {showSettings ? '✕ Close' : '⚙ Location'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showSettings && (
          <div className="flex flex-col gap-2.5 p-3 rounded border border-subtle bg-subtle/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-secondary">Units:</span>
              <div className="flex items-center gap-1.5 bg-input border border-subtle rounded p-0.5">
                <button
                  onClick={() => setWeatherConfig({ ...weatherConfig, units: 'metric' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    weatherConfig.units === 'metric' ? 'bg-primary text-background' : 'text-tertiary hover:text-primary'
                  }`}
                >
                  °C (Metric)
                </button>
                <button
                  onClick={() => setWeatherConfig({ ...weatherConfig, units: 'imperial' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    weatherConfig.units === 'imperial' ? 'bg-primary text-background' : 'text-tertiary hover:text-primary'
                  }`}
                >
                  °F (Imperial)
                </button>
              </div>
            </div>

            <form onSubmit={handleCitySearch} className="flex flex-col gap-1.5 pt-2 border-t border-subtle">
              <span className="font-semibold text-secondary">Search City:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter city (e.g. London, Tokyo)"
                  className="flex-1 px-2.5 py-1 bg-input border border-subtle rounded text-primary focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                <button type="submit" className="px-3 py-1 font-semibold bg-primary text-background rounded cursor-pointer">
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            {geoResults.length > 0 && (
              <div className="flex flex-col gap-1 pt-1 border-t border-subtle max-h-36 overflow-y-auto">
                <span className="text-[10px] text-tertiary font-semibold">Select Result:</span>
                {geoResults.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectCity(r)}
                    className="text-left px-2 py-1 rounded hover:bg-subtle text-xs text-primary transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {r.name} {r.admin1 ? `(${r.admin1})` : ''} {r.country ? `, ${r.country}` : ''}
                    </span>
                    <span className="text-[10px] font-mono text-tertiary">
                      {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {data && (
          <div className="widget-content">
            <div className="weather-current">
              <div className="weather-icon flex items-center justify-center">
                {renderWeatherIcon(data.current.weatherCode, data.current.isDay)}
              </div>
              <div>
                <div className="weather-temp-large">
                  {data.current.temperature}<span className="weather-temp-unit">°</span>
                </div>
              </div>
              <div className="weather-details" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="weather-condition">{getWeatherText(data.current.weatherCode)}</div>
                <div className="weather-detail-row">Feels like {data.current.apparentTemperature}°</div>
                <div className="weather-detail-row">{data.current.humidity}% Humidity</div>
                <div className="weather-detail-row">
                  {data.current.windSpeed} {data.units === 'imperial' ? 'mph' : 'km/h'}
                </div>
              </div>
            </div>

            <div className="weather-hourly">
              {data.hourly.slice(0, 8).map((hour, i) => {
                const date = new Date(hour.time);
                const hours = date.getHours();
                const displayTime =
                  config.hourFormat === '12h'
                    ? `${hours % 12 || 12} ${hours >= 12 ? 'pm' : 'am'}`
                    : `${hours.toString().padStart(2, '0')}:00`;

                return (
                  <div key={i} className="weather-hour">
                    <div>{displayTime}</div>
                    <div className="weather-icon">{renderWeatherIcon(hour.weatherCode, hours >= 6 && hours < 19)}</div>
                    <div className="weather-hour-temp">{hour.temperature}°</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}

