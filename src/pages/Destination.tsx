import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { searchDestinations } from "../services/geocodingApi";
import { getWeather } from "../services/weatherApi";
import type { Destination as DestinationType } from "../types/destination";
import type { Weather } from "../types/weather";
import { getWeatherDescription } from "../utils/formatWeather";

function Destination() {
    const { name } = useParams();

    const [destination, setDestination] =
        useState<DestinationType | null>(null);

    const [weather, setWeather] = useState<Weather | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDestination() {
            if (!name) return;

            try {
                setLoading(true);
                setError("");

                // Get destination coordinates
                const results = await searchDestinations(name);

                if (results.length === 0) {
                    setError("Destination not found.");
                    return;
                }

                const selectedDestination = results[0];

                setDestination(selectedDestination);

                // Get weather using coordinates
                const weatherData = await getWeather(
                    selectedDestination.latitude,
                    selectedDestination.longitude,
                );

                setWeather(weatherData);
            } catch {
                setError("Could not load destination information.");
            } finally {
                setLoading(false);
            }
        }

        loadDestination();
    }, [name]);

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <p className="text-[var(--color-muted)]">
                    Loading destination...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <h1 className="text-4xl font-semibold">
                    {error}
                </h1>
            </main>
        );
    }

    if (!destination) {
        return null;
    }

    const weatherDescription = weather
        ? getWeatherDescription(weather.weatherCode)
        : null;

    return (
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            {/* Destination header */}
            <section>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Your destination
                </p>

                <h1 className="mt-3 text-5xl font-semibold">
                    {destination.name}
                </h1>

                <p className="mt-3 text-lg text-[var(--color-muted)]">
                    {destination.country}
                </p>
            </section>

            {/* Weather */}
            {weather && weatherDescription && (
                <section className="mt-10 max-w-md rounded-3xl bg-[var(--color-text)] p-8 text-white">
                    <p className="text-sm opacity-70">
                        Current weather
                    </p>

                    <div className="mt-5 flex items-center gap-5">
                        <span className="text-6xl">
                            {weatherDescription.icon}
                        </span>

                        <div>
                            <p className="text-5xl font-semibold">
                                {Math.round(weather.temperature)}°C
                            </p>

                            <p className="mt-1 opacity-70">
                                {weatherDescription.label}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-white/20 pt-4">
                        <p className="text-sm opacity-70">
                            Wind
                        </p>

                        <p className="mt-1 text-lg">
                            {Math.round(weather.windSpeed)} km/h
                        </p>
                    </div>
                </section>
            )}

            {/*5day forecast*/}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold">
                    5-day forecast
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {weather?.forecast.map((day) => {
                        const description = getWeatherDescription(
                            day.weatherCode,
                        );

                        const date = new Date(day.date);

                        return (
                            <div
                                key={day.date}
                                className="rounded-2xl border border-[var(--color-border)] p-4"
                            >
                                <p className="text-sm text-[var(--color-muted)]">
                                    {date.toLocaleDateString("en-US", {
                                        weekday: "short",
                                    })}
                                </p>

                                <div className="mt-4 text-3xl">
                                    {description.icon}
                                </div>

                                <p className="mt-3 text-sm">
                                    {description.label}
                                </p>

                                <div className="mt-4 flex gap-2">
                                    <span className="font-medium">
                                        {Math.round(day.temperatureMax)}°
                                    </span>

                                    <span className="text-[var(--color-muted)]">
                                        {Math.round(day.temperatureMin)}°
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Coordinates */}
            <section className="mt-8 rounded-3xl border border-[var(--color-border)] p-6">
                <p className="text-sm text-[var(--color-muted)]">
                    Location
                </p>

                <p className="mt-2">
                    {destination.latitude.toFixed(4)},{" "}
                    {destination.longitude.toFixed(4)}
                </p>
            </section>
        </main>
    );
}

export default Destination;