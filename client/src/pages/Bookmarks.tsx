import { useEffect, useState } from 'react';
import axios from '../libs/axios';
import type { Recipe } from '../types/recipes';

export default function Bookmarks() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get('/bookmarked', { withCredentials: true })
      .then((res: any) => {
        setRecipes(res.data);
      })
      .catch((err: any) => {
        console.error('Error fetching bookmarks:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <p className="text-[var(--muted-fg)] text-lg">
          There are no bookmarked recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-[var(--bg)] text-[var(--fg)]">
      <h1 className="text-2xl font-bold mb-6">Bookmarked Recipes</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <a
            key={recipe._id}
            className="rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-shadow duration-300 bg-[var(--card)] border-[var(--border)]"
            href={`/recipe/${recipe._id}`}
          >
            <img
              src={recipe.img}
              alt={recipe.title}
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 flex flex-col justify-between h-full">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                {recipe.title}
              </h2>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
