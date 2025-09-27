import json
import re
import hashlib
from pymongo import MongoClient, UpdateOne
from src.database.db import *
recipes = db["recipes"]

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

def normalize_and_update_all():
    global recipes
    cursor = recipes.find({})
    print(cursor)
    
    result = recipes.update_many(
        {},               # всички документи
        {"$unset": {"category": ""}}
    )
    for recipe in cursor:
        updates = {}

        updates["title"] = recipe.get("title", "").lower().strip()
        
        if recipe.get('area'):
            updates['area'] = recipe['area'].lower().strip()
        
        updates["categories"] = [cat.lower().strip() for cat in recipe.get("categories") or []]
        if recipe.get('category'):
            updates["categories"].append(recipe['category'].lower().strip())
            updates["categories"] = list(set(updates["categories"]))

        updates["tags"] = [tag.lower().strip() for tag in recipe.get("tags") or []]

        normalized_ingredients = []
        for ing in recipe.get("ingredients", []):
            amount = (ing.get("amount") or "").strip().lower()
            name = (ing.get("name") or "").strip().lower()
            normalized_ingredients.append({
                "amount": amount,
                "name": name
            })
        updates["ingredients"] = normalized_ingredients

        instr = recipe.get("instructions", "")
        if isinstance(instr, str):
            steps = [s.strip().lower() for s in instr.splitlines() if s.strip()]
        elif isinstance(instr, list):
            steps = [s.strip().lower() for s in instr if isinstance(s, str) and s.strip()]
        else:
            steps = []
        updates["instructions"] = steps

        recipes.update_one(
            {"_id": recipe["_id"]},
            {"$set": updates}
        )

    print("✅ All recipes normalized and updated!")

def add_diets():
    diets_prohibited = None
    with open('diets_prohibited.json', 'r', encoding='utf-8') as f:
        diets_prohibited = json.load(f)

    def check_diets(ingredients: list[str]) -> list[str]:
        applicable_diets = []
        global diets_prohibited
        for diet, banned_list in diets_prohibited.items():
            is_ok = True
            for ing in ingredients:
                ing = ing.lower().strip()
                if any(banned in ing for banned in banned_list):
                    is_ok = False
                    break
            if is_ok:
                applicable_diets.append(diet)
        return applicable_diets

    def add_diets():
        global recipes
        bulk_ops = []
        cursor = recipes.find({})
        for recipe in cursor:
            ingredients = [ing['name'] for ing in recipe.get('ingredients', [])]
            diets = check_diets(ingredients)
            bulk_ops.append(
                UpdateOne(
                    {"_id": recipe["_id"]},
                    {"$set": {"diets":diets}}
                )
            )
        if bulk_ops:
            result = recipes.bulk_write(bulk_ops)


def allrecipes_links_file():
    pattern = re.compile(r"https?://[^/]+\.com/article(/|$)")
    clean_links = []
    with open('allrecipes_links.txt', "r", encoding='utf-8') as f:
        for line in f:
            url = line.strip()
            if not url: continue
            if not pattern.search(url):
                clean_links.append(url)

    with open('clean_links.txt', 'w', encoding='utf-8') as f:
        for link in clean_links:
            f.write(link+'\n')
    print('done!')