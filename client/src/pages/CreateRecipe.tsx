import Container from "../components/Container";
import { useState } from "react";
import axios from '../libs/axios';

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>([]);
  const [instructions, setInstructions] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [images, setImages] = useState<File[] | null>(null);

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  const handleIngredientChange = (index: number, field: "name" | "amount", value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("categories", JSON.stringify(categories)); // arrays must be stringified
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("instructions", instructions);
    formData.append("servings", servings.toString());
    formData.append("prepTime", prepTime.toString());
    formData.append("cookTime", cookTime.toString());

    // append images (images should be File[] from input type="file")
    if(!images) {return;}
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    axios.post("/createRecipe", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      window.location.href = "/recipe/" + res.data._id;
    })
    .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[var(--bg)] text-[var(--fg)] py-10">
      <Container className="max-w-3xl w-full border border-[var(--border)] rounded-2xl bg-[var(--card)] p-8 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--brand)]">Create Recipe</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
              placeholder="Amazing Chocolate Cake"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                placeholder="e.g. Dessert"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary)]/30 px-3 py-1 text-sm text-[var(--primary)]"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="ml-1 text-xs text-[var(--fg)] hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Servings, Prep, Cook Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                placeholder="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prep Time</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                placeholder="15 min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cook Time</label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                placeholder="30 min"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium mb-1">Ingredients</label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(i, "name", e.target.value)}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                  placeholder="Ingredient name"
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(i, "amount", e.target.value)}
                  className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                  placeholder="Amount"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="mt-2 rounded-lg bg-[var(--secondary)] px-3 py-1 text-sm font-medium text-[var(--primary-ink)] hover:opacity-90"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
              placeholder="Step 1: Mix ingredients...\nStep 2: Bake for 30 minutes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="block w-full text-sm text-[var(--fg)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            Save Recipe
          </button>
        </form>
      </Container>
    </div>
  );
}