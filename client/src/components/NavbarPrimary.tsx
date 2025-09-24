import Container from "./Container";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function NavbarPrimary() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-50">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left: Brand */}
        <a href="/" className="shrink-0 text-lg font-semibold tracking-tight text-[var(--brand)] hover:opacity-90">
          AllInOneRecipes
        </a>

        {/* Center: Search + Fridge button */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3 w-full max-w-3xl px-4">
            <div className="flex-1">
              <SearchBar />
            </div>

            <a
              type="button"
              aria-label="Open fridge"
              className="relative cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-white shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              href='/fridge'
            >
              <span className="absolute inset-0 rounded-lg bg-[var(--primary)]/30" aria-hidden />
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="5" y="3" width="14" height="18" rx="1.2" stroke="currentColor" strokeWidth="2" />
                <rect x="9" y="7" width="2.5" height="3" rx="0.5" fill="currentColor" />
                <rect x="9" y="12" width="2.5" height="6" rx="0.5" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right: Auth + Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/login" className="rounded-xl px-3 py-1.5 text-sm hover:opacity-90 text-[var(--fg)]">Sign in</a>
          <a href="/signup" className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
            Sign up
          </a>
          <ThemeToggle />
        </div>
      </Container>
    </div>
  );
}