
export type Ingredient = {
    name: string;
    amount: string;
}

export type Recipe = {
    id?: string;
    title: string;
    img?: string;
    ingredients: Ingredient[];
    tags?: string[];
    information: string[];
    _id: string;
    imgs?: string[];
};


export type Category = {
    id: string;
    title: string;
    recipes: Recipe[];
};