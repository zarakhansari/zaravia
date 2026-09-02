import Hero from "../components/Hero";

function Home() {
    return (
        <main className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-6">
            <Hero />
        </main>
    );
}

export default Home;