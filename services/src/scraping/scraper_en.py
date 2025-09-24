from src.database.db import *
import requests
from bs4 import BeautifulSoup
import re
import hashlib
from pymongo.errors import DuplicateKeyError

recipes = db['recipes']
recipes_bg = db['recipes_bg']

def recipe_hash(title: str, ingredients: list[dict]) -> str:
    normalized_title = title.lower().strip() if title else ""

    norm_ings = sorted([
        ing["name"].lower().strip()
        for ing in ingredients
        if ing.get("name")
    ])

    key = normalized_title + "|" + "|".join(norm_ings)
    return hashlib.sha256(key.encode()).hexdigest()

# TheMealDB.com
def get_data_from_TheMealDB():

    BASE_URL = "https://www.themealdb.com/api/json/v1/1/search.php?f="

    def normalize_meal(meal: dict) -> dict:
        ingredients = []
        for i in range(1, 21):
            ing = meal.get(f"strIngredient{i}")
            meas = meal.get(f"strMeasure{i}")
            if ing and ing.strip():
                ingredients.append({"name": ing.strip(), "amount": meas.strip() if meas else None})

        return {
            "source": "themealdb",
            "source_id": meal["idMeal"],
            "title": meal["strMeal"],
            "category": meal.get("strCategory"),
            "area": meal.get("strArea"),
            "instructions": meal.get("strInstructions"),
            "ingredients": ingredients,
            "tags": meal["strTags"].split(",") if meal.get("strTags") else [],
            "img": meal['strMealThumb']
        }

    for i in range(97, 123):
        letter = chr(i)
        url = BASE_URL+letter
        response = requests.get(url)
        data = response.json()
        if data['meals']:
            for meal in data['meals']:
                clean_meal = normalize_meal(meal)
                recipes.update_one(
                    {"source": "themealdb", "source_id": clean_meal["source_id"]},
                    {"$set": clean_meal},
                    upsert=True
                )

def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def split_ingredient(ingredient: str) -> dict:
    clean_ingredient = clean_text(ingredient)
    match = re.match(r"^([\d/¼½¾.\s\-]+[a-zA-Z]*)\s+(.*)$", clean_ingredient)
    if match:
        amount = match.group(1).strip()
        name = match.group(2).strip()
    else:
        amount = None
        name = ingredient

    return {"amount": amount, "name": name}

def get_data_from_All_Recipes():
    BASE_URL = 'https://www.allrecipes.com/recipes-a-z-6735880'
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/115.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    def get_links():
        response = requests.get(BASE_URL, headers=headers)
        links = []
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            for a in soup.find_all("a", class_="mntl-link-list__link"):
                title = a.get_text(strip=True)
                url = a['href']
                res = requests.get(url, headers=headers)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for container in soup.find_all('div', class_='tax-sc__recirc-list'):
                        for a_tags in container.find_all('a', href=True):
                            links.append(a_tags['href'])
                            print(a_tags['href'])
        else:
            print(response.status_code)
        f = open("allrecipes_links.txt", "w")
        f.write("\n".join(links))
        f.close()

    def extract_id(url: str) -> str | None:
        matching = re.search(r"/recipe/(\d+)/", url)
        if matching:
            return matching.group(1)

        matching = re.search(r"-recipe-(\d+)", url)
        if matching:
            return matching.group(1)

        return None

    def get_recipes():
        with open("clean_links.txt", "r") as f:
            links = f.read().splitlines()
            index = 0
            for url in links:
                index += 1
                if index <= 217: continue
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    # title = soup.find("h1", class_='article-heading').text.strip()
                    # ingredients = [split_ingredient(x.text.strip()) for x in soup.find_all('li', class_='mm-recipes-structured-ingredients__list-item')]
                    # if soup.find('div', class_='mm-recipes-steps__content') is None: continue
                    # instructions = soup.find('div', class_='mm-recipes-steps__content').text.strip()
                    try:
                        source = 'allrecipes'
                        source_id = extract_id(url)
                        img = soup.find('img', class_='primary-image__image')
                        img_source = ''
                        if img is None:
                            img = soup.select_one('#photo-dialog__item_1-0 > figure > div > img')
                            if 'data-src' in img.attrs:
                                img_source = img.attrs['data-src']
                        
                        if 'src' in img.attrs:
                            img_source = img.attrs['src']
                        # tags = [clean_text(x.text) for x in soup.find_all('li', class_='mntl-breadcrumbs__item')]
                        # if 'Recipes' in tags:
                        #     tags.remove('Recipes')
                        # informations = []
                        # info_getter = soup.find_all('div', class_='mm-recipes-details__item')
                        # if info_getter:
                        #     for info in info_getter:
                        #         informations.append({
                        #             'label': clean_text(info.find('div', class_='mm-recipes-details__label').text),
                        #             'value': clean_text(info.find('div', class_='mm-recipes-details__value').text)
                        #         }) 
                        print(f"{index}. {img_source}")
                        recipes.update_one(
                            {"source": source, "source_id": source_id},
                            {"$set": {
                                "img": img_source
                            }},
                            upsert=True
                        )
                    except:
                        print(f'Error url: {url}')        
                else: print('SOMETHING WENT TOTATLLY WRONG')
            print('everything extracted')
    get_recipes()
# get_data_from_All_Recipes()