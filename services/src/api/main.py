from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Optional

# тук импортваш твоите search функции
# from src.search.bm25_search import search_bm25
# from src.search.embed_search import search_embeddings
from src.search.search_bm25 import search
from src.search.search_embeddings import search_embedding

app = FastAPI(
    title="Meal Finder API",
    description="API searcher BM25, embedding",
    version="1.0.0",
)

class Ingredient(BaseModel):
    name: str
    amount: Optional[str] = None

class RecipeOut(BaseModel):
    title: str
    score: float
    id: str
    ingredients: List[Ingredient]
    area: Optional[str] = None
    instructions: Optional[List[str]] = None
    tags: List[str] = []
    categories: List[str] = []
    diets: List[str] = []

class SearchResponse(BaseModel):
    query: str
    results: List[RecipeOut]


# ----------- Endpoints -----------

@app.get("/search/bm25", response_model=SearchResponse)
def search_bm25_api(
    query: str = Query(..., description="Търсене по ключови думи"),
    top_k: int = Query(10, description="Брой резултати"),
):
    raw_results = search(query, top_k)

    results = []
    for r in raw_results:
        results.append({
            "title": r["title"],
            "score": r["score"],
            "id": str(r.get("_id", "")),
            "ingredients": r.get("ingredients", []),
            "area": r.get("area", None),
            "instructions": r.get("instructions", None),
            "tags": r.get("tags", []),
            "categories": r.get("categories", []),
            "diets": r.get("diets", []),
        })
    return {"query": query, "results": results}


@app.get("/search/embedding", response_model=SearchResponse)
def search_embedding_api(
    query: str = Query(..., description="Търсене с embeddings"),
    top_k: int = Query(10, description="Брой резултати"),
    diet: Optional[str] = Query(None, description="Филтър по диета (vegan, vegetarian...)"),
):
    # results = search_embeddings(query, top_k=top_k, diet=diet)
    results = []  # placeholder
    return {"query": query, "results": results}
