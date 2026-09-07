import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import type { Place } from "../types/place";

import {
    getTripCities,
    getTripPlaces,
    removeTripCity,
    removeTripPlace,
    type TripCity,
} from "../utils/tripStorage";

function YourTrip() {
    const navigate = useNavigate();

    const [cities, setCities] =
        useState<TripCity[]>([]);

    const [places, setPlaces] =
        useState<Place[]>([]);

    /*
     * Load saved trip
     */
    useEffect(() => {
        setCities(getTripCities());
        setPlaces(getTripPlaces());
    }, []);

    /*
     * Remove city
     */
    function handleRemoveCity(id: number) {
        const updatedCities = removeTripCity(id);

        setCities(updatedCities);
    }

    /*
     * Remove attraction
     */
    function handleRemovePlace(id: string) {
        const updatedPlaces = removeTripPlace(id);

        setPlaces(updatedPlaces);
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            {/* =========================
          HEADER
      ========================== */}
            <section>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Your journey
                </p>

                <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                    Your trip
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
                    Everything you've saved for your journey, all in
                    one place.
                </p>
            </section>

            {/* =========================
          CITIES
      ========================== */}
            <section className="mt-16">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Destinations
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                            Cities
                        </h2>
                    </div>

                    {cities.length > 0 && (
                        <p className="text-sm text-[var(--color-muted)]">
                            {cities.length}{" "}
                            {cities.length === 1
                                ? "city"
                                : "cities"}
                        </p>
                    )}
                </div>

                {cities.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-background)] text-3xl">
                            🌍
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            No cities yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                            Explore destinations and start building your
                            journey.
                        </p>

                        <button
                            onClick={() => navigate("/explore")}
                            className="mt-6 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Explore destinations
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {cities.map((city) => (
                            <article
                                key={city.id}
                                className="rounded-3xl border border-[var(--color-border)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-background)] text-2xl">
                                        🌍
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleRemoveCity(city.id)
                                        }
                                        className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <h3 className="mt-6 text-2xl font-semibold">
                                    {city.name}
                                </h3>

                                <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    {city.country}
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/destination/${encodeURIComponent(
                                                city.name,
                                            )}`,
                                        )
                                    }
                                    className="mt-6 rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--color-background)]"
                                >
                                    View destination
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* =========================
          ATTRACTIONS
      ========================== */}
            <section className="mt-20">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Places to visit
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                            Attractions
                        </h2>
                    </div>

                    {places.length > 0 && (
                        <p className="text-sm text-[var(--color-muted)]">
                            {places.length}{" "}
                            {places.length === 1
                                ? "place"
                                : "places"}
                        </p>
                    )}
                </div>

                {places.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-background)] text-3xl">
                            📍
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            No attractions yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                            Find interesting places and add them to your
                            trip.
                        </p>

                        <button
                            onClick={() => navigate("/explore")}
                            className="mt-6 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Find places
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white">
                        {places.map((place, index) => (
                            <div
                                key={place.id}
                                className="flex items-center gap-5 border-b border-[var(--color-border)] p-5 last:border-b-0 sm:p-6"
                            >
                                {/* Number */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-background)] text-sm font-semibold">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                {/* Information */}
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold">
                                        {place.name}
                                    </h3>

                                    <p className="mt-1 text-sm capitalize text-[var(--color-muted)]">
                                        {place.type.replaceAll(
                                            "_",
                                            " ",
                                        )}
                                    </p>
                                </div>

                                {/* View */}
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/destination/${encodeURIComponent(
                                                place.name,
                                            )}`,
                                        )
                                    }
                                    className="hidden rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-background)] sm:block"
                                >
                                    View
                                </button>

                                {/* Remove */}
                                <button
                                    onClick={() =>
                                        handleRemovePlace(place.id)
                                    }
                                    className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default YourTrip;