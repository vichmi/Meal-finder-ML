import Container from "./Container";


export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] py-6">
      <Container className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-2 text-lg font-semibold text-[var(--brand)]">AllInOneRecipes</div>
          <p className="text-sm text-[var(--muted-fg)]">Your kitchen, simplified. Discover and cook delicious recipes in minutes.</p>
        </div>
      </Container>
      <Container className="mt-6 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--muted-fg)]">
        © {new Date().getFullYear()} AllInOneRecipes. All rights reserved.
      </Container>
    </footer>
  );
}