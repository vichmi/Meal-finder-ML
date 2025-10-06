import requests
from bs4 import BeautifulSoup
import json
from src.database.db import db
import asyncio
from src.scraping.scraper import get_results

lidl_products = db['lidl_products']
recipes_db = db['recipes_bg']
# BASE_URL = 'https://www.lidl.bg/c/khrani-i-napitki/s10068374'

def scrape():
    # URL = 'https://www.lidl.bg/q/api/search?fetchsize=1000&locale=bg_BG&assortment=BG&version=2.1.0&category.id=10068374'
    # response = requests.get(URL)
    # response.raise_for_status()
    # data = response.json()
    # not_included_items = data['numFound'] - data['fetchsize']
    # print(not_included_items)
    # print(data['numFound'])
    # print(data['fetchsize'])
    # response = requests.get(f'https://www.lidl.bg/q/api/search?fetchsize={not_included_items}&locale=bg_BG&assortment=BG&version=2.1.0&category.id=10068374&offset={data['fetchsize']}')
    # data = data['items']
    # data.extend(response.json()['items'])

    # with open('lidl_products.json', 'w', encoding='utf-8') as f:
    #     json.dump(data, f, ensure_ascii=False, indent=2)

    data = []
    with open('lidl_products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(len(data))
    for product in data:
        gridbox = product.get("gridbox", {}).get("data", {})
        lidl_plus_list = gridbox.get('lidlPlus', [])
        lidl_plus_price = None
        if isinstance(lidl_plus_list, list) and len(lidl_plus_list) > 0:
            lidl_plus_price = lidl_plus_list[0].get('price').get('price')
        price = (
            lidl_plus_price
            or gridbox.get("price", {}).get("price")
            or gridbox.get("basicPrice", {}).get("price")
            or "N/A"
        )
        # print(f'{product['label']} with code {product['code']} is {price}')
        lidl_products.insert_one({
            'name': product['label'],
            'code': product['code'],
            'price': price,
            'img': product['gridbox']['data']['image']
        })
# scrape()


    # BASE_URL = 'https://recipes-core-api.recipes.lidl/api/v1/search/recipes/teasers'
    # HEADERS = {
    #     'Accept-Language': 'bg-BG',
    #     'Origin': 'https://gotvi.lidl.bg',
    #     'Referer': 'https://gotvi.lidl.bg/',
    #     'Host': 'recipes-core-api.recipes.lidl',
    #     'Sec-Fetch-Site': 'cross-site',
    #     'Sec-Fetch-Mode': 'cors',
    #     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    # }
    # data = []
    # for i in range(1, 123):
    #     res = requests.get(f'{BASE_URL}?page={i}', headers=HEADERS)
    #     data.extend(res.json()['recipes'])
    # print(len(data))
    # if len(data) == 1220:
    #     with open('lidl-recipes.json', 'w', encoding='utf-8') as f:
    #         json.dump(data, f, ensure_ascii=False, indent=2)

async def get_recipes():
    data = []
    with open('lidl-recipes.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    links = [f"https://gotvi.lidl.bg/recipes/{r.get('slug', '')}" for r in data if r.get('slug')]

    results = await get_results(links)
    recipes = []

    for html in results:
        soup = BeautifulSoup(html, 'html.parser')

        title_tag = soup.select_one('h1')
        title = title_tag.get_text(strip=True) if title_tag else ""

        difficulty_div = soup.find("div", {"data-testid": "recipe-info-badge-difficulty"})
        difficulty = difficulty_div.find_all("span")[-1].get_text(strip=True) if difficulty_div and difficulty_div.find_all("span") else ""

        prep_div = soup.find("div", {"data-testid": "recipe-info-badge-preparation"})
        prep_time = prep_div.find_all("span")[-1].get_text(strip=True) if prep_div and prep_div.find_all("span") else ""

        cook_div = soup.find("div", {"data-testid": "recipe-info-badge-cooking"})
        cook_time = cook_div.find_all("span")[-1].get_text(strip=True) if cook_div and cook_div.find_all("span") else ""

        information = {
            "difficulty": difficulty.lower() if difficulty else "",
            "prep_time": prep_time.replace(" ", "") if prep_time else "",
            "cook_time": cook_time.replace(" ", "") if cook_time else "",
        }

        source = 'lidl'
        tag = soup.find('div', attrs={'data-testid': 'chefs-avatars'})
        author = tag.get_text(strip=True) if tag else ""

        img_tag = soup.find('img', attrs={'data-nimg': '1'})
        img = 'https://gotvi.lidl.bg' + img_tag.get('src') if img_tag and img_tag.get('src') else ""

        portions_tag = soup.find('input', attrs={'data-testid': 'servings-group-input'})
        portions = portions_tag.get('value') if portions_tag else ""

        ingredients = []
        for li in soup.find_all("li", attrs={"data-name": True}):
            name = li.get("data-name", "")

            qty_from = li.find("span", {"data-testid": "quantity-from"})
            qty_to = li.find("span", {"data-testid": "quantity-to"})
            unit = li.find("span", {"data-testid": "unit"})

            qty_from_text = qty_from.get_text(strip=True) if qty_from else ""
            qty_to_text = qty_to.get_text(strip=True) if qty_to else ""
            unit_text = unit.get_text(strip=True) if unit else ""

            if qty_from_text and qty_to_text:
                amount = f"{qty_from_text}-{qty_to_text} {unit_text}".strip()
            elif qty_from_text:
                amount = f"{qty_from_text} {unit_text}".strip()
            else:
                amount = unit_text.strip()

            ingredients.append({
                "name": name,
                "amount": amount
            })

        instructions_tag = soup.find('ol', attrs={'data-rid': 'cooking-step'})
        instructions = instructions_tag.get_text(strip=True) if instructions_tag else ""

        recipe = {
            'title': title,
            'information': information,
            'source': source,
            'author': author,
            'portions': portions,
            'ingredients': ingredients,
            'instructions': instructions,
            'img': img
        }
        recipes.append(recipe)

    recipes_db.insert_many(recipes)

if __name__ == '__main__':
    asyncio.run(get_recipes())
