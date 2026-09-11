import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { searchDestinations } from "../services/geocodingApi";
import type { Destination } from "../types/destination";

function DestinationSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSelectingRef = useRef(false);

    async function handleSearch(searchQuery: string): Promise<Destination[]> {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setDestinations([]);
            setIsOpen(false);
            return [];
        }

        try {
            setLoading(true);
            setError("");

            const results = await searchDestinations(trimmed);
            setDestinations(results);
            setIsOpen(results.length > 0);
            return results;
        } catch {
            setError("Something went wrong. Please try again.");
            setDestinations([]);
            setIsOpen(false);
            return [];
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }

        if (!query.trim()) {
            setDestinations([]);
            setIsOpen(false);
            setError("");
            return;
        }

        debounceTimerRef.current = setTimeout(() => {
            handleSearch(query);
        }, 250);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query]);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleDestinationSelect(destination: Destination) {
        isSelectingRef.current = true;
        setQuery(destination.name);
        setDestinations([]);
        setIsOpen(false);

        navigate(`/destination/${encodeURIComponent(destination.name)}`, {
            state: {
                destination,
            },
        });
    }

    async function handleSearchClick() {
        const trimmed = query.trim();
        if (!trimmed) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (destinations.length > 0) {
            handleDestinationSelect(destinations[0]);
            return;
        }

        const results = await handleSearch(trimmed);
        if (results && results.length > 0) {
            handleDestinationSelect(results[0]);
        } else {
            setError(`No destination found for "${trimmed}".`);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearchClick();
        } else if (event.key === "Escape") {
            setIsOpen(false);
        }
    }

    return (
        <div ref={containerRef} className="w-full max-w-2xl">
            {/* Search */}
            <section className="relative mt-6 sm:mt-10 w-full">
                <div className="flex w-full items-center rounded-full border border-[var(--color-border)] bg-white p-1.5 sm:p-2 shadow-sm transition focus-within:border-[var(--color-text)]">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (destinations.length > 0) {
                                setIsOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city..."
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base outline-none placeholder:text-[var(--color-muted)]"
                    />

                    <button
                        type="button"
                        onClick={handleSearchClick}
                        disabled={!query.trim()}
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
                {isOpen && destinations.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-xl">
                        {destinations.map((destination) => (
                            <button
                                key={destination.id}
                                type="button"
                                onClick={() => handleDestinationSelect(destination)}
                                className="flex w-full items-center justify-between border-b border-[var(--color-border)] p-3.5 text-left transition last:border-b-0 hover:bg-[var(--color-background)] sm:p-4"
                            >
                                <div>
                                    <p className="text-xs font-medium text-[var(--color-text)] sm:text-sm md:text-base">
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