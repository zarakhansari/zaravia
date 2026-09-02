function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
            <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-24 text-center lg:px-8 lg:pt-32">

                <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-accent)]">
                    Travel differently
                </p>

                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-8xl">
                    Where will you go next?
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
                    Discover destinations, plan unforgettable experiences,
                    and build your perfect trip.
                </p>

                <div className="mt-10 flex w-full max-w-2xl items-center rounded-full border border-[var(--color-border)] bg-white p-2 shadow-sm">
                    <div className="flex flex-1 items-center px-4 text-left">
                        <span className="mr-3 text-xl">⌕</span>

                        <div>
                            <p className="text-xs font-medium text-[var(--color-muted)]">
                                Destination
                            </p>

                            <p className="text-sm font-medium">
                                Where do you want to go?
                            </p>
                        </div>
                    </div>

                    <button className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
                        Explore
                    </button>
                </div>

            </div>
        </section>
    );
}

export default Hero;