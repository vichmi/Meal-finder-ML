import { useParams } from "react-router";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import axios from "../libs/axios";
import { useUser } from "../contexts/UserContext";
import TripleCheckbox from "../components/TripleCheckbox";

interface RecipeData {
  source: string;
  title: string;
  img: string;
  information: { label: string; value: string }[];
  ingredients: { _id: string; amount: string; name: string }[];
  instructions: string[];
  tags: string[];
  diets: string[];
}

export default function Recipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [fridge, setFridge] = useState<Array>([]);
  const [shoppingList, setShoppingList] = useState<Array>([]);
  
  useEffect(() => {
    axios.get(`/recipe/${id}`).then(res => {
      setRecipe(res.data);
    });
  }, [id]);
console.log(recipe)
  useEffect(() => {
    axios.get('/userItems', {withCredentials: true})
    .then(res => {
      setFridge(res.data.fridge);
      setShoppingList(res.data.shoppingList);
    });
  }, []);

  const handleBookmark = () => {
      if (bookmarked) {
        axios.delete(`/recipe/${id}/bookmark`, {withCredentials: true})
        .then(res => {
          setBookmarked(false);
        });
      } else {
        axios.post(`/recipe/${id}/bookmark`, {}, {withCredentials: true})
        .then(res => {
          setBookmarked(true);
        })
      }
  };

  if (!recipe) {
    return (
      <Container className="py-20 text-center">
        <p className="text-lg text-gray-500">Loading recipe...</p>
      </Container>
    );
  }

  return (
    <Container className="py-12 space-y-10 max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <img
          src={recipe.img || `http://localhost:3001${recipe.imgs[0]}`}
          alt={recipe.title}
          className="w-full h-72 object-cover rounded-2xl shadow-md"
        />

        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold capitalize">{recipe.title}</h1>

          {/* Actions: Rating + Bookmark */}
          <div className="flex items-center gap-4">
            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              aria-label="Bookmark recipe"
              className="focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill={bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: bookmarked ? "#b90606ff" : "currentColor" }}
              >
                <path d="M6 4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v18l-7-4-7 4V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags + Diets */}
        <div className="flex flex-wrap gap-2">
          {recipe.categories.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[var(--bg)] text-gray-700 text-sm rounded-full capitalize"
            >
              {tag}
            </span>
          ))}
          {recipe.diets.map((diet) => (
            <span
              key={diet}
              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full capitalize"
            >
              {diet}
            </span>
          ))}
        </div>
      </div>

      {/* Information */}
      {recipe.information && (
        <div className="bg-[var(--bg)] border rounded-xl shadow-sm p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recipe.information.map((info, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-500">{info.label}</p>
              <p className="font-semibold">{info.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <ul className="space-y-2 bg-[var(--bg)]">
          {recipe.ingredients.map((ing) => {
            let state: 0|1|2 = 0;
            if(fridge.includes(ing['name'])) {state = 1;}
            if(shoppingList.includes(ing['name'])) {state = 2;}
            return (
            <li
              key={ing._id}
              className="flex items-center gap-2 rounded-lg p-2 bg-[var(--card)]"
            >
              <TripleCheckbox itemName={ing['name']} initialState={state} onUpdate={(newState) => {
                if (newState === 1) {
                  setFridge((f) => [...f, ing]);
                  setShoppingList((s) => s.filter((i) => i !== ing));
                } else if (newState === 2) {
                  setShoppingList((s) => [...s, ing]);
                  setFridge((f) => f.filter((i) => i !== ing));
                } else {
                  setFridge((f) => f.filter((i) => i !== ing));
                  setShoppingList((s) => s.filter((i) => i !== ing));
                }
              }} />
              <span>
                <span className="font-medium ">{ing.amount}</span> {ing.name}
              </span>
            </li>
          )})}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4 list-decimal list-inside">
          {recipe.instructions.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Source */}
      <p className="text-sm text-gray-500">
        Source: <span className="capitalize">{recipe.source}</span>
      </p>
    </Container>
  );
}
