import Container from "./Container";

export default function NavbarSecondary() {
  const categories = ["Pastry", "Vegan", "20 minute", "Gluten-free", "High Protein", "Breakfast", "Dinner", "Dessert"];
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 sticky top-16 z-40">
      <Container>
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar justify-center">
          {categories.map((c) => (
            <button
              key={c}
              className="shrink-0 rounded-full border border-[var(--brand)] bg-[var(--card)] px-4 py-1.5 text-sm text-[var(--fg)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {c}
            </button>
          ))}
        </div>
      </Container>
    </div>
  );
}
