from src.database.db import db

recipes = db['recipes_bg']

def categorize():
    cursor = recipes.find({})
    