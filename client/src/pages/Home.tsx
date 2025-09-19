import React, { useEffect, useMemo, useRef, useState } from "react";

// ------------------------------------------------------------
// AllInOneRecipes – Landing Page (React + Tailwind, Vite-ready)
// ------------------------------------------------------------
// Notes:
// - Dark mode toggles a `dark` class on <html>. Make sure Tailwind's darkMode is set to 'class'.
// - Colors are driven by CSS variables (primary/secondary + bg/fg) so you can reuse them across pages.
// - Carousels are pure CSS/JS (no deps), using scroll snapping + arrow buttons.
// - Replace the placeholder images with your own assets.
// ------------------------------------------------------------

// ---------- Types ----------

type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: string;
  mainIngredients: string[];
  tags?: string[];
};

type Category = {
  id: string;
  title: string;
  recipes: Recipe[];
};

// ---------- Theme ----------

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm transition hover:opacity-90 border-[var(--border)] bg-[var(--card)] text-[var(--fg)]"
      aria-label="Toggle color theme"
    >
      <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"} mode</span>
      {/* Sun / Moon icons */}
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}

// ---------- UI bits ----------

function Container({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function SearchBar() {
  return (
    <form className="relative w-full max-w-xl" role="search" aria-label="Search recipes">
      <input
        type="search"
        placeholder="Search recipes..."
        className="w-full rounded-2xl border bg-[var(--card)] px-4 py-2 pr-10 text-[var(--fg)] placeholder:text-[color:rgba(0,0,0,0.45)] dark:placeholder:text-[color:rgba(255,255,255,0.45)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
    </form>
  );
}

function Tag({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--secondary)]/20 px-3 py-1 text-xs font-medium text-[var(--secondary-ink)] ring-1 ring-[var(--secondary)]/40">
      {children}
    </span>
  );
}

// ---------- Header (two navbars) ----------

function NavbarPrimary() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-50">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left: Brand */}
        <a href="#" className="shrink-0 text-lg font-semibold tracking-tight text-[var(--primary)] hover:opacity-90">
          AllInOneRecipes
        </a>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        {/* Right: Auth + Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#" className="rounded-xl px-3 py-1.5 text-sm hover:opacity-90 text-[var(--fg)]">Sign in</a>
          <a
            href="#"
            className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Sign up
          </a>
          <ThemeToggle />
        </div>
      </Container>
    </div>
  );
}

function NavbarSecondary() {
  const categories = ["Pastry", "Vegan", "20 minute", "Gluten-free", "High Protein", "Breakfast", "Dinner", "Dessert"];
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 sticky top-16 z-40">
      <Container>
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm text-[var(--fg)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {c}
            </button>
          ))}
        </div>
      </Container>
    </div>
  );
}

// ---------- Hero ----------

function Hero({ recipe }: { recipe: Recipe }) {
  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="aspect-video w-full object-cover"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" aria-hidden />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl text-[var(--fg)]">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2">
              {recipe.tags?.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <div className="mt-2 text-sm text-[var(--muted-fg)]">
              <p>
                Quick intro: crispy on the outside, fluffy inside. Ready in {recipe.prepTime}. Main ingredients:
                {" "}
                <strong>{recipe.mainIngredients.slice(0, 3).join(", ")}</strong>.
              </p>
            </div>
            <div className="mt-2">
              <a href="#" className="inline-flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-4 py-2 font-medium text-[var(--primary-ink)] hover:opacity-90">
                Cook this
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------- Cards & Carousel ----------

function RecipeCard({ r }: { r: Recipe }) {
  return (
    <a
      href="#"
      className="group relative w-64 shrink-0 snap-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
    >
      <div className="relative">
        <img src={r.image} alt={r.title} className="aspect-[4/5] w-full object-cover" loading="lazy" />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-black/60 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="text-xs text-white/80">Prep: {r.prepTime}</div>
          <div className="text-xs text-white/80">
            Main: {r.mainIngredients.slice(0, 3).join(", ")}
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--fg)]">{r.title}</h3>
      </div>
    </a>
  );
}

function useCarousel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    const cardWidth = 272; // ~w-64 + gap
    node.scrollBy({ left: dir * cardWidth * 1.2, behavior: "smooth" });
  };
  return { ref, scrollBy } as const;
}

function Carousel({ title, items }: { title: string; items: Recipe[] }) {
  const { ref, scrollBy } = useCarousel();
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl text-[var(--fg)]">{title}</h2>
          <div className="hidden gap-2 md:flex">
            <button
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 hover:border-[var(--primary)]"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollBy(-1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 hover:border-[var(--primary)]"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollBy(1)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory">
          {items.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------- Footer ----------

function Footer() {
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
            <li><a href="#" className="hover:text-[var(--fg)]">Careers</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-[var(--fg)]">Resources</div>
          <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
            <li><a href="#" className="hover:text-[var(--fg)]">Blog</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Guides</a></li>
            <li><a href="#" className="hover:text-[var(--fg)]">Help Center</a></li>
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

// ---------- Demo Data ----------

const heroRecipe: Recipe = {
  id: "hero-1",
  title: "Golden Garlic Butter Salmon with Lemon & Herbs",
  image:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop",
  prepTime: "20 min",
  mainIngredients: ["salmon", "garlic", "butter", "lemon", "parsley"],
  tags: ["Gluten-free", "High Protein", "Quick"],
};

function makeRecipe(id: string, title: string, image: string, prep: string, ingredients: string[]): Recipe {
  return { id, title, image, prepTime: prep, mainIngredients: ingredients };
}

const pastry: Category = {
  id: "cat-pastry",
  title: "Pastry Picks",
  recipes: [
    makeRecipe(
      "p1",
      "Flaky Butter Croissants",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop",
      "2 h",
      ["flour", "butter", "yeast"]
    ),
    makeRecipe(
      "p2",
      "Cinnamon Swirl Buns",
      "https://images.unsplash.com/photo-1509440012493-4e24ab97c9ae?q=80&w=1600&auto=format&fit=crop",
      "1 h",
      ["flour", "cinnamon", "sugar"]
    ),
    makeRecipe(
      "p3",
      "Berry Galette",
      "https://images.unsplash.com/photo-1484328352827-7d4aa5a81ca9?q=80&w=1600&auto=format&fit=crop",
      "45 min",
      ["berries", "pastry dough", "lemon"]
    ),
    makeRecipe(
      "p4",
      "Chocolate Eclairs",
      "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?q=80&w=1600&auto=format&fit=crop",
      "1 h 15 min",
      ["choux", "cream", "chocolate"]
    ),
    makeRecipe(
      "p5",
      "Apple Turnovers",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      "50 min",
      ["apples", "puff pastry", "cinnamon"]
    ),
  ],
};

const vegan: Category = {
  id: "cat-vegan",
  title: "Vegan Favourites",
  recipes: [
    makeRecipe(
      "v1",
      "Rainbow Buddha Bowl",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
      "25 min",
      ["quinoa", "chickpeas", "avocado"]
    ),
    makeRecipe(
      "v2",
      "Creamy Tomato Pasta",
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["pasta", "tomato", "oat cream"]
    ),
    makeRecipe(
      "v3",
      "Tofu Stir-Fry",
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1600&auto=format&fit=crop",
      "18 min",
      ["tofu", "broccoli", "soy sauce"]
    ),
    makeRecipe(
      "v4",
      "Peanut Noodle Salad",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["noodles", "peanut", "lime"]
    ),
    makeRecipe(
      "v5",
      "Green Smoothie Bowl",
      "https://images.unsplash.com/photo-1464195643332-1f236b1c226a?q=80&w=1600&auto=format&fit=crop",
      "10 min",
      ["spinach", "banana", "almond milk"]
    ),
  ],
};

const quick20: Category = {
  id: "cat-20m",
  title: "Done in 20 Minutes",
  recipes: [
    makeRecipe(
      "q1",
      "Garlic Shrimp Skillet",
      "https://images.unsplash.com/photo-1604908176997-43162b0f04c7?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["shrimp", "garlic", "parsley"]
    ),
    makeRecipe(
      "q2",
      "Avocado Toast Deluxe",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1600&auto=format&fit=crop",
      "8 min",
      ["bread", "avocado", "egg"]
    ),
    makeRecipe(
      "q3",
      "Caprese Sandwich",
      "https://images.unsplash.com/photo-1528731708534-816fe59f90cb?q=80&w=1600&auto=format&fit=crop",
      "10 min",
      ["mozzarella", "tomato", "basil"]
    ),
    makeRecipe(
      "q4",
      "Spicy Tuna Wrap",
      "https://images.unsplash.com/photo-1539133398610-3d280b6d2fd9?q=80&w=1600&auto=format&fit=crop",
      "12 min",
      ["tuna", "tortilla", "sriracha"]
    ),
    makeRecipe(
      "q5",
      "Lemon Herb Chicken",
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["chicken", "lemon", "thyme"]
    ),
  ],
};

const highProtein: Category = {
  id: "cat-highprotein",
  title: "High Protein",
  recipes: [
    makeRecipe(
      "h1",
      "Beef & Broccoli",
      "https://images.unsplash.com/photo-1604908554015-8ea468b009b8?q=80&w=1600&auto=format&fit=crop",
      "25 min",
      ["beef", "broccoli", "soy sauce"]
    ),
    makeRecipe(
      "h2",
      "Greek Chicken Bowls",
      "https://images.unsplash.com/photo-1612336307429-8f6b0181bd33?q=80&w=1600&auto=format&fit=crop",
      "30 min",
      ["chicken", "rice", "tzatziki"]
    ),
    makeRecipe(
      "h3",
      "Egg Fried Rice",
      "https://images.unsplash.com/photo-1630934155581-4d0fe7a22b88?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["egg", "rice", "peas"]
    ),
    makeRecipe(
      "h4",
      "Turkey Chili",
      "https://images.unsplash.com/photo-1617191519400-30be84f9a0fd?q=80&w=1600&auto=format&fit=crop",
      "35 min",
      ["turkey", "beans", "tomato"]
    ),
    makeRecipe(
      "h5",
      "Cottage Cheese Pancakes",
      "https://images.unsplash.com/photo-1544025163-0b2bdde32061?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["cottage cheese", "oats", "egg"]
    ),
  ],
};

const categories: Category[] = [pastry, vegan, quick20, highProtein];

// ---------- Page ----------

export default function AllInOneRecipesLanding() {
  // Optionally preload hero image
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroRecipe.image;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      {/* Global CSS variables + helpers */}
      <style>{`
        :root {
          --primary: #A4193D; /* light mode primary */
          --secondary: #FFDFB9; /* light mode secondary */
          --bg: #fff;
          --fg: #0b0b0c;
          --muted-fg: rgba(0,0,0,0.58);
          --card: #ffffff;
          --border: rgba(0,0,0,0.12);
          --primary-ink: #4b0b19;
          --secondary-ink: #6b3f00;
        }
        .dark {
          --primary: #0A174E; /* dark mode primary */
          --secondary: #F5D042; /* dark mode secondary */
          --bg: #0b0d12;
          --fg: #f3f4f6;
          --muted-fg: rgba(255,255,255,0.65);
          --card: #0f1219;
          --border: rgba(255,255,255,0.12);
          --primary-ink: #000a2a;
          --secondary-ink: #2c2300;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header>
        <NavbarPrimary />
        <NavbarSecondary />
      </header>

      <main>
        <Hero recipe={heroRecipe} />

        {categories.map((cat) => (
          <Carousel key={cat.id} title={cat.title} items={cat.recipes} />
        ))}
      </main>

      <Footer />
    </div>
  );
}
