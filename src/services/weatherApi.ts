

import type { Weather } from "../types/weather";

interface WeatherResponse {
    current: {
        temperature_2m: number;
        wind_speed_10m: number;
        weather_code: number;
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
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    const data: WeatherResponse = await response.json();

    return {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
    };
}