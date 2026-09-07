import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { searchDestinations } from "../services/geocodingApi";
import type { Destination } from "../types/destination";

function DestinationSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
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
        if (!query.trim()) {
            setDestinations([]);
            return;
        }
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 400);
        return () => clearTimeout(timer);
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

    function handleSearchClick() {
        if (destinations.length > 0) {
            handleDestinationSelect(destinations[0]);
        } else if (query.trim()) {
            navigate(`/destination/${encodeURIComponent(query.trim())}`);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            handleSearchClick();
        }
    }

    return (
        <div className="w-full max-w-2xl">
            {/* Search */}
            <section className="mt-6 sm:mt-10 w-full">
                <div className="flex w-full items-center rounded-full border border-[var(--color-border)] bg-white p-1.5 sm:p-2 shadow-sm transition focus-within:border-[var(--color-text)]">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city..."
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base outline-none placeholder:text-[var(--color-muted)]"
                    />

                    <button
                        onClick={handleSearchClick}
                        disabled={!query.trim() || loading}
                        className="shrink-0 rounded-full bg-[var(--color-accent)] px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {error && (
                    <p className="mt-2 text-xs text-red-600 sm:text-sm">
                        {error}
                    </p>
                )}

                {/* Destination results dropdown */}
                {destinations.length > 0 && (
                    <div className="mt-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-lg">
                        {destinations.map((destination) => (
                            <button
                                key={destination.id}
                                onClick={() => handleDestinationSelect(destination)}
                                className="flex w-full items-center justify-between border-b border-[var(--color-border)] p-3 text-left transition last:border-b-0 hover:bg-[var(--color-background)] sm:p-4"
                            >
                                <div>
                                    <p className="text-xs font-medium sm:text-sm md:text-base">
                                        {destination.name}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-muted)] sm:text-xs md:text-sm">
                                        {destination.country}
                                    </p>
                                </div>
                                <span className="text-[10px] text-[var(--color-muted)] sm:text-xs">
                                    {destination.latitude.toFixed(2)}, {destination.longitude.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default DestinationSearch;