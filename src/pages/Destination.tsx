import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { searchDestinations } from "../services/geocodingApi";
import { getWeather } from "../services/weatherApi";
import { getPlaces } from "../services/placesApi";

import type { Destination as DestinationType } from "../types/destination";
import type { Weather } from "../types/weather";
import type { Place } from "../types/place";

import { getWeatherDescription } from "../utils/formatWeather";
import Map from "../components/Map";

function Destination() {
    const { name } = useParams();

    const [selectedPlace, setSelectedPlace] =
        useState<Place | null>(null);

    const [tripPlaces, setTripPlaces] =
        useState<Place[]>([]);

    const [destination, setDestination] =
        useState<DestinationType | null>(null);

    const [weather, setWeather] =
        useState<Weather | null>(null);

    const [places, setPlaces] =
        useState<Place[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [retrying, setRetrying] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * Load destination information
     */
    useEffect(() => {
        let retryTimer: ReturnType<typeof setTimeout>;

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

                // Get destination coordinates
                const results = await searchDestinations(name);

                if (results.length === 0) {
                    setError("Destination not found.");
                    return;
                }

                const selectedDestination = results[0];

                setDestination(selectedDestination);

                // Get places using coordinates
                const placesData = await getPlaces(
                    selectedDestination.latitude,
                    selectedDestination.longitude
                );

                setPlaces(placesData);

                // Get weather using coordinates
                const weatherData = await getWeather(
                    selectedDestination.latitude,
                    selectedDestination.longitude
                );

                setWeather(weatherData);
            } catch (err) {
                console.error("Destination error:", err);

                /*
                 * If the API returns 429 or 504,
                 * show the retry animation and reload automatically.
                 */
                if (
                    err instanceof Response &&
                    (err.status === 429 || err.status === 504)
                ) {
                    setRetrying(true);

                    retryTimer = setTimeout(() => {
                        window.location.reload();
                    }, 5000);

                    return;
                }

                setError(
                    "Could not load destination information."
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

    /*
     * Add a place to the trip
     */
    function addToTrip(place: Place) {
        setTripPlaces((currentPlaces) => {
            const alreadyAdded = currentPlaces.some(
                (item) => item.id === place.id
            );

            if (alreadyAdded) {
                return currentPlaces;
            }

            return [...currentPlaces, place];
        });
    }

    /*
     * Loading / retry animation
     */
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
                                Don't worry, we're trying to load your
                                destination again.
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
                                We're gathering everything you need for
                                your trip.
                            </p>
                        </>
                    )}
                </div>
            </main>
        );
    }

    /*
     * Normal error screen
     */
    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center">

                    <h1 className="text-4xl font-semibold">
                        {error}
                    </h1>

                    <button
                        onClick={() => window.location.reload()}
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

    const weatherDescription = weather
        ? getWeatherDescription(weather.weatherCode)
        : null;

    return (
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

            {/* Destination hero */}
            <section className="mt-4">
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
                            Discover places worth visiting, check the local
                            weather, and start planning your trip to{" "}
                            {destination.name}.
                        </p>
                    </div>

                    {/* Weather card */}
                    {weather && weatherDescription && (
                        <div className="rounded-3xl bg-[var(--color-text)] p-8 text-white shadow-sm">

                            <p className="text-sm font-medium uppercase tracking-[0.15em] opacity-60">
                                Current weather
                            </p>

                            <div className="mt-6 flex items-center gap-5">

                                <span className="text-6xl">
                                    {weatherDescription.icon}
                                </span>

                                <div>
                                    <p className="text-5xl font-semibold">
                                        {Math.round(weather.temperature)}°C
                                    </p>

                                    <p className="mt-1 text-sm opacity-70">
                                        {weatherDescription.label}
                                    </p>
                                </div>

                            </div>

                            <div className="mt-7 border-t border-white/15 pt-5">

                                <div className="flex items-center justify-between">

                                    <span className="text-sm opacity-60">
                                        Wind
                                    </span>

                                    <span className="text-sm font-medium">
                                        {Math.round(weather.windSpeed)} km/h
                                    </span>

                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </section>

            {/* 5-day forecast */}
            <section className="mt-10">

                <h2 className="text-2xl font-semibold">
                    5-day forecast
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">

                    {weather?.forecast.map((day) => {

                        const description =
                            getWeatherDescription(day.weatherCode);

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

            {/* Things to do */}
            <section className="mt-16">

                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Explore
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                    Things to do
                </h2>

                <p className="mt-2 text-[var(--color-muted)]">
                    Discover places worth visiting in{" "}
                    {destination.name}.
                </p>

                {places.length > 0 ? (

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {places.map((place) => (

                            <div
                                key={place.id}
                                className="rounded-2xl border border-[var(--color-border)] p-5 transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <button
                                    onClick={() =>
                                        setSelectedPlace(place)
                                    }
                                    className="w-full text-left"
                                >

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-background)]">
                                        📍
                                    </div>

                                    <h3 className="mt-4 font-semibold">
                                        {place.name}
                                    </h3>

                                    <p className="mt-1 text-sm capitalize text-[var(--color-muted)]">
                                        {place.type.replaceAll("_", " ")}
                                    </p>

                                </button>

                                <button
                                    onClick={() => addToTrip(place)}
                                    className="mt-5 w-full rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                    {tripPlaces.some(
                                        (item) => item.id === place.id
                                    )
                                        ? "✓ Added to trip"
                                        : "+ Add to trip"}
                                </button>

                            </div>

                        ))}

                    </div>

                ) : (

                    <p className="mt-6 text-[var(--color-muted)]">
                        No places found nearby.
                    </p>

                )}

            </section>

            {/* Selected place map */}
            {selectedPlace && (
                <section className="mt-8">

                    <div className="mb-4">

                        <p className="text-sm text-[var(--color-muted)]">
                            Selected place
                        </p>

                        <h3 className="text-2xl font-semibold">
                            {selectedPlace.name}
                        </h3>

                    </div>

                    <Map
                        latitude={selectedPlace.latitude}
                        longitude={selectedPlace.longitude}
                        place={selectedPlace}
                    />

                </section>
            )}

            {/* Your trip */}
            <section className="mt-16">

                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Your trip
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                    My trip to {destination.name}
                </h2>

                {tripPlaces.length === 0 ? (

                    <p className="mt-4 text-[var(--color-muted)]">
                        You haven't added any places yet.
                    </p>

                ) : (

                    <div className="mt-6 space-y-3">

                        {tripPlaces.map((place, index) => (

                            <div
                                key={place.id}
                                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4"
                            >

                                <div className="flex items-center gap-4">

                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-sm">
                                        {index + 1}
                                    </span>

                                    <div>

                                        <p className="font-medium">
                                            {place.name}
                                        </p>

                                        <p className="text-sm capitalize text-[var(--color-muted)]">
                                            {place.type.replaceAll("_", " ")}
                                        </p>

                                    </div>

                                </div>

                                <button
                                    onClick={() =>
                                        setTripPlaces((currentPlaces) =>
                                            currentPlaces.filter(
                                                (item) => item.id !== place.id
                                            )
                                        )
                                    }
                                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                                >
                                    Remove
                                </button>

                            </div>

                        ))}

                    </div>

                )}

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