from sentence_transformers import SentenceTransformer
from pymongo import MongoClient, UpdateOne
from ..src.database.db import *
recipes = db["recipes"]

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

BATCH_SIZE = 256 

def build_recipe_text(recipe):
    parts = []
    if recipe.get("title"):
        parts.append(recipe["title"])
    if recipe.get("area"):
        parts.append(recipe["area"])
    parts.extend(recipe.get("categories", []))
    parts.extend(recipe.get("tags", []))
    parts.extend(recipe.get("diets", []))
    parts.extend([ing.get("name", "") for ing in recipe.get("ingredients", [])])
    text = " ".join([str(p).lower().strip() for p in parts if p])
    print(text)
    return text

def embed_recipe(recipe):
    texts = build_recipe_text(recipe)
    embeddings = model.encode(texts, batch_size=32, convert_to_numpy=True)
    return embeddings

def embed_and_update():
    skip = 0
    total = recipes.count_documents({})
    print(f"Total recipes: {total}")

    while skip < total:
        cursor = list(recipes.find({}).skip(skip).limit(BATCH_SIZE))

        texts = [build_recipe_text(r) for r in cursor]
        embeddings = model.encode(texts, batch_size=32, convert_to_numpy=True)

        bulk_ops = []
        for r, emb in zip(cursor, embeddings):
            bulk_ops.append(
                UpdateOne({"_id": r["_id"]}, {"$set": {"embedding": emb.tolist()}})
            )

        if bulk_ops:
            recipes.bulk_write(bulk_ops)
            print(f"Updated {skip}–{skip+len(bulk_ops)}")

        skip += BATCH_SIZE

if __name__ == "__main__":
    embed_and_update()
