import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { searchDestinations } from "../services/geocodingApi";
import { getWeather } from "../services/weatherApi";
import { getPlaces } from "../services/placesApi";
import { searchDestinationImage } from "../services/imageApi";

import type { Destination as DestinationType } from "../types/destination";
import type { Weather } from "../types/weather";
import type { Place } from "../types/place";
import type { DestinationImage } from "../types/image";

import {
    addTripCity,
    addTripPlace,
    getTripCities,
    getTripPlaces,
    removeTripCity,
    removeTripPlace,
} from "../utils/tripStorage";

import { getWeatherDescription } from "../utils/formatWeather";

import Map from "../components/Map";

function Destination() {
    const { name } = useParams();

    /* =========================
       STATE
    ========================== */

    const [destination, setDestination] =
        useState<DestinationType | null>(null);

    const [weather, setWeather] =
        useState<Weather | null>(null);

    const [places, setPlaces] =
        useState<Place[]>([]);

    const [selectedPlace, setSelectedPlace] =
        useState<Place | null>(null);

    const [destinationImage, setDestinationImage] =
        useState<DestinationImage | null>(null);

    const [tripPlaces, setTripPlaces] =
        useState<Place[]>(() => getTripPlaces());

    const [tripCities, setTripCities] =
        useState(() => getTripCities());

    const [loading, setLoading] =
        useState(true);

    const [retrying, setRetrying] =
        useState(false);

    const [error, setError] =
        useState("");

    /* =========================
       LOAD DESTINATION
    ========================== */

    useEffect(() => {
        let retryTimer: ReturnType<
            typeof setTimeout
        >;

        async function loadDestination() {
            if (!name) {
                setError("Destination not found.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setRetrying(false);
                setError("");

                /*
                 * Get destination
                 */
                const results =
                    await searchDestinations(name);

                if (results.length === 0) {
                    setError("Destination not found.");
                    return;
                }

                const selectedDestination =
                    results[0];

                setDestination(
                    selectedDestination,
                );

                /*
                 * Get places
                 */
                const placesData =
                    await getPlaces(
                        selectedDestination.latitude,
                        selectedDestination.longitude,
                    );

                setPlaces(placesData);

                /*
                 * Get weather
                 */
                const weatherData =
                    await getWeather(
                        selectedDestination.latitude,
                        selectedDestination.longitude,
                    );

                setWeather(weatherData);

                /*
                 * Get destination image
                 */
                const image =
                    await searchDestinationImage(
                        selectedDestination.name,
                    );

                setDestinationImage(image);
            } catch (err) {
                console.error(
                    "Destination error:",
                    err,
                );

                /*
                 * Handle API rate limit
                 * and gateway timeout
                 */
                if (
                    err instanceof Response &&
                    (err.status === 429 ||
                        err.status === 504)
                ) {
                    setRetrying(true);

                    retryTimer = setTimeout(() => {
                        window.location.reload();
                    }, 5000);

                    return;
                }

                setError(
                    "Could not load destination information.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadDestination();

        return () => {
            clearTimeout(retryTimer);
        };
    }, [name]);

    /* =========================
       ADD CITY
    ========================== */

    function handleAddCity() {
        if (!destination) {
            return;
        }

        const updatedCities = addTripCity({
            id: destination.id,
            name: destination.name,
            country: destination.country,
            latitude: destination.latitude,
            longitude: destination.longitude,
        });

        setTripCities(updatedCities);
    }

    /* =========================
       REMOVE CITY
    ========================== */

    function handleRemoveCity() {
        if (!destination) {
            return;
        }

        const updatedCities =
            removeTripCity(destination.id);

        setTripCities(updatedCities);
    }
    /* =========================
       ADD PLACE
    ========================== */

    function handleAddPlace(place: Place) {
        if (!destination) {
            return;
        }

        // Save the attraction
        const updatedPlaces = addTripPlace(place);
        setTripPlaces(updatedPlaces);

        // Automatically save the city
        const updatedCities = addTripCity({
            id: destination.id,
            name: destination.name,
            country: destination.country,
            latitude: destination.latitude,
            longitude: destination.longitude,
        });

        setTripCities(updatedCities);
    }

    /* =========================
       REMOVE PLACE
    ========================== */

    function handleRemovePlace(
        placeId: string,
    ) {
        const updatedPlaces =
            removeTripPlace(placeId);

        setTripPlaces(updatedPlaces);
    }

    /* =========================
       LOADING / RETRY
    ========================== */

    if (loading || retrying) {
        return (
            <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
                <div className="flex max-w-md flex-col items-center text-center">

                    <div className="mb-6 h-72 w-72">
                        <DotLottieReact
                            src="/animation/relax-loader.lottie"
                            loop
                            autoplay
                        />
                    </div>

                    {retrying ? (
                        <>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                Just a moment
                            </p>

                            <h1 className="mt-3 text-3xl font-semibold">
                                We're having a little trouble
                            </h1>

                            <p className="mt-4 text-[var(--color-muted)]">
                                Don't worry, we're trying
                                to load your destination again.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                Exploring
                            </p>

                            <h1 className="mt-3 text-3xl font-semibold">
                                Finding your destination
                            </h1>

                            <p className="mt-4 text-[var(--color-muted)]">
                                We're gathering everything
                                you need for your trip.
                            </p>
                        </>
                    )}
                </div>
            </main>
        );
    }

    /* =========================
       ERROR
    ========================== */

    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center">

                    <h1 className="text-4xl font-semibold">
                        {error}
                    </h1>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-6 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Try again
                    </button>

                </div>
            </main>
        );
    }

    if (!destination) {
        return null;
    }

    /* =========================
       WEATHER DESCRIPTION
    ========================== */

    const weatherDescription =
        weather
            ? getWeatherDescription(
                weather.weatherCode,
            )
            : null;

    /* =========================
       CITY STATUS
    ========================== */

    const cityIsAdded =
        tripCities.some(
            (city) =>
                city.id === destination.id,
        );

    /* =========================
       RENDER
    ========================== */

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

            {/* =========================
                DESTINATION HERO
            ========================== */}

            <section>
                <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">

                    {/* Destination information */}
                    <div>

                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Your destination
                        </p>

                        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                            {destination.name}
                        </h1>

                        <p className="mt-3 text-xl text-[var(--color-muted)]">
                            {destination.country}
                        </p>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
                            Discover places worth visiting,
                            check the local weather, and start
                            building your trip to{" "}
                            {destination.name}.
                        </p>

                        {/* Add city */}
                        <div className="mt-8 flex flex-wrap gap-3">

                            {cityIsAdded ? (
                                <button
                                    onClick={
                                        handleRemoveCity
                                    }
                                    className="rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-medium transition hover:bg-[var(--color-background)]"
                                >
                                    ✓ Added to your trip
                                </button>
                            ) : (
                                <button
                                    onClick={
                                        handleAddCity
                                    }
                                    className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                    + Add city to your trip
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Weather card */}
                    {weather &&
                        weatherDescription && (
                            <div className="rounded-3xl bg-[var(--color-text)] p-8 text-white shadow-sm">

                                <p className="text-sm font-medium uppercase tracking-[0.15em] opacity-60">
                                    Current weather
                                </p>

                                <div className="mt-6 flex items-center gap-5">

                                    <div className="text-5xl">
                                        {
                                            weatherDescription.icon
                                        }
                                    </div>

                                    <div>
                                        <p className="text-4xl font-semibold">
                                            {Math.round(
                                                weather.temperature,
                                            )}
                                            °
                                        </p>

                                        <p className="mt-1 text-sm opacity-60">
                                            {
                                                weatherDescription.label
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-white/10 pt-5">

                                    <p className="text-sm opacity-60">
                                        Wind
                                    </p>

                                    <p className="mt-1 text-lg">
                                        {Math.round(
                                            weather.windSpeed,
                                        )}{" "}
                                        km/h
                                    </p>

                                </div>
                            </div>
                        )}
                </div>
            </section>

            {/* =========================
                DESTINATION IMAGE
            ========================== */}

            {destinationImage && (
                <section className="mt-12">

                    <div className="relative overflow-hidden rounded-[2rem]">

                        <img
                            src={
                                destinationImage.url
                            }
                            alt={`${destination.name}, ${destination.country}`}
                            className="h-[420px] w-full object-cover"
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-24">

                            <p className="text-sm text-white/70">
                                Photo by{" "}
                                <a
                                    href={
                                        destinationImage.photographerUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    {
                                        destinationImage.photographerName
                                    }
                                </a>{" "}
                                on Unsplash
                            </p>

                        </div>
                    </div>
                </section>
            )}

            {/* =========================
                WEATHER FORECAST
            ========================== */}

            {weather && (
                <section className="mt-16">

                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Forecast
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                            Next 5 days
                        </h2>

                        <p className="mt-2 text-[var(--color-muted)]">
                            A quick look at the weather
                            during your stay.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

                        {weather.forecast.map(
                            (day) => {
                                const description =
                                    getWeatherDescription(
                                        day.weatherCode,
                                    );

                                const date =
                                    new Date(
                                        day.date,
                                    );

                                return (
                                    <div
                                        key={
                                            day.date
                                        }
                                        className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                                    >

                                        <p className="text-sm text-[var(--color-muted)]">
                                            {date.toLocaleDateString(
                                                "en-US",
                                                {
                                                    weekday:
                                                        "short",
                                                },
                                            )}
                                        </p>

                                        <div className="mt-5 text-3xl">
                                            {
                                                description.icon
                                            }
                                        </div>

                                        <p className="mt-3 text-sm">
                                            {
                                                description.label
                                            }
                                        </p>

                                        <div className="mt-4 flex gap-2">
                                            <span className="font-medium">
                                                {Math.round(
                                                    day.temperatureMax,
                                                )}
                                                °
                                            </span>

                                            <span className="text-[var(--color-muted)]">
                                                {Math.round(
                                                    day.temperatureMin,
                                                )}
                                                °
                                            </span>
                                        </div>

                                    </div>
                                );
                            },
                        )}

                    </div>
                </section>
            )}

            {/* =========================
                THINGS TO DO
            ========================== */}

            <section className="mt-20">

                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                        Explore
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                        Things to do
                    </h2>

                    <p className="mt-2 text-[var(--color-muted)]">
                        Discover places worth visiting
                        in {destination.name}.
                    </p>
                </div>

                {places.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        {places.map(
                            (place, index) => {

                                const isAdded =
                                    tripPlaces.some(
                                        (item) =>
                                            item.id ===
                                            place.id,
                                    );

                                return (
                                    <article
                                        key={
                                            place.id
                                        }
                                        className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-md"
                                    >

                                        {/* Visual area */}
                                        <button
                                            onClick={() =>
                                                setSelectedPlace(
                                                    place,
                                                )
                                            }
                                            className="relative flex h-44 w-full items-end overflow-hidden bg-[var(--color-background)] p-6 text-left"
                                        >

                                            {/* Decorative circle */}
                                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-accent)]/10 transition duration-500 group-hover:scale-125" />

                                            {/* Icon */}
                                            <div className="absolute right-7 top-7 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                                                {
                                                    [
                                                        "🏛️",
                                                        "🌳",
                                                        "🎨",
                                                        "⛪",
                                                        "🏰",
                                                        "🌊",
                                                    ][
                                                    index %
                                                    6
                                                    ]
                                                }
                                            </div>

                                            {/* Number */}
                                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">
                                                {String(
                                                    index +
                                                    1,
                                                ).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </div>

                                        </button>

                                        {/* Content */}
                                        <div className="p-6">

                                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
                                                {place.type.replaceAll(
                                                    "_",
                                                    " ",
                                                )}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setSelectedPlace(
                                                        place,
                                                    )
                                                }
                                                className="mt-2 text-left"
                                            >
                                                <h3 className="text-xl font-semibold transition group-hover:text-[var(--color-accent)]">
                                                    {
                                                        place.name
                                                    }
                                                </h3>
                                            </button>

                                            {/* Actions */}
                                            <div className="mt-6 flex items-center gap-3">

                                                <button
                                                    onClick={() =>
                                                        setSelectedPlace(
                                                            place,
                                                        )
                                                    }
                                                    className="flex-1 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--color-background)]"
                                                >
                                                    View map
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        isAdded
                                                            ? handleRemovePlace(
                                                                place.id,
                                                            )
                                                            : handleAddPlace(
                                                                place,
                                                            )
                                                    }
                                                    className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${isAdded
                                                        ? "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-background)]"
                                                        : "bg-[var(--color-accent)] text-white hover:opacity-90"
                                                        }`}
                                                >
                                                    {isAdded
                                                        ? "✓ Added"
                                                        : "+ Add"}
                                                </button>

                                            </div>
                                        </div>
                                    </article>
                                );
                            },
                        )}

                    </div>
                ) : (
                    <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-12 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-background)] text-3xl">
                            📍
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                            No places found nearby
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
                            We couldn't find any attractions
                            around {destination.name} right now.
                        </p>

                    </div>
                )}
            </section>

            {/* =========================
                SELECTED PLACE MAP
            ========================== */}

            {selectedPlace && (
                <section className="mt-12">

                    <div className="mb-5">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Location
                        </p>

                        <h3 className="mt-2 text-2xl font-semibold">
                            {selectedPlace.name}
                        </h3>

                        <p className="mt-1 capitalize text-[var(--color-muted)]">
                            {selectedPlace.type.replaceAll(
                                "_",
                                " ",
                            )}
                        </p>
                    </div>

                    <Map
                        latitude={
                            selectedPlace.latitude
                        }
                        longitude={
                            selectedPlace.longitude
                        }
                        place={selectedPlace}
                    />
                </section>
            )}

            {/* =========================
                LOCAL TRIP PREVIEW
            ========================== */}

            {tripPlaces.length > 0 && (
                <section className="mt-20">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                Your trip
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                                Saved places
                            </h2>

                            <p className="mt-2 text-[var(--color-muted)]">
                                Places you've added to your
                                itinerary.
                            </p>
                        </div>

                        <p className="text-sm text-[var(--color-muted)]">
                            {tripPlaces.length}{" "}
                            {tripPlaces.length === 1
                                ? "place"
                                : "places"}{" "}
                            added
                        </p>

                    </div>

                    <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white">

                        {tripPlaces.map(
                            (place, index) => (
                                <div
                                    key={
                                        place.id
                                    }
                                    className="flex items-center gap-5 border-b border-[var(--color-border)] p-5 last:border-b-0 sm:p-6"
                                >

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-background)] text-sm font-semibold">
                                        {String(
                                            index +
                                            1,
                                        ).padStart(
                                            2,
                                            "0",
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold">
                                            {
                                                place.name
                                            }
                                        </h3>

                                        <p className="mt-1 text-sm capitalize text-[var(--color-muted)]">
                                            {place.type.replaceAll(
                                                "_",
                                                " ",
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setSelectedPlace(
                                                place,
                                            )
                                        }
                                        className="hidden rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-background)] sm:block"
                                    >
                                        View
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleRemovePlace(
                                                place.id,
                                            )
                                        }
                                        className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                                    >
                                        Remove
                                    </button>

                                </div>
                            ),
                        )}

                    </div>
                </section>
            )}

        </main>
    );
}

export default Destination;