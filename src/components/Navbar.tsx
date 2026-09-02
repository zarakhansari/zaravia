import { Link, NavLink } from "react-router";

function Navbar() {
    return (
        <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link
                    to="/"
                    className="text-xl font-semibold tracking-[0.2em]"
                >
                    ZARAVIA
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    <NavLink
                        to="/"
                        className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/explore"
                        className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                        Explore
                    </NavLink>
                </div>

                <Link
                    to="/"
                    className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                    Plan a trip
                </Link>
            </nav>
        </header>
    );
}

export default Navbar;