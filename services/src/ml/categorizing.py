'''
--- Categories ---
Breakfast
Lunch
Dinner
Appetizer
Salad
Main-course
Side-dish
Baked-goods
Dessert
Snack
Soup

'''

from src.database.db import db

categories = {
    "Breakfast": ["закуска", "омлет", "палачинки", "тост", "овесени ядки", "кисело мляко"],
    "Lunch": ["обяд", "супа", "салата", "основно", "яхния"],
    "Dinner": ["вечеря", "печено", "пиле", "риба", "месо"],
    "Appetizer": ["предястие", "брюскета", "тапас", "хапки"],
    "Salad": ["салата", "зеленчуци", "домати", "краставици"],
    "Main-course": ["основно ястие", "пиле", "свинско", "телешко", "паста", "ориз"],
    "Side-dish": ["гарнитура", "картофи", "ориз", "зеленчуци", "разядка"],
    "Baked-goods": ["печиво", "кифли", "хляб", "пита", "кроасан", "баничка"],
    "Dessert": ["десерт", "торта", "сладкиш", "пудинг", "кейк", "бонбон"],
    "Snack": ["снак", "хапка", "чипс", "крекери", "сандвич"],
    "Soup": ["супа", "чорба", "крем супа"]
}


recipes = db['recipes_bg']

def categorize_recipe(title, ingredients, information):
    text = (title + ' ' + ' '.join([ing['name'] for ing in ingredients]) + ' '.join(information)).lower()
    scores = {cat: sum(kw in text for kw in kws) for cat,kws in categories.items()}
    best_cat = max(scores, key=scores.get)
    return best_cat if scores[best_cat] > 0 else 'Unknown'

def categorize():
    cursor = recipes.find({})
    
    