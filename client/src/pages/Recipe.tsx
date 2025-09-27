import { useParams } from "react-router";
import Container from "../components/Container";
import { useEffect, useState } from "react";
import axios from "../libs/axios";

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

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    axios.get(`/recipe/${id}`).then(res => {
      setRecipe(res.data);
    });
  }, [id]);

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        // await axios.delete(`/recipe/${id}/bookmark`);
        setBookmarked(false);
      } else {
        // await axios.post(`/recipe/${id}/bookmark`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
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
          src={recipe.img}
          alt={recipe.title}
          className="w-full h-72 object-cover rounded-2xl shadow-md"
        />

        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold capitalize">{recipe.title}</h1>

          {/* Actions: Rating + Bookmark */}
          <div className="flex items-center gap-4">
            {/* Stars */}
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill={isFilled ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{
                        color: isFilled ? "#facc15" : "currentColor", // Tailwind yellow-400
                        opacity: hoverRating && star <= hoverRating ? 0.5 : 1,
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.09 6.41a1 1 0 00.95.69h6.708c.969 0 1.371 1.24.588 1.81l-5.428 3.947a1 1 0 00-.364 1.118l2.09 6.41c.3.921-.755 1.688-1.54 1.118l-5.428-3.947a1 1 0 00-1.175 0l-5.428 3.947c-.784.57-1.838-.197-1.539-1.118l2.09-6.41a1 1 0 00-.364-1.118L2.713 11.837c-.783-.57-.38-1.81.588-1.81h6.708a1 1 0 00.95-.69l2.09-6.41z"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

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
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
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
        <div className="bg-white border rounded-xl shadow-sm p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recipe.information.map((info) => (
            <div key={info.label} className="text-center">
              <p className="text-sm text-gray-500">{info.label}</p>
              <p className="font-semibold">{info.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing) => (
            <li
              key={ing._id}
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
            >
              <input type="checkbox" className="w-4 h-4 accent-green-600" />
              <span>
                <span className="font-medium">{ing.amount}</span> {ing.name}
              </span>
            </li>
          ))}
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
