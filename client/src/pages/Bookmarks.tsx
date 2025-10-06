import React, { useEffect, useState } from 'react';
import axios from '../libs/axios';

interface Recipe {
  _id: string;
  title: string;
  img: string;
  information: { label: string; value: string }[];
  tags: string[];
  diets: string[];
}

export default function Bookmarks() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/bookmarked', { withCredentials: true })
      .then((res) => {
        setRecipes(res.data);
      })
      .catch((err) => {
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
    <div className="max-w-6xl mx-auto p-6 bg-[var(--bg)] text-[var(--fg)]">
      <h1 className="text-2xl font-bold mb-6">Bookmarked Recipes</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <a
            key={recipe._id}
            className="rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-shadow duration-300 bg-[var(--card)] border-[var(--border)]"
            href={`/recipe/${recipe._id}`}
          >
            <img
              src={recipe.img}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col justify-between h-full">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                {recipe.title}
              </h2>

              <div className="text-sm text-[var(--muted-fg)] mb-2">
                {recipe.information?.map((info, i) => (
                  <p key={i}>
                    <span className="font-medium text-[var(--fg)]">
                      {info.label}
                    </span>{' '}
                    {info.value}
                  </p>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
