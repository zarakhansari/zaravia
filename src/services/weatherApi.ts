import type { Weather } from "../types/weather";

interface WeatherResponse {
    current: {
        temperature_2m: number;
        wind_speed_10m: number;
        weather_code: number;
    };

    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
    };
}

export async function getWeather(
    latitude: number,
    longitude: number,
): Promise<Weather> {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,wind_speed_10m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto` +
        `&forecast_days=5`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    const data: WeatherResponse = await response.json();

    const forecast = data.daily.time.map((date, index) => ({
        date,
        temperatureMax: data.daily.temperature_2m_max[index],
        temperatureMin: data.daily.temperature_2m_min[index],
        weatherCode: data.daily.weather_code[index],
    }));

    return {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        forecast,
    };
}