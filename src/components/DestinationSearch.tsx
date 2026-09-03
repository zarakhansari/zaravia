import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { searchDestinations } from "../services/geocodingApi";
import { getWeather } from "../services/weatherApi";
import type { Destination } from "../types/destination";
import type { Weather } from "../types/weather";
import { getWeatherDescription } from "../utils/formatWeather";

function DestinationSearch() {

    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [weather, setWeather] = useState<Weather | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSearch(searchQuery: string) {
        if (!searchQuery.trim()) {
            setDestinations([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const results = await searchDestinations(searchQuery);

            setDestinations(results);
        } catch {
            setError("Something went wrong. Please try again.");
            setDestinations([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!query.trim()) { setDestinations([]); return; }
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 400);
        return () => clearTimeout(timer)
    }, [query]);



    function handleDestinationSelect(destination: Destination) {
        setQuery(destination.name);
        setDestinations([]);

        navigate(`/destination/${encodeURIComponent(destination.name)}`, {
            state: {
                destination,
            },
        });
    }

    return (
        <div className="w-full max-w-2xl">
            {/* Search */}
            <div className="relative">
                <div className="flex items-center rounded-full border border-[var(--color-border)] bg-white p-2 shadow-sm">
                    <div className="flex flex-1 items-center">
                        <span className="ml-3 mr-2 text-xl">⌕</span>

                        <input
                            type="text"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setWeather(null);
                                setError("");
                            }}
                            placeholder="Where do you want to go?"
                            className="w-full bg-transparent px-2 py-3 text-sm outline-none"
                        />

                        {loading && (
                            <span className="mr-3 text-xs text-[var(--color-muted)]">
                                Searching...
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => handleSearch(query)}
                        disabled={loading || !query.trim()}
                        className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Search
                    </button>
                </div>

                {/* Suggestions */}
                {destinations.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-lg">
                        {destinations.map((destination) => (
                            <button
                                key={destination.id}
                                onClick={() => handleDestinationSelect(destination)}
                                className="flex w-full items-center gap-4 border-b border-[var(--color-border)] p-4 transition last:border-b-0 hover:bg-[var(--color-background)]"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-background)]">
                                    📍
                                </div>

                                <div>
                                    <p className="font-medium">
                                        {destination.name}
                                    </p>

                                    <p className="text-sm text-[var(--color-muted)]">
                                        {destination.country}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            {/* Weather */}
            {weather && (
                <div className="mt-6 rounded-2xl bg-[var(--color-text)] p-6 text-left text-white">
                    <p className="text-sm opacity-70">
                        Current weather
                    </p>

                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-5xl">
                            {getWeatherDescription(weather.weatherCode).icon}
                        </span>

                        <div>
                            <p className="text-4xl font-semibold">
                                {Math.round(weather.temperature)}°C
                            </p>

                            <p className="mt-1 text-sm opacity-70">
                                {getWeatherDescription(weather.weatherCode).label}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm opacity-70">
                        Wind {Math.round(weather.windSpeed)} km/h
                    </p>
                </div>
            )}
        </div>
    );
}

export default DestinationSearch;