import { NextResponse } from 'next/server';
import type { WeatherData } from '@/app/types/dashboard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('units') === 'imperial' ? 'imperial' : 'metric';
  
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;
  
  if (units === 'imperial') {
    url += '&temperature_unit=fahrenheit&wind_speed_unit=mph';
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const data = await res.json();
    
    // next 12 hours from current time
    const nowIndex = data.hourly.time.findIndex((t: string) => new Date(t).getTime() > Date.now()) || 0;
    const hourlyStart = Math.max(0, nowIndex - 1);
    
    const hourly = [];
    for (let i = hourlyStart; i < hourlyStart + 12 && i < data.hourly.time.length; i++) {
      hourly.push({
        time: data.hourly.time[i],
        temperature: Math.round(data.hourly.temperature_2m[i]),
        weatherCode: data.hourly.weather_code[i]
      });
    }

    const daily = data.daily.time.slice(0, 3).map((time: string, i: number) => ({
      date: time,
      maxTemp: Math.round(data.daily.temperature_2m_max[i]),
      minTemp: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weather_code[i]
    }));

    const weatherData: WeatherData = {
      location: 'Local',
      current: {
        temperature: Math.round(data.current.temperature_2m),
        apparentTemperature: Math.round(data.current.apparent_temperature),
        weatherCode: data.current.weather_code,
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        isDay: data.current.is_day === 1
      },
      hourly,
      daily,
      units
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
