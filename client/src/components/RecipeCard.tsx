import type { Recipe } from "../types/recipes";

type Ingredient = {
  name: string;
  amount: string;
}

export default function RecipeCard({ r }: { r: Recipe }) {
  return (
    <a
      href={`/recipe/${r._id}`}
      className="group relative w-full sm:w-64 shrink-0 snap-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
    >
      <div className="relative">
        <img src={r.img} alt={r.title} className="aspect-[4/5] w-full object-cover" loading="lazy" />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-black/60 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="text-xs text-white/80 capitalize">{Object.values(r.information).join(', ') || r.information.join(', ')}</div>
          <div className="text-xs text-white/80">
            Main: {r.ingredients.slice(0, 3).map((ing: Ingredient, index) => {
              const joinString =  index < 2 ? ', ' : ''
              return <span key={index} className='capitalize'>{ing.name}{joinString}</span>
            })}
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--fg)]">{r.title}</h3>
      </div>
    </a>
  );
}
