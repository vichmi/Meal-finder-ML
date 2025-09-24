import type {Recipe, Category} from "../types/recipes.ts";

export const heroRecipe: Recipe = {
  id: "hero-1",
  title: "Golden Garlic Butter Salmon with Lemon & Herbs",
  img:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop",
  prepTime: "20 min",
  mainIngredients: ["salmon", "garlic", "butter", "lemon", "parsley"],
  tags: ["Gluten-free", "High Protein", "Quick"],
};

function makeRecipe(id: string, title: string, image: string, prep: string, ingredients: string[]): Recipe {
  return { id, title, image, prepTime: prep, mainIngredients: ingredients };
}

const desserts: Category = {
  id: "cat-desserts",
  title: "Desserts"
};

const pastry: Category = {
  id: "cat-pastry",
  title: "Pastry Picks",
  recipes: [
    makeRecipe(
      "p1",
      "Flaky Butter Croissants",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop",
      "2 h",
      ["flour", "butter", "yeast"]
    ),
    makeRecipe(
      "p2",
      "Cinnamon Swirl Buns",
      "https://images.unsplash.com/photo-1509440012493-4e24ab97c9ae?q=80&w=1600&auto=format&fit=crop",
      "1 h",
      ["flour", "cinnamon", "sugar"]
    ),
    makeRecipe(
      "p3",
      "Berry Galette",
      "https://images.unsplash.com/photo-1484328352827-7d4aa5a81ca9?q=80&w=1600&auto=format&fit=crop",
      "45 min",
      ["berries", "pastry dough", "lemon"]
    ),
    makeRecipe(
      "p4",
      "Chocolate Eclairs",
      "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?q=80&w=1600&auto=format&fit=crop",
      "1 h 15 min",
      ["choux", "cream", "chocolate"]
    ),
    makeRecipe(
      "p5",
      "Apple Turnovers",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      "50 min",
      ["apples", "puff pastry", "cinnamon"]
    ),
  ],
};

const vegan: Category = {
  id: "cat-vegan",
  title: "Vegan Favourites",
  recipes: [
    makeRecipe(
      "v1",
      "Rainbow Buddha Bowl",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
      "25 min",
      ["quinoa", "chickpeas", "avocado"]
    ),
    makeRecipe(
      "v2",
      "Creamy Tomato Pasta",
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["pasta", "tomato", "oat cream"]
    ),
    makeRecipe(
      "v3",
      "Tofu Stir-Fry",
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1600&auto=format&fit=crop",
      "18 min",
      ["tofu", "broccoli", "soy sauce"]
    ),
    makeRecipe(
      "v4",
      "Peanut Noodle Salad",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["noodles", "peanut", "lime"]
    ),
    makeRecipe(
      "v5",
      "Green Smoothie Bowl",
      "https://images.unsplash.com/photo-1464195643332-1f236b1c226a?q=80&w=1600&auto=format&fit=crop",
      "10 min",
      ["spinach", "banana", "almond milk"]
    ),
  ],
};

const quick20: Category = {
  id: "cat-20m",
  title: "Done in 20 Minutes",
  recipes: [
    makeRecipe(
      "q1",
      "Garlic Shrimp Skillet",
      "https://images.unsplash.com/photo-1604908176997-43162b0f04c7?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["shrimp", "garlic", "parsley"]
    ),
    makeRecipe(
      "q2",
      "Avocado Toast Deluxe",
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1600&auto=format&fit=crop",
      "8 min",
      ["bread", "avocado", "egg"]
    ),
    makeRecipe(
      "q3",
      "Caprese Sandwich",
      "https://images.unsplash.com/photo-1528731708534-816fe59f90cb?q=80&w=1600&auto=format&fit=crop",
      "10 min",
      ["mozzarella", "tomato", "basil"]
    ),
    makeRecipe(
      "q4",
      "Spicy Tuna Wrap",
      "https://images.unsplash.com/photo-1539133398610-3d280b6d2fd9?q=80&w=1600&auto=format&fit=crop",
      "12 min",
      ["tuna", "tortilla", "sriracha"]
    ),
    makeRecipe(
      "q5",
      "Lemon Herb Chicken",
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["chicken", "lemon", "thyme"]
    ),
  ],
};

const highProtein: Category = {
  id: "cat-highprotein",
  title: "High Protein",
  recipes: [
    makeRecipe(
      "h1",
      "Beef & Broccoli",
      "https://images.unsplash.com/photo-1604908554015-8ea468b009b8?q=80&w=1600&auto=format&fit=crop",
      "25 min",
      ["beef", "broccoli", "soy sauce"]
    ),
    makeRecipe(
      "h2",
      "Greek Chicken Bowls",
      "https://images.unsplash.com/photo-1612336307429-8f6b0181bd33?q=80&w=1600&auto=format&fit=crop",
      "30 min",
      ["chicken", "rice", "tzatziki"]
    ),
    makeRecipe(
      "h3",
      "Egg Fried Rice",
      "https://images.unsplash.com/photo-1630934155581-4d0fe7a22b88?q=80&w=1600&auto=format&fit=crop",
      "15 min",
      ["egg", "rice", "peas"]
    ),
    makeRecipe(
      "h4",
      "Turkey Chili",
      "https://images.unsplash.com/photo-1617191519400-30be84f9a0fd?q=80&w=1600&auto=format&fit=crop",
      "35 min",
      ["turkey", "beans", "tomato"]
    ),
    makeRecipe(
      "h5",
      "Cottage Cheese Pancakes",
      "https://images.unsplash.com/photo-1544025163-0b2bdde32061?q=80&w=1600&auto=format&fit=crop",
      "20 min",
      ["cottage cheese", "oats", "egg"]
    ),
  ],
};

export const categories: Category[] = [pastry, vegan, quick20, highProtein];