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
  if (code >= 51 && code <= 67 || (code >= 80 && code <= 82)) {
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

export default function WeatherWidget({ config }: { config: WeatherWidgetConfig }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      if (!config.latitude || !config.longitude) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/weather?lat=${config.latitude}&lon=${config.longitude}&units=${config.units || 'metric'}`);
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
  }, [config]);

  return (
    <WidgetShell 
      title={config.title || config.location || "Weather"} 
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
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
              <div className="weather-detail-row">{data.current.windSpeed} {data.units === 'imperial' ? 'mph' : 'km/h'}</div>
            </div>
          </div>
          
          <div className="weather-hourly">
            {data.hourly.slice(0, 8).map((hour, i) => {
              const date = new Date(hour.time);
              const hours = date.getHours();
              const displayTime = config.hourFormat === '12h' 
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
    </WidgetShell>
  );
}
