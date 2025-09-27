from src.database.db import *
import requests
from bs4 import BeautifulSoup
import asyncio
from src.scraping.scraper import get_results
from src.database.normalize import recipe_hash
import sys
import re
import io
from src.database.normalize import push_to_database
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/115.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}
recipes = db['recipes_bg']


async def get_gotvatch():
    links = []
    with open('gotvatchbg_recipes.txt', 'r', encoding='utf-8') as f:
        for line in f:
            links.append(line.strip())

    load_links = await get_results(links)
    # load_links = await get_results(['https://recepti.gotvach.bg/r-284496-Индийска_каша_от_киноа_и_леща'])
    for html in load_links:
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # title
            title_el = soup.find('h1')
            title = title_el.get_text(strip=True) if title_el else "No title"
            
            # ingredients
            ingredients = []
            for ing in soup.select('#prodList > div'):
                text = ing.get_text()
                parts = text.split(' - ')
                ingredients.append({
                    'name': parts[0].strip(),
                    'amount': parts[1].strip() if len(parts) > 1 else ''
                })
            
            # instructions
            instructions = []
            h2 = soup.find("h2", string="Начин на приготвяне")
            if h2:
                for sib in h2.find_all_next("p"):
                    txt = sib.get_text(strip=True)
                    if txt:
                        instructions.append(txt)
            
            # information
            information = [i.get_text() for i in soup.select('.indi > div')]       

            # images
            img_el = soup.select_one('#gall > img')
            imgs = ['https://recepti.gotvach.bg' + img_el['src']] if img_el and img_el.has_attr('src') else []
            
            recipe = {
                'title': title,
                'ingredients': ingredients,
                'instructions': instructions,
                'information': information,
                'imgs': imgs,
                'recipe_hash': recipe_hash(title, ingredients),
                'embedding': [],
                'source': 'gotvatch.bg',
                'source_id': '',
                'area': '',
                'categories': [],
                'tags': []
            }
            push_to_database(recipe, 'recipes_bg')
        except Exception as e:
            print(f'Failed! error: {e}')
            return


async def get_supichka():
    links = []
    MAIN_URL = 'https://www.supichka.com'
    # BASE_URLS = [f'https://www.supichka.com/лесни-рецепти/{i}/тиквички' for i in range(1, 104)]
    # base_results = await get_results(BASE_URLS)
    with open('supichka_pages.txt', 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            links.append(line.strip())
    # for base_html, url in zip(base_results, BASE_URLS):
    #     if not base_html:
    #         print(f'Failed to fetch base URL: {url}')
    #         continue
    #     soup = BeautifulSoup(base_html, 'html.parser')
    #     number_of_pages = soup.select('.button.small.nobg.primary')
    #     if len(number_of_pages) > 1:
    #         number_of_pages = number_of_pages[-2].get_text(strip=True)
    #     else: 
    #         number_of_pages = 1
    #     links.extend([f'{url}/{i}' for i in range(1, int(number_of_pages)+1)])
     
    results = await get_results(links)
    for res in results:
        soup = BeautifulSoup(res, 'html.parser')
        recipe_links = [MAIN_URL+a['href'] for a in soup.select('a.block__element.entry__photo__bg') if a.has_attr('href')]
        results_recipes = await get_results(recipe_links)
        for recipe in results_recipes:
            soup2 = BeautifulSoup(recipe, 'html.parser')
            title = soup2.select_one('h1.page__title.text__uppercase.text__center').get_text(strip=True)
            print(title)
            info = [i.get_text(strip=True) for i in soup2.select('.siderecipe__data li')[1:-1]]
            ingredients_name = [i.get_text(strip=True) for i in soup2.select('.ingredient')]
            ingredients_value = [i.get_text(strip=True) or '' for i in soup2.select('.quantity')]
            ingredients = []
            for name, value in zip(ingredients_name, ingredients_value):
                val = value if value else ''
                ingredients.append({'name': name, 'amount': val})
            instructions = [i.get_text() for i in soup2.select('.description__text ol li')]
            categories = soup.select('.page-breadcrumb *')[1::]
            categories = [c.get_text(strip=True) for c in categories]
            
            img = MAIN_URL+soup2.select_one('.item img').attrs['src'] if soup2.select_one('.item img') and soup2.select_one('.item img').has_attr('src') else None
            
            recipes.insert_one({
                'title': title,
                'ingredients': ingredients,
                'instructions': instructions,
                'area': None,
                'tags': None,
                'categories': categories,
                'information': info,
                'img': img,
                'source_id': None,
                'recipe_hash': recipe_hash(title, ingredients),
                'source': 'supichka.com',
                'embedding': None
            })


async def get_matekitchen():
    # BASE_URLS = [f'https://matekitchen.com/recipes/page/{i}' for i in range(1, 73)]
    links = []
    # base_results = await get_results(BASE_URLS)

    # for res in base_results:
    #     if not res:
    #         print(f'Failed to fetch')
    #         continue
    #     soup = BeautifulSoup(res, 'html.parser')
    #     links.extend(link['href'] for link in soup.select('article > a') if link.has_attr('href'))
    
    with open('matekitchen.txt', 'r', encoding='utf-8') as f:
        links = [l.strip() for l in f.readlines()]
    loading_recipes = await get_results(links)
    for idx, link in enumerate(loading_recipes):
        soup = BeautifulSoup(link, 'html.parser')
        title = soup.select_one('.recipe-title').get_text(strip=True)
        ingredients_name = [i.get_text(strip=True) for i in soup.select('.recipe-ingredient')]
        ingredients = [{'name': ing.split('-')[0], 'amount': ing.split('-')[1] if len(ing.split('-')) > 1 else ''} for ing in ingredients_name]
        information = [i.get_text(strip=True) for i in soup.select('ul.recipe-items-list > li')]
        instructions = [i.get_text(strip=True) for i in soup.select('.recipe-step')]
        imgs = soup.select('div#recipe-images > div.recipe-images > span > img')
        img_links = []
        for img in imgs:
            if img.has_attr('data-lazy-srcset'):
                img_links.append(re.findall(r"https?://\S+?\.jpg", img['data-lazy-srcset'])[0])
        print(img_links)
        recipe = {
            'title': title,
            'area': '',
            'categories': [],
            'ingredients': ingredients,
            'information': information,
            'instructions': instructions,
            'recipe_hash': recipe_hash(title, ingredients),
            'source': 'matekitchen',
            'imgs': img_links
        }
        push_to_database(recipe, 'recipes_bg')

if __name__ == '__main__':
    asyncio.run(get_gotvatch())