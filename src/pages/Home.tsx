import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { searchDestinationImage } from "../services/imageApi";
import type { DestinationImage } from "../types/image";
import DestinationSearch from "../components/DestinationSearch";

interface Slide {
    city: string;
    country: string;
}

const slides: Slide[] = [
    {
        city: "Amsterdam",
        country: "Netherlands",
    },
    {
        city: "Paris",
        country: "France",
    },
    {
        city: "Barcelona",
        country: "Spain",
    },
    {
        city: "Rome",
        country: "Italy",
    },
    {
        city: "Lisbon",
        country: "Portugal",
    },
    {
        city: "Copenhagen",
        country: "Denmark",
    },
];

function Home() {
    const navigate = useNavigate();

    const [currentSlide, setCurrentSlide] = useState(0);

    const [images, setImages] = useState<
        Record<string, DestinationImage | null>
    >({});

    const [loading, setLoading] = useState(true);

    const currentDestination = slides[currentSlide];

    /*
     * Load all destination images
     */
    useEffect(() => {
        async function loadImages() {
            try {
                setLoading(true);

                const results = await Promise.all(
                    slides.map(async (slide) => {
                        const image = await searchDestinationImage(slide.city);

                        return {
                            city: slide.city,
                            image,
                        };
                    }),
                );

                const imageMap: Record<
                    string,
                    DestinationImage | null
                > = {};

                results.forEach((result) => {
                    imageMap[result.city] = result.image;
                });

                setImages(imageMap);
            } catch (error) {
                console.error("Home image error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadImages();
    }, []);

    /*
     * Automatically change slide every 5 seconds
     */
    useEffect(() => {
        if (loading) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentSlide((current) =>
                current === slides.length - 1 ? 0 : current + 1,
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [loading]);

    /*
     * Go to next slide
     */
    function nextSlide() {
        setCurrentSlide((current) =>
            current === slides.length - 1 ? 0 : current + 1,
        );
    }

    /*
     * Go to previous slide
     */
    function previousSlide() {
        setCurrentSlide((current) =>
            current === 0 ? slides.length - 1 : current - 1,
        );
    }

    /*
     * Open the current destination
     */
    function exploreDestination() {
        navigate(
            `/destination/${encodeURIComponent(
                currentDestination.city,
            )}`,
        );
    }

    const currentImage =
        images[currentDestination.city];

    return (
        <main>
            {/* HERO */}
            <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-black">
                {/* Background image */}
                {currentImage ? (
                    <img
                        key={currentImage.url}
                        src={currentImage.url}
                        alt={`${currentDestination.city}, ${currentDestination.country}`}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[var(--color-text)]" />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Stronger center overlay for readability */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Main content */}
                <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">
                    {/* Main headline */}
                    <div className="max-w-5xl text-white">
                        <h1 className="mt-6 text-4xl font-semibold leading-[1] tracking-[-0.03em] sm:text-6xl lg:text-7xl lg:leading-[0.95] lg:tracking-[-0.04em]">
                            Travel should feel
                            <br className="hidden lg:block" />
                            exciting,
                            <br className="hidden lg:block" />
                            <span className="text-[var(--color-accent)]">
                                not complicated.
                            </span>
                        </h1>

                        <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-white/80 sm:text-sm">
                            Discover your next adventure
                        </p>
                    </div>

                    {/* Current destination */}
                    <div className="absolute bottom-28 left-0 right-0 px-6 text-white sm:bottom-32">
                        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">
                            Explore
                        </p>

                        <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {currentDestination.city}
                        </h2>

                        <p className="mt-1 text-base text-white/80 sm:text-lg">
                            {currentDestination.country}
                        </p>

                        <button
                            onClick={exploreDestination}
                            className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-white/90"
                        >
                            Explore destination
                        </button>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-6 lg:px-8">
                        {/* Slide indicators */}
                        <div className="flex items-center gap-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.city}
                                    onClick={() => setCurrentSlide(index)}
                                    aria-label={`Show ${slide.city}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? "w-8 bg-white"
                                        : "w-2 bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Previous / next buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={previousSlide}
                                aria-label="Previous destination"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/10 text-lg text-white backdrop-blur-sm transition hover:bg-white/20 sm:h-12 sm:w-12"
                            >
                                ←
                            </button>

                            <button
                                onClick={nextSlide}
                                aria-label="Next destination"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/10 text-lg text-white backdrop-blur-sm transition hover:bg-white/20 sm:h-12 sm:w-12"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
    LOWER INTRO SECTION
========================== */}
            <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28">
                <div className="rounded-[2rem] bg-white px-8 py-12 sm:px-12 lg:px-16 lg:py-16">
                    <div className="grid gap-10 md:grid-cols-2 md:items-center">
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                Your journey starts here
                            </p>

                            <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
                                Less time planning.
                                <br />
                                More time travelling.
                            </h2>
                        </div>

                        <div>
                            <p className="max-w-xl text-base leading-7 text-[var(--color-muted)]">
                                Zaravia brings destinations, weather, places
                                worth visiting, and trip planning together in
                                one simple experience.
                            </p>

                            <button
                                onClick={() => navigate("/explore")}
                                className="mt-6 rounded-full border border-[var(--color-text)] px-6 py-3 text-sm font-medium transition hover:bg-[var(--color-text)] hover:text-white"
                            >
                                Start exploring →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            {/* =========================
                SEARCH DESTINATION SECTION
            ========================== */}
            <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
                <div className="flex flex-col items-center text-center rounded-[2rem] border border-[var(--color-border)] bg-white px-6 py-12 sm:px-12 sm:py-16 shadow-sm">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                        Find a destination
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        Where do you want to go?
                    </h2>
                    <p className="mt-4 max-w-lg text-base text-[var(--color-muted)] sm:text-lg">
                        Search any city worldwide to check live weather, discover local attractions, and plan your journey.
                    </p>
                    <div className="mt-8 flex w-full justify-center">
                        <DestinationSearch />
                    </div>
                </div>
            </section>
        </main>
    );
}
export default Home;