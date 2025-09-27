import React from 'react'
import recipeBook from '../assets/recipebook.png'

export default function CreateRecipeButton() {
    return (
        <button
            className="fixed bottom-8 right-8 rounded-full w-16 h-16 bg-blue-700 text-white border-none shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer z-[1000] flex items-center justify-center"
            aria-label="Create Recipe"
            onClick={() => {
            window.location.href = '/createRecipe'
            }}
        >
            <img src={recipeBook} />
        </button>
    )
}
