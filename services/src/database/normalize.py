import json
import re
import hashlib
from pymongo import MongoClient, UpdateOne
from src.database.db import *
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.cluster import KMeans
import numpy as np

recipes = db["recipes_bg"]

def recipe_hash(title: str, ingredients: list[dict]) -> str:
    normalized_title = title.lower().strip() if title else ""

    norm_ings = sorted([
        ing["name"].lower().strip()
        for ing in ingredients
        if ing.get("name")
    ])

    key = normalized_title + "|" + "|".join(norm_ings)
    return hashlib.sha256(key.encode()).hexdigest()

def push_to_database(recipe: dict, collection):
    try:

        recipe['title'] = recipe.get('title', '').strip().lower()
        recipe['area'] = recipe.get('area', '').strip().lower()
        recipe['categories'] = [cat.strip().lower() for cat in recipe.get('categories', [])]
        recipe['tags'] = [tag.strip().lower() for tag in recipe.get('tags', [])]
        for ing in recipe.get('ingredients', []):
            ing['amount'] = ing.get('amount', '').strip().lower()
            ing['name'] = ing.get('name', '').strip().lower()
        if isinstance(recipe.get('instructions'), str):
            recipe['instructions'] = [step.strip().lower() for step in recipe['instructions'].splitlines() if step.strip()]
        elif isinstance(recipe.get('instructions'), list):
            recipe['instructions'] = [step.strip().lower() for step in recipe['instructions'] if isinstance(step, str) and step.strip()]
        recipe['information'] = [info.strip().lower() for info in recipe.get('information', [])]
        recipe['img'] = recipe.get('img', '')
        recipe['source'] = recipe.get('source', '').strip()
        recipe['source_id'] = recipe.get('source_id', '').strip()
        recipe['recipe_hash'] = recipe_hash(recipe['title'], recipe.get('ingredients', []))
        
        # Determing categories, tags, diets and embedding !!!! 

        db[collection].insert_one(recipe)
    except Exception as e:
        print(f"Error inserting recipe: {e}")

def parse_time_to_minutes(time_str: str) -> int | None:
    if not time_str:
        return None
    time_str = time_str.lower()
    minutes = 0
    hr_match = re.search(r'(\d+)\s*hr', time_str)
    min_match = re.search(r'(\d+)\s*min', time_str)
    if hr_match:
        minutes += int(hr_match.group(1)) * 60
    if min_match:
        minutes += int(min_match.group(1))
    return minutes if minutes > 0 else None

def remove_duplicates(collection):
    recipes = db[collection]
    seen = set()
    duplicate_removed = 0

    for doc in recipes.find().sort("_id", 1):
        value = doc.get('recipe_hash')
        if value in seen:
            recipes.delete_one({"_id": doc["_id"]})
            duplicate_removed += 1
        else:
            seen.add(value)
    print(f'Removed {duplicate_removed}')
