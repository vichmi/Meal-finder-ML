from src.database.db import *
import requests
from bs4 import BeautifulSoup
import re
import hashlib
from pymongo.errors import DuplicateKeyError
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
import random
import aiohttp
from src.scraping.scraper import recipe_hash
from src.ml.embed_recipes import embed_recipe

recipes = db['recipes_bg']

def get_gotvatch():
    BASE_URL = 'https://recepti.gotvach.bg/'
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/115.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    # Gettings all recipes' links
    WORKERS = 10

    def fetch_page(i: int):
        if i%100 == 0:print(f'Fetched page: {i}')
        try:
            response = requests.get(f'{BASE_URL}{i}', headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            return [a['href'] for a in soup.select('div.rprev a.title') if a.has_attr('href')]
        except Exception as e:
            print(f'Failed page {i}: {e}')
            return []
        
    def execute_workers():
        links = []

        with ThreadPoolExecutor(max_workers=WORKERS) as executor:
            futures = [executor.submit(fetch_page, i) for i in range(3964)]
            for future in as_completed(futures):
                links.extend(future.result())

        with open('gotvatchbg_recipes.txt', 'w', encoding='utf-8') as f:
            f.write('\n'.join(links))
        print(f'Done! Collected: {len(links)} links.')
        

    def get_recipe_info():
        links = []
        with open('gotvatchbg_recipes.txt', 'r', encoding='utf-8') as f:
            links = [line for line in f]
        
        CONCURRENCY = 10
        sem = asyncio.Semaphore(CONCURRENCY)

        async def fetch_and_parse(session, url):
            async with sem:
                try:
                    async with session.get(url, timeout=15) as resp:
                        html = await resp.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        title = soup.select_one('#recEntity div.combocolumn.mr h1').get_text(strip=True)
                        ingredients_raw = soup.select('#recContent section ul li')
                        ingredients = [{'name': ing.b.get_text(strip=True), 'value': ing.get_text(strip=True).replace(ing.b.get_text(strip=True), '').strip(' -')} for ing in ingredients_raw]
                        instructions = soup.select_one('#recContent div.text').get_text(strip=True)
                        area = None
                        tags = None
                        categories = [cat.get_text(strip=True) for cat in soup.select('#recEntity div.brdc a')[2::]]
                        information = [{'label': inf.div.get_text(), 'value': inf.get_text(strip=True).replace(inf.div.get_text(strip=True), '').strip()} for inf in soup.select('#recContent div.acin div.indi div')]
                        img = soup.select_one('#gall img').attrs('src') if soup.select_one('#gall img').has_attr('src') else None
                        match = re.search(r'r-(\d+)', url)
                        source_id = ''
                        if match: source_id = match.group(1)
                        else: source_id = None
                        r_hash = recipe_hash(title, ingredients)
                        return {
                            'title': title,
                            'ingredients': ingredients,
                            'instructions': instructions,
                            'area': area,
                            'tags': tags,
                            'categories': categories,
                            'information': information,
                            'img': img,
                            'source_id': source_id,
                            'recipe_hash': r_hash
                        }
                except Exception as e:
                    print(f'Error {url}: {e}')
                    return None
                finally:
                    await asyncio.sleep(random.uniform(0.5, 3))
        async def save_to_db():
            async with aiohttp.ClientSession(headers=headers) as session:
                for ulr in links:
                    result = await fetch_and_parse(session, url)
                    if result:
                        result['source'] = 'gotvatch.bg'
                        result['embedding'] = embed_recipe(result)
                        recipes.insert_one(result)
    asyncio.run(get_recipe_info())
get_gotvatch()