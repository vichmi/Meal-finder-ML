import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import RecipeCard from "./RecipeCard";
import axios from '../libs/axios';
import type { AxiosError, AxiosResponse } from "axios";

function useCarousel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    // use viewport width fallback when card width is variable
    const cardWidth = node.querySelector('a')?.clientWidth || Math.min(window.innerWidth, 300);
    node.scrollBy({ left: dir * cardWidth * 1.2, behavior: "smooth" });
  };
  return { ref, scrollBy } as const;
}

export default function Carousel({ title }: { title: string;}) {
  const { ref, scrollBy } = useCarousel();
  const [catRecipes, setCatRecipes] = useState([]);
  useEffect(() => {
    axios.get('/category?title=' + title)
    .then((res: AxiosResponse) => {
      if(res.status == 200) {
        setCatRecipes(res.data);
      }
    })
    .catch((err: AxiosError) => {console.error(err)});
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
        <div className="relative">
          <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1">
            {catRecipes.map((r, index) => (
              <div className="shrink-0 w-full sm:w-56 sm:snap-center" key={index}>
                <RecipeCard r={r} />
              </div>
            ))}
          </div>

          {/* Mobile arrows overlay */}
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            <button aria-label="prev" onClick={() => scrollBy(-1)} className="p-2 m-2 rounded-full bg-[var(--card)] border border-[var(--border)] shadow">◀</button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
            <button aria-label="next" onClick={() => scrollBy(1)} className="p-2 m-2 rounded-full bg-[var(--card)] border border-[var(--border)] shadow">▶</button>
          </div>
        </div>
      </Container>
    </section>
  );
}