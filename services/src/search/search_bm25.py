from src.database.db import *
import sys
import json
import math
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

recipes = db["recipes"]

# Implementing BM25 algorithm
def set_dictionary_queries():
    queries = {}
    global recipes
    cursor = recipes.find({})
    for recipe in cursor:
        for word in recipe.get('title').split(' '):
            if word in queries.keys(): queries[word] += 1
            else: queries[word] = 1
        for ing in recipe.get('ingredients'):
            if ing['name'] in queries.keys(): queries[ing['name']] += 1
            else: queries[ing['name']] = 1
        
    with open("./data/queries.json", "w", encoding="utf-8") as f:
        json.dump(queries, f, ensure_ascii=False, indent=2)

def tokenize_document(d):
    return [
        w.lower().strip()
        for w in d.get("title", "").split()
        + [word for ing in d.get("ingredients", []) for word in ing.get("name", "").split()]
        + (d.get("tags") or [])
    ]



def calculate_avgdl():
    global recipes
    cursor = recipes.find({})
    sum_length = 0
    for recipe in cursor:
        sum_length += len(recipe.get("title", "").split() + [word for ing in recipe.get("ingredients", []) for word in ing.get("name", "").split()] + recipe.get("tags", []))
    # count_documents = cursor.count()
    return sum_length / recipes.count_documents({})


avgdl = calculate_avgdl()

def term_frequency(t, doc_counter, doc_length, avgdl, k=1.2, b=0.75):
    f = doc_counter[t]
    if f == 0: return 0

    return (f * (k + 1)) / (f + k * (1 - b + b * (doc_length / avgdl)))

query_load = None
with open("./data/queries.json", 'r', encoding='utf-8') as f:
    query_load = json.load(f)

number_of_documents = recipes.count_documents({})
def inverse_document_frequency(t):
    nt = query_load.get(t, 0)
    return math.log( (number_of_documents - nt + 0.5)/(nt + 0.5) )

def search(query: str, top_k: int) -> list[dict]:
    queries = query.split(' ')
    global recipes
    cursor = list(recipes.find({}))

    scores = []

    for recipe in cursor:
        tokens = tokenize_document(recipe)
        doc_counter = Counter([w.lower().strip() for w in tokens])
        doc_length = len(tokens)
        score = 0
        for q in queries:
            tf = term_frequency(q, doc_counter, doc_length, avgdl)
            idf = inverse_document_frequency(q)
            score += tf * idf
        scores.append({
            "id": str(recipe["_id"]), 
            'ingredients': recipe['ingredients'],
            'area': recipe['area'],
            'instructions': recipe['instructions'],
            'tags': recipe['tags'],
            'title': recipe['title'],
            'categories': recipe['categories'],
            'diets': recipe['diets'],
            'score': float(score),
            'img': str(recipe.get('img', "")or '')
        })
    results = sorted(scores, key=lambda x: x['score'], reverse=True)
    return results[:top_k]
