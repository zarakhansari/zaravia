import { useState } from "react";
import { searchDestinations } from "../services/geocodingApi";
import { getWeather } from "../services/weatherApi";
import type { Destination } from "../types/destination";
import type { Weather } from "../types/weather";

function DestinationSearch() {
    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [weather, setWeather] = useState<Weather | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSearch() {
        if (!query.trim()) {
            setError("Please enter a destination.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setWeather(null);

            const results = await searchDestinations(query);

            if (results.length === 0) {
                setError("No destinations found.");
            }

            setDestinations(results);
        } catch {
            setError("Something went wrong. Please try again.");
            setDestinations([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleDestinationSelect(destination: Destination) {
        try {
            setLoading(true);
            setError("");

            const result = await getWeather(
                destination.latitude,
                destination.longitude,
            );

            setWeather(result);
        } catch {
            setError("Could not load weather.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl">
            {/* Search */}
            <div className="flex items-center rounded-full border border-[var(--color-border)] bg-white p-2 shadow-sm">
                <div className="flex flex-1 items-center">
                    <span className="ml-3 mr-2 text-xl">⌕</span>

                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        placeholder="Where do you want to go?"
                        className="w-full bg-transparent px-2 py-3 text-sm outline-none"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            {/* Destination results */}
            {destinations.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-sm">
                    {destinations.map((destination) => (
                        <button
                            key={destination.id}
                            onClick={() => handleDestinationSelect(destination)}
                            className="flex w-full items-center justify-between border-b border-[var(--color-border)] p-4 transition last:border-b-0 hover:bg-[var(--color-background)]"
                        >
                            <div>
                                <p className="font-medium">
                                    {destination.name}
                                </p>

                                <p className="text-sm text-[var(--color-muted)]">
                                    {destination.country}
                                </p>
                            </div>

                            <span className="text-xs text-[var(--color-muted)]">
                                {destination.latitude.toFixed(2)},{" "}
                                {destination.longitude.toFixed(2)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Weather */}
            {weather && (
                <div className="mt-6 rounded-2xl bg-[var(--color-text)] p-6 text-left text-white">
                    <p className="text-sm opacity-70">
                        Current weather
                    </p>

                    <p className="mt-2 text-4xl font-semibold">
                        {weather.temperature}°C
                    </p>

                    <p className="mt-2 text-sm opacity-70">
                        Wind {weather.windSpeed} km/h
                    </p>

                    <p className="mt-1 text-sm opacity-70">
                        Weather code: {weather.weatherCode}
                    </p>
                </div>
            )}
        </div>
    );
}

export default DestinationSearch;