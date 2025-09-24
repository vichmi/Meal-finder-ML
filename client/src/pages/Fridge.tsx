import React, { useEffect, useState } from "react";
import Container from "../components/Container";
import { categories, heroRecipe } from "../data/recipe";
import axios from '../libs/axios'

const COMMON_PANTRY = [
  // Basics / Seasonings
  "Salt",
  "Black Pepper",
  "Olive Oil",
  "Vegetable Oil",
  "Butter",
  "Vinegar",
  "Soy Sauce",
  "Sugar",
  "Honey",
  "Flour",
  "Baking Powder",
  "Baking Soda",
  "Yeast",

  // Spices & herbs
  "Garlic",
  "Onion",
  "Paprika",
  "Cumin",
  "Coriander",
  "Oregano",
  "Basil",
  "Thyme",
  "Rosemary",
  "Chili Flakes",
  "Turmeric",

  // Oils & condiments
  "Mustard",
  "Ketchup",
  "Mayonnaise",
  "Tomato Paste",
  "Canned Tomatoes",
  "Pesto",

  // Staples
  "Rice",
  "Pasta",
  "Oats",
  "Bread",
  "Canned Beans",
  "Lentils",
  "Chickpeas",
  "Peanut Butter",
  "Nuts",

  // Dairy & eggs
  "Milk",
  "Eggs",
  "Yogurt",
  "Cheddar Cheese",
  "Mozzarella",
  "Cream",

  // Vegetables (common)
  "Carrot",
  "Potato",
  "Sweet Potato",
  "Broccoli",
  "Cauliflower",
  "Bell Pepper",
  "Tomato",
  "Cucumber",
  "Zucchini",
  "Spinach",
  "Kale",
  "Lettuce",
  "Mushrooms",

  // Fruits (common)
  "Apple",
  "Banana",
  "Orange",
  "Lemon",
  "Lime",
  "Strawberry",
  "Blueberry",
  "Avocado",

  // Meat & protein
  "Chicken Breast",
  "Ground Beef",
  "Pork",
  "Bacon",
  "Sausage",
  "Shrimp",
  "Canned Tuna",
  "Tofu",

  // Misc
  "Rice Vinegar",
  "Sesame Oil",
  "Coconut Milk",
  "Stock (chicken/veg/beef)",
];

const FRIDGE_KEY = "mp:fridge";
const SHOP_KEY = "mp:shopping";

