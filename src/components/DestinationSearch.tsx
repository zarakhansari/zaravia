import { useState } from "react";
import { searchDestinations } from "../services/geocoding";
import type { Destination } from "../types/destination";

function DestinationSearch() {
    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSearch() {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError("");

            const results = await searchDestinations(query);

            setDestinations(results);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl">
            <div className="flex items-center rounded-full border border-[var(--color-border)] bg-white p-2 shadow-sm">
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
                    className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                />

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            {destinations.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
                    {destinations.map((destination) => (
                        <button
                            key={destination.id}
                            className="flex w-full items-center justify-between border-b border-[var(--color-border)] p-4 text-left last:border-b-0 hover:bg-[var(--color-background)]"
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
        </div>
    );
}

export default DestinationSearch;