from src.database.db import *
import requests
from bs4 import BeautifulSoup
import asyncio
from src.scraping.scraper import get_results
from src.scraping.scraper_en import recipe_hash
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/115.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}
recipes = db['recipes_bg']


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




if __name__ == '__main__':
    asyncio.run(get_supichka())

