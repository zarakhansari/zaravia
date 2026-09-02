import DestinationSearch from "./DestinationSearch";

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

                <div className="mt-10 w-full flex justify-center">
                    <DestinationSearch />
                </div>

            </div>
        </section>
    );
}

export default Hero;