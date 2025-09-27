import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import RecipeCard from "./RecipeCard";
import axios from '../libs/axios';
import type { Recipe } from "../types/recipes";

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

export default function Carousel({ title }: { title: string;}) {
  const { ref, scrollBy } = useCarousel();
  const [catRecipes, setCatRecipes] = useState([]);
  useEffect(() => {
    axios.get('/category?title=' + title)
    .then(res => {
      if(res.status == 200) {
        setCatRecipes(res.data);
      }
    })
    .catch(err => {console.error(err)});
  }, []);

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
          {catRecipes.map((r, index) => (
            <RecipeCard key={index} r={r} />
          ))}
        </div>  
      </Container>
    </section>
  );
}