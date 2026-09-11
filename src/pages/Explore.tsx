import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

import { searchDestinations } from "../services/geocodingApi";
import { searchDestinationImage } from "../services/imageApi";

import type { Destination } from "../types/destination";
import type { DestinationImage } from "../types/image";

function Explore() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [destinationImages, setDestinationImages] =
        useState<Record<string, DestinationImage | null>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchedCity, setSearchedCity] = useState("");
    const [suggestions, setSuggestions] = useState<Destination[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSelectingRef = useRef(false);

    const popularDestinations = [
        "Amsterdam",
        "Paris",
        "Barcelona",
        "Rome",
        "Lisbon",
        "Copenhagen",
    ];

    async function loadPopularDestinations() {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.all(
                popularDestinations.map(async (city) => {
                    const [destinationResults, image] =
                        await Promise.all([
                            searchDestinations(city).catch(() => []),
                            searchDestinationImage(city).catch(() => null),
                        ]);

                    return {
                        destination: destinationResults[0] ?? null,
                        image,
                    };
                }),
            );

            const validResults = results.filter(
                (result) => result.destination !== null,
            );

            setDestinations(
                validResults.map(
                    (result) => result.destination!,
                ),
            );

            const images: Record<
                string,
                DestinationImage | null
            > = {};

            validResults.forEach((result) => {
                images[result.destination!.name] =
                    result.image;
            });

            setDestinationImages(images);
        } catch (err) {
            console.error("Explore error:", err);
            setError("Could not load destinations.");
        } finally {
            setLoading(false);
        }
    }

    /*
     * Load popular destinations and their images
     */
    useEffect(() => {
        loadPopularDestinations();
    }, []);

    /*
     * Live search suggestions while typing
     */
    useEffect(() => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }

        if (!query.trim()) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }

        suggestionTimerRef.current = setTimeout(async () => {
            try {
                const results = await searchDestinations(query.trim());
                setSuggestions(results);
                setIsSuggestionsOpen(results.length > 0);
            } catch {
                setSuggestions([]);
                setIsSuggestionsOpen(false);
            }
        }, 250);

        return () => {
            if (suggestionTimerRef.current) {
                clearTimeout(suggestionTimerRef.current);
            }
        };
    }, [query]);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsSuggestionsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleSuggestionSelect(destination: Destination) {
        isSelectingRef.current = true;
        setQuery(destination.name);
        setSuggestions([]);
        setIsSuggestionsOpen(false);

        navigate(`/destination/${encodeURIComponent(destination.name)}`, {
            state: {
                destination,
            },
        });
    }

    /*
     * Search for a destination
     */
    async function handleSearch() {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            return;
        }

        setIsSuggestionsOpen(false);

        try {
            setLoading(true);
            setError("");
            setSearchedCity(trimmedQuery);

            const results = await searchDestinations(
                trimmedQuery,
            );

            if (results.length === 0) {
                setDestinations([]);
                return;
            }

            setDestinations(results);

            /*
             * Load images for search results safely
             */
            const images: Record<
                string,
                DestinationImage | null
            > = {};

            await Promise.allSettled(
                results.map(async (destination) => {
                    try {
                        const image =
                            await searchDestinationImage(
                                destination.name,
                            );
                        images[destination.name] = image;
                    } catch {
                        images[destination.name] = null;
                    }
                }),
            );

            setDestinationImages((current) => ({
                ...current,
                ...images,
            }));
        } catch (err) {
            console.error("Search error:", err);
            setError(
                "Could not search for destinations.",
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * Search when pressing Enter
     */
    function handleKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Enter") {
            setIsSuggestionsOpen(false);
            handleSearch();
        } else if (event.key === "Escape") {
            setIsSuggestionsOpen(false);
        }
    }

    function handleClearSearch() {
        setQuery("");
        setSearchedCity("");
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        loadPopularDestinations();
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

            {/* Hero */}
            <section className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Explore
                </p>

                <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                    Find your next adventure.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
                    Discover destinations, explore interesting
                    places, and find inspiration for your next trip.
                </p>
            </section>

            {/* Search */}
            <section ref={searchContainerRef} className="relative mt-8 max-w-2xl sm:mt-10">
                <div className="flex w-full items-center rounded-full border border-[var(--color-border)] bg-white p-1.5 shadow-sm transition focus-within:border-[var(--color-text)] sm:p-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setIsSuggestionsOpen(true);
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) {
                                setIsSuggestionsOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city..."
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--color-muted)] sm:px-6 sm:py-3.5 sm:text-base"
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setIsSuggestionsOpen(false);
                            handleSearch();
                        }}
                        disabled={!query.trim() || loading}
                        className="shrink-0 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:py-3.5 sm:text-base"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {isSuggestionsOpen && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-xl">
                        {suggestions.map((destination) => (
                            <button
                                key={destination.id}
                                type="button"
                                onClick={() => handleSuggestionSelect(destination)}
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

            {/* Error */}
            {error && (
                <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center">
                    <p className="text-lg font-medium">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Destinations list */}
            {!error && (
                <section className="mt-20">

                    {/* Section heading */}
                    {searchedCity ? (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                    Search results
                                </p>

                                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                                    Destinations for "{searchedCity}"
                                </h2>

                                <p className="mt-2 text-[var(--color-muted)]">
                                    {destinations.length} destination{destinations.length === 1 ? "" : "s"} found.
                                </p>
                            </div>

                            <button
                                onClick={handleClearSearch}
                                className="self-start rounded-full border border-[var(--color-border)] bg-white px-5 py-2 text-xs font-medium transition hover:bg-[var(--color-background)] sm:self-auto sm:text-sm"
                            >
                                ← Back to popular destinations
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                Popular destinations
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                                Start exploring
                            </h2>

                            <p className="mt-2 text-[var(--color-muted)]">
                                Explore some of the most popular
                                destinations.
                            </p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                            {popularDestinations.map((city) => (
                                <div
                                    key={city}
                                    className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white"
                                >
                                    {/* Image skeleton */}
                                    <div className="h-56 animate-pulse bg-[var(--color-border)]" />

                                    <div className="p-6">

                                        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-border)]" />

                                        <div className="mt-4 h-7 w-40 animate-pulse rounded bg-[var(--color-border)]" />

                                        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[var(--color-border)]" />

                                        <div className="mt-6 h-10 w-36 animate-pulse rounded-full bg-[var(--color-border)]" />

                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : destinations.length > 0 ? (

                        /* Destination cards */
                        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                            {destinations.map(
                                (destination, index) => {
                                    const image =
                                        destinationImages[
                                        destination.name
                                        ];

                                    return (
                                        <article
                                            key={destination.id}
                                            className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                        >

                                            {/* Image */}
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/destination/${encodeURIComponent(
                                                            destination.name,
                                                        )}`,
                                                    )
                                                }
                                                className="relative block h-56 w-full overflow-hidden bg-[var(--color-background)] text-left"
                                            >
                                                {image ? (
                                                    <>
                                                        <img
                                                            src={image.url}
                                                            alt={`View of ${destination.name}`}
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                        />

                                                        <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" />
                                                    </>
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-5xl">
                                                        🌍
                                                    </div>
                                                )}

                                                {/* Number */}
                                                <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">
                                                    {String(
                                                        index + 1,
                                                    ).padStart(2, "0")}
                                                </div>
                                            </button>

                                            {/* Card content */}
                                            <div className="p-6">

                                                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
                                                    Destination
                                                </p>

                                                <h3 className="mt-2 text-2xl font-semibold">
                                                    {destination.name}
                                                </h3>

                                                <p className="mt-1 text-sm text-[var(--color-muted)]">
                                                    {destination.country}
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/destination/${encodeURIComponent(
                                                                destination.name,
                                                            )}`,
                                                        )
                                                    }
                                                    className="mt-6 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                                                >
                                                    Explore destination
                                                </button>

                                                {/* Unsplash attribution */}
                                                {image && (
                                                    <p className="mt-4 text-xs text-[var(--color-muted)]">
                                                        Photo by{" "}
                                                        <a
                                                            href={
                                                                image.photographerUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                            className="underline hover:text-[var(--color-text)]"
                                                        >
                                                            {
                                                                image.photographerName
                                                            }
                                                        </a>{" "}
                                                        on Unsplash
                                                    </p>
                                                )}

                                            </div>
                                        </article>
                                    );
                                },
                            )}

                        </div>

                    ) : (

                        /* No results */
                        <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-12 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-background)] text-3xl">
                                🌍
                            </div>

                            <h3 className="mt-5 text-xl font-semibold">
                                No destinations found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
                                {searchedCity
                                    ? `We couldn't find any destination matching "${searchedCity}".`
                                    : "We couldn't find any destinations matching your search."}
                            </p>

                            {searchedCity && (
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-6 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                    View popular destinations
                                </button>
                            )}

                        </div>
                    )}

                </section>
            )}

        </main>
    );
}

export default Explore;