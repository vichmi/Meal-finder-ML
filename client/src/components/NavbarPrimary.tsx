import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import Container from "./Container";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import profileImage from "../assets/profile.png";

export default function NavbarPrimary() {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-50">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <a
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-[var(--brand)] hover:opacity-90"
        >
          AllInOneRecipes
        </a>

        {/* Desktop Search + Buttons */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center space-x-3 w-full max-w-3xl px-4">
            <div className="flex-1">
              <SearchBar />
            </div>

            {/* Fridge */}
            <a
              aria-label="Open fridge"
              href="/fridge"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-white shadow-lg hover:scale-105 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <line x1="5" y1="12" x2="19" y2="12" />
                <rect x="15.5" y="6" width="1" height="2" rx=".5" />
                <rect x="15.5" y="14" width="1" height="2" rx=".5" />
              </svg>
            </a>

            {/* Bookmarks */}
            <a
              aria-label="Bookmarked recipes"
              href="/bookmarks"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-white shadow-lg hover:scale-105 transition-transform"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M6 4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v18l-7-4-7 4V4z" />
              </svg>
            </a>

            {/* Shopping List */}
            <a
              aria-label="Shopping list"
              href="/shoppingList"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-white shadow-lg hover:scale-105 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M3 5h2l1 12h12l1.5-8H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Auth + Theme */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <a
                href="/login"
                className="rounded-xl px-3 py-1.5 text-sm hover:opacity-90 text-[var(--fg)]"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Sign up
              </a>
            </>
          ) : (
            <a href="/profile">
              <img
                src={user.img || profileImage}
                alt="Profile"
                className="cursor-pointer w-10 h-10 rounded-full object-cover border border-[var(--border)] shadow"
              />
            </a>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md text-[var(--fg)] hover:bg-[var(--border)]/20 transition"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-7 h-7"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)] flex flex-col gap-4 p-4 animate-in fade-in duration-150">
          <SearchBar />

          <div className="flex justify-around">
            <a href="/fridge">Fridge</a>
            <a href="/bookmarks">Bookmarks</a>
            <a href="/shoppingList">Shopping</a>
          </div>

          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
            {!user ? (
              <>
                <a href="/login" className="text-[var(--fg)]">
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-center"
                >
                  Sign up
                </a>
              </>
            ) : (
              <a
                href="/profile"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--border)]/20"
              >
                <img
                  src={user.img || profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-[var(--border)]"
                />
                <span>Profile</span>
              </a>
            )}
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
