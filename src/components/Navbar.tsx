import { useState } from "react";
import { Link, NavLink } from "react-router";

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="text-xl font-semibold tracking-[0.2em]"
                >
                    ZARAVIA
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    <NavLink
                        to="/"
                        className="text-sm font-semibold text-black transition hover:opacity-70"
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/explore"
                        className="text-sm font-semibold text-black transition hover:opacity-70"
                    >
                        Explore
                    </NavLink>

                    <Link
                        to="/your-trip"
                        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--color-background)]"
                    >
                        <span className="text-base">♡</span>
                        Your trip
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-text)] md:hidden"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? (
                        // X icon
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        // Hamburger icon
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t border-[var(--color-border)] px-6 py-5 md:hidden">
                    <div className="flex flex-col gap-5">

                        <NavLink
                            to="/"
                            onClick={closeMenu}
                            className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/explore"
                            onClick={closeMenu}
                            className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                            Explore
                        </NavLink>

                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="w-fit rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Plan a trip
                        </Link>

                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;