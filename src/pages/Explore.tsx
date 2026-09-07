import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { searchDestinations } from "../services/geocodingApi";
import type { Destination } from "../types/destination";

function Explore() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [destinations, setDestinations] =
        useState<Destination[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
     * Destinations to show when the page first opens.
     *
     * The names are only search queries.
     * The actual destination data comes from the API.
     */
    const popularDestinations = [
        "Amsterdam",
        "Paris",
        "Barcelona",
        "Rome",
        "Lisbon",
        "Copenhagen",
    ];

    /*
     * Load popular destinations
     */
    useEffect(() => {
        async function loadPopularDestinations() {
            try {
                setLoading(true);
                setError("");

                const results = await Promise.all(
                    popularDestinations.map((city) =>
                        searchDestinations(city),
                    ),
                );

                const firstResults = results
                    .map((result) => result[0])
                    .filter(
                        (destination): destination is Destination =>
                            destination !== undefined,
                    );

                setDestinations(firstResults);
            } catch {
                setError(
                    "Could not load destinations. Please try again.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadPopularDestinations();
    }, []);

    /*
     * Search destinations
     */
    async function handleSearch() {
        if (!query.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const results = await searchDestinations(query);

            setDestinations(results);
        } catch {
            setError(
                "Could not search destinations. Please try again.",
            );
            setDestinations([]);
        } finally {
            setLoading(false);
        }
    }

    /*
     * Open destination page
     */
    function handleDestinationClick(
        destination: Destination,
    ) {
        navigate(
            `/destination/${encodeURIComponent(
                destination.name,
            )}`,
            {
                state: {
                    destination,
                },
            },
        );
    }

    return (
        <main className="min-h-screen">

            {/* Hero */}
            <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-8 lg:pt-24">

                <div className="max-w-3xl">

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                        Explore the world
                    </p>

                    <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                        Find your next
                        <br />
                        adventure.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
                        Discover destinations, check the weather,
                        find places to visit, and start planning your
                        next trip.
                    </p>

                </div>

                {/* Search */}
                <div className="mt-10 max-w-2xl">

                    <div className="flex items-center rounded-full border border-[var(--color-border)] bg-white p-2 shadow-sm">

                        <div className="flex flex-1 items-center">

                            <span className="ml-4 mr-3 text-xl">
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search for a city..."
                                className="w-full bg-transparent px-2 py-3 text-sm outline-none"
                            />

                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={loading || !query.trim()}
                            className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Search
                        </button>

                    </div>

                </div>

            </section>

            {/* Destinations */}
            <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">

                <div className="flex items-end justify-between">

                    <div>

                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            {query
                                ? "Search results"
                                : "Popular destinations"}
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold">
                            {query
                                ? `Results for "${query}"`
                                : "Where will you go?"}
                        </h2>

                    </div>

                    {!query && (
                        <span className="hidden text-sm text-[var(--color-muted)] sm:block">
                            Explore 6 destinations
                        </span>
                    )}

                </div>

                {/* Error */}
                {error && (
                    <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6">
                        <p className="text-[var(--color-muted)]">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && !error && (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-64 animate-pulse rounded-3xl border border-[var(--color-border)] bg-white"
                                />
                            ),
                        )}

                    </div>
                )}

                {/* Cards */}
                {!loading &&
                    !error &&
                    destinations.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {destinations.map(
                                (destination, index) => (
                                    <button
                                        key={destination.id}
                                        onClick={() =>
                                            handleDestinationClick(
                                                destination,
                                            )
                                        }
                                        className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                    >

                                        {/* Card visual */}
                                        <div className="relative flex h-44 items-end overflow-hidden bg-[var(--color-background)] p-6">

                                            <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[var(--color-accent)]/10 transition duration-500 group-hover:scale-125" />

                                            <div className="absolute right-8 top-8 text-6xl opacity-70">
                                                {["🌍", "✈️", "☀️", "🏛️", "🌊", "🗺️"][
                                                    index % 6
                                                ]}
                                            </div>

                                            <div className="relative">

                                                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
                                                    Destination
                                                </p>

                                                <h3 className="mt-1 text-2xl font-semibold">
                                                    {destination.name}
                                                </h3>

                                            </div>

                                        </div>

                                        {/* Card information */}
                                        <div className="p-6">

                                            <p className="text-sm text-[var(--color-muted)]">
                                                {destination.country}
                                            </p>

                                            <div className="mt-6 flex items-center justify-between">

                                                <span className="text-sm font-medium">
                                                    Explore destination
                                                </span>

                                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] transition group-hover:bg-[var(--color-text)] group-hover:text-white">
                                                    →
                                                </span>

                                            </div>

                                        </div>

                                    </button>
                                ),
                            )}

                        </div>
                    )}

                {/* No results */}
                {!loading &&
                    !error &&
                    destinations.length === 0 && (
                        <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-12 text-center">

                            <div className="text-5xl">
                                🌍
                            </div>

                            <h3 className="mt-5 text-2xl font-semibold">
                                No destinations found
                            </h3>

                            <p className="mt-2 text-[var(--color-muted)]">
                                Try searching for another city.
                            </p>

                        </div>
                    )}

            </section>

        </main>
    );
}

export default Explore;