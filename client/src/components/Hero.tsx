import Container from "./Container";
import Tag from "./Tag";
import type { Recipe } from '../types/recipes';

type Props = {
  recipe: Recipe;
};

export default function Hero({ recipe }: Props) {
    return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="grid items-stretch gap-6 grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={recipe.img}
              alt={recipe.title}
              className="w-full h-56 sm:h-72 md:h-auto object-cover"
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
            <div className="mt-2">
              <a href={`/recipe/${recipe._id}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-4 py-2 font-medium text-[var(--primary-ink)] hover:opacity-90">
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