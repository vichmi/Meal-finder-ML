import React, { useEffect, useState } from 'react'
import axios from '../libs/axios';
import { useSearchParams } from 'react-router';
import RecipeCard from '../components/RecipeCard';

export default function Search() {
  const [searchItems, setSearchItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const query = searchParams.get('q') || '';
    axios.get('/search?q=' + encodeURIComponent(query)+'&k='+encodeURIComponent('18'))
    .then(res => {
      console.log(res.data)
      setSearchItems(res.data);
    })
    .catch(() => setSearchItems([]))
  }, []);


  return (
    <div>

  <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        {searchItems.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {searchItems.map((item: any, index: number) => (
              <a
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                href={`/recipe/${item._id}`}
              >
                <div className="w-full aspect-square bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                  {item.ingredients && item.ingredients.length > 0 && (
                    <ul className="text-sm text-gray-700 mb-2 list-disc list-inside">
                      {item.ingredients.slice(0, 5).map(
                        (ingredient: { name: string; amount: string }, i: number) => (
                          <li key={i}>
                            {ingredient.name}
                            {ingredient.amount ? ` (${ingredient.amount})` : ''}
                          </li>
                        )
                      )}
                      {item.ingredients.length > 5 && (
                        <li className="italic text-gray-400">and more...</li>
                      )}
                    </ul>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
