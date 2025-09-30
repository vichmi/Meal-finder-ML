from deep_translator import GoogleTranslator
from src.database.db import db
import asyncio
import time 

recipes_bg = db['recipes_bg']
recipes_en= db['recipes']

translator = GoogleTranslator(source='en', target='bg')

BATCH_SIZE = 200
CONCURRENCY = 10
SLEEP_BETWEEN = 2

async def translate_text(text: str) -> str:
    try:
        return await asyncio.to_thread(translator.translate, text)
    except:
        return text
    

async def process_recipe(recipe):
    title = await translate_text(recipe.get('title', ''))
    ingredients = [{'name': await translate_text(ing['name']), 'amount': await translate_text(ing['amount'])} for ing in recipe['ingredients']]
    categories = [await translate_text(cat) for cat in recipe['categories']]
    diets = [await translate_text(diet) for diet in recipe['diets']]
    instructions = [await translate_text(instr) for instr in recipe['instructions']]
    tags = [await translate_text(tag) for tag in recipe['tags']]
    information = []
    categories.extend(tags)
    img = recipe.get('img') or (recipe.get('imgs') or [''])[0]
    if 'information' in recipe:
        information = [{'label': info['label'], 'value': info['value']} for info in recipe['information']]

    recipes_bg.insert_one({
        'title': title,
        'ingredients': ingredients,
        'information': information,
        'diets': diets,
        'instructions': instructions,
        'categories': categories,
        'img': img,
        'source': recipe['source']
    })
    
async def process_batch(batch):
    sem = asyncio.Semaphore(CONCURRENCY)
    async def sem_task(recipe):
        async with sem:
            await process_recipe(recipe)
    await asyncio.gather(*(sem_task(r) for r in batch))
    
async def main():
    cursor = recipes_en.find()
    batch = []
    for idx, recipe in enumerate(cursor):
        if idx <= 528: continue
        batch.append(recipe)
        if len(batch) == BATCH_SIZE:
            print(f'Processing batch of {BATCH_SIZE} recipes..')
            await process_batch(batch)
            batch = []
            time.sleep(SLEEP_BETWEEN)
    if batch:
        print(f'Processing last batch {len(batch)} recipes')
        await process_batch(batch)

if __name__ == "__main__":
    asyncio.run(main())