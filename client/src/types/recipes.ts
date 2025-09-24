export type Recipe = {
    id: string;
    title: string;
    img: string;
    prepTime: string;
    ingredients: string[];
    tags?: string[];
};


export type Category = {
    id: string;
    title: string;
    recipes: Recipe[];
};