export default function Fridge() {
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [location, setLocation] = useState<"fridge">("fridge");
  const [recipes, setRecipes] = useState<any[]>([])
  const [strictMode, setStrictMode] = useState(false);
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  const addToShoppingList = (items: string[]) => {
    if (!items || items.length === 0) return;
    setShoppingList((prev) => Array.from(new Set([...prev, ...items])));
  };

  useEffect(() => {
    try {
      const f = localStorage.getItem(FRIDGE_KEY);
      const s = localStorage.getItem(SHOP_KEY);
      if (f) setFridgeItems(JSON.parse(f));
      if (s) setShoppingList(JSON.parse(s));
      setLoaded(true);
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(FRIDGE_KEY, JSON.stringify(fridgeItems));
  }, [fridgeItems]);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(SHOP_KEY, JSON.stringify(shoppingList));
  }, [shoppingList]);


  const allKnown = Array.from(
    new Set([...COMMON_PANTRY, ...fridgeItems])
  );

  // normalized available ingredients (lowercase, unique)
  const available = Array.from(new Set(fridgeItems)).map((s) => s.toLowerCase());

  const existsAnywhere = (name: string) =>
    fridgeItems.includes(name)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 0) {
      setSuggestions(
        allKnown
          .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
          .filter((s) => !existsAnywhere(s))
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleAdd = (item?: string) => {
    const newItem = (item || input).trim();
    if (!newItem) return;
    if (existsAnywhere(newItem)) {
      setInput("");
      setSuggestions([]);
      return;
    }
  if (location === "fridge") {
    setFridgeItems([...fridgeItems, newItem]);
  }
    setInput("");
    setSuggestions([]);
  };

  const handleRemove = (name: string, loc: "fridge") => {
    if (loc === "fridge") {
        setFridgeItems(fridgeItems.filter((i) => i !== name));
    }
  };
  useEffect(() => {
    // If no available ingredients, clear suggestions instead of calling API
    if (available.length === 0) {
      setRecipes([]);
      return;
    }

    // send proper JSON payload (axios will set Content-Type)
    axios
      .post('/recipe', { ingredients: available })
      .then((res: any) => {
        setRecipes(res.data || []);
      })
      .catch((err: any) => {
        console.error('Failed to fetch recipes', err);
        setRecipes([]);
      });
  }, [fridgeItems]);

  return (
    <Container className="py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fridge</h1>
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Track what you have in your fridge. Add items below, move them between locations, and we'll use this list to suggest recipes.
        </p>

        <div className="bg-[var(--bg)] text-[var(--fg)] shadow rounded p-4 mb-6">
          <div className="flex gap-3 items-center">
            <div className="flex rounded-md overflow-hidden border">
              <button
                className={`px-3 py-2 ${location === "fridge" ? "bg-blue-600 text-white" : "bg-transparent text-[var(--muted-fg)]"}`}
                onClick={() => setLocation("fridge")}
              >
                🧊 Fridge
              </button>
            </div>

            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border rounded px-3 py-2 flex-1"
                  placeholder={`Add ingredient to ${location}...`}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                  autoComplete="off"
                />
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() => handleAdd()}
                  disabled={!input.trim()}
                >
                  Add
                </button>
              </div>
              {suggestions.length > 0 && (
                <ul className="border rounded mt-2 bg-[var(--bg)] text-[var(--fg)] shadow text-sm max-h-40 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      className="px-3 py-1 cursor-pointer hover:bg-green-50 flex justify-between items-center"
                      onClick={() => handleAdd(s)}
                    >
                      <span>{s}</span>
                      <span className="text-xs text-[var(--muted-fg)]">Add to {location}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row">

        <div className="grid grid-cols-2 md:grid-cols-3">
          <section className="bg-[var(--bg)] text-[var(--fg)] rounded shadow p-4 w-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧊</span>
                <h3 className="text-lg font-semibold">Fridge</h3>
                <span className="text-sm text-[var(--muted-fg)]">{fridgeItems.length} items</span>
              </div>
              <button
                className="text-sm text-[var(--muted-fg)]"
                onClick={() => {
                  setFridgeItems([]);
                }}
                title="Clear fridge"
              >
                Clear
              </button>
            </div>
            {fridgeItems.length === 0 ? (
              <p className="text-[var(--muted-fg)]">No items in fridge.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {fridgeItems.map((it) => (
                  <li key={it} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded">🥬</div>
                      <div>{it}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-red-500 px-2 py-1 rounded hover:bg-red-50"
                        onClick={() => handleRemove(it, "fridge")}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        {/* Recipes container */}
        <Container>
          <div className="bg-[var(--bg)] text-[var(--fg)] rounded shadow p-4 w-140">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Suggested Recipes</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[var(--muted-fg)]">Based on items in your fridge</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={strictMode} onChange={() => setStrictMode((s) => !s)} />
                  <span className="text-[var(--muted-fg)]">Strict (only exact matches)</span>
                </label>
              </div>
            </div>

                    <RecipeSuggestions
                      recipes={recipes}
                      strictMode={strictMode}
                      available={available}
                      onAddMissing={(items: string[]) => addToShoppingList(items)}
                    />
            </div>
        </Container>
        </div>
      </div>
    </Container>
  );
}

function RecipeSuggestions({
  recipes,
  strictMode = false,
  available = [],
  onAddMissing,
}: {
  recipes: any[];
  strictMode?: boolean;
  available?: string[];
  onAddMissing?: (items: string[]) => void;
}) {

  if (!recipes || recipes.length === 0)
    return <div className="text-[var(--muted-fg)]">No matching recipes yet — add some items to get suggestions.</div>;

  // Filter or map recipes based on available ingredients and strictMode
  const rows = recipes
    .map((recipe: any) => {
      const title = recipe.title || recipe.name || "Recipe";
      const img = recipe.img || recipe.image || recipe.imageUrl;
      const ingredients: string[] = (recipe.mainIngredients || recipe.ingredients || []).map((i: string) => i.toLowerCase());
      const missing = ingredients.filter((ing) => !available.includes(ing));
      return { recipe, title, img, ingredients, missing };
    })
    .filter((r) => {
      if (strictMode) return r.missing.length === 0;
      return true;
    });

  if (rows.length === 0)
    return <div className="text-[var(--muted-fg)]">No matching recipes yet — add some items to get suggestions.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rows.map((r: any, index: number) => (
        <div key={index} className="border rounded overflow-hidden">
          <div className="h-40 bg-gray-100">{r.img ? <img src={r.img} alt={r.title} className="w-full h-full object-cover" /> : null}</div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{r.title}</h3>
              <div className="text-xs text-[var(--muted-fg)]">{r.recipe.prepTime || r.recipe.time || "-"}</div>
            </div>
            <div className="text-xs text-[var(--muted-fg)] mb-2">{r.ingredients.length} ingredients</div>
            <div className="text-xs text-[var(--muted-fg)] mb-2">{r.missing.length} missing</div>
            <div className="flex gap-2">
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded">View</button>
              <button
                className="text-sm border px-3 py-1 rounded text-[var(--muted-fg)]"
                onClick={() => {
                  if (onAddMissing) onAddMissing(r.missing.map((m: string) => m));
                }}
              >
                Add missing
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
