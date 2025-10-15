import recipeBook from '../assets/recipebook.png'

export default function CreateRecipeButton() {
    return (
        <div>
            <button
                onClick={() => (window.location.href = '/createRecipe')}
                aria-label="Create Recipe"
                className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-[1000] sm:bottom-8 sm:right-8 sm:left-auto sm:translate-x-0 rounded-full sm:rounded-lg sm:w-auto sm:h-auto px-4 py-2 bg-[var(--primary)] text-white border-none shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer flex items-center justify-center gap-2"
            >   
                <img src={recipeBook} alt="Create" className="w-6 h-6 sm:w-10 sm:h-10 object-contain" />
            </button>
        </div>
    )
}
