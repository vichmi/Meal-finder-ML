import Container from "./Container";


export default function Footer() {
  return (
    <footer className="mt-8 border-t border-[var(--border)] bg-[var(--bg)] py-10">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-2 text-lg font-semibold text-[var(--primary)]">AllInOneRecipes</div>
          <p className="text-sm text-[var(--muted-fg)]">Your kitchen, simplified. Discover and cook delicious recipes in minutes.</p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-[var(--fg)]">Company</div>
          <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
            <li><a href="#" className="hover:text-[var(--fg)]">About</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-[var(--fg)]">Legal</div>
          <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
            <li><a href="#" className="hover:text-[var(--fg)]">Privacy</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Terms</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Cookies</a></li>
          </ul>
        </div>
      </Container>
      <Container className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--muted-fg)]">
        © {new Date().getFullYear()} AllInOneRecipes. All rights reserved.
      </Container>
    </footer>
  );
}