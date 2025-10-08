import React, { useEffect, useState } from "react";
import axios from "../libs/axios";
import profileImage from '../assets/profile.png'

const availableDiets = [
  "Keto",
  "Vegan",
  "Vegetarian",
  "Carnivore",
  "Gluten-Free",
  "Paleo",
];

interface Recipe {
  _id: string;
  title: string;
  img: string;
}

export default function Profile() {
  const [diet, setDiet] = useState("");
  const [image, setImage] = useState<string | null>(profileImage);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    axios
      .get("/auth/profile", { withCredentials: true })
      .then((res:any) => {
        console.log(res.data);
        setDiet(res.data.user.diet || "");
        setImage(res.data.user.img || profileImage);
        setRecipes(res.data.user.createdRecipes || []);
      })
      .catch((err:any) => console.error("Error loading profile:", err));
  }, []);

  const handleLogout = () => {
    axios
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        window.location.href = "/login";
      })
      .catch((err:any) => console.error("Logout error:", err));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage(preview);
      // TODO: качи към бекенда
      const formData = new FormData();
      formData.append("image", file);

      axios
        .patch("/user/profile/image", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res:any)=>{
          console.log(res.data);
          setImage(`http://localhost:3001/${res.data.image}`)
        })
        .catch((err:any) => console.error("Image upload error:", err));
    }
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiet = e.target.value;
    setDiet(newDiet);

    axios
      .patch(
        "/user/profile",
        { diet: newDiet },
        { withCredentials: true }
      )
      .catch((err:any) => console.error("Diet update error:", err));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[var(--bg)] text-[var(--fg)] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Моят профил</h1>

      {/* Profile image */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={image || ''
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-[var(--border)] object-cover"
          />
          <label
            htmlFor="profileImage"
            className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-2 rounded-full cursor-pointer hover:opacity-90"
          >
            📷
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Diet select */}
      <div className="mb-6">
        <label htmlFor="diet" className="block mb-2 font-medium">
          Избери диета:
        </label>
        <select
          id="diet"
          value={diet}
          onChange={handleDietChange}
          className="w-full p-2 border rounded-md bg-[var(--card)] border-[var(--border)] text-[var(--fg)]"
        >
          <option value="">-- Няма --</option>
          {availableDiets.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Created Recipes */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Моите рецепти</h2>
        {recipes.length === 0 ? (
          <p className="text-[var(--muted-fg)]">Все още нямаш качени рецепти.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-shadow duration-300 bg-[var(--card)] border-[var(--border)]"
              >
                <img
                  src={recipe.img}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2">{recipe.title}</h3>
                  <a
                    href={`/recipe/${recipe._id}`}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    Виж рецептата
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full py-2 px-4 rounded-md bg-[var(--primary)] text-white font-medium hover:opacity-90 transition"
      >
        Изход
      </button>
    </div>
  );
}
