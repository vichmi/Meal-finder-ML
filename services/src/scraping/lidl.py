import requests
from src.database.db import db

lidl_products = db['lidl_products']
recipes_db = db['recipes_bg']

def scrape():
    URL = 'https://www.lidl.bg/q/api/search?fetchsize=1000&locale=bg_BG&assortment=BG&version=2.1.0&category.id=10068374'
    response = requests.get(URL)
    response.raise_for_status()
    res_data = response.json()
    data = res_data['items']
    not_included_items = res_data['numFound'] - res_data['fetchsize']
    new_offset = res_data['fetchsize']
    while not_included_items != 0:
        response = requests.get(f'https://www.lidl.bg/q/api/search?fetchsize={not_included_items}&locale=bg_BG&assortment=BG&version=2.1.0&category.id=10068374&offset={new_offset}')
        res_data = response.json()
        new_offset = res_data['fetchsize'] + res_data['offset']
        not_included_items = res_data['numFound'] - new_offset
        data.extend(response.json()['items'])
    print(f'New lidl products updated. Number of products added: {len(data)}')
    if len(data) > 0:
        lidl_products.delete_many({})
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
            lidl_products.insert_one({
                'name': product['label'],
                'code': product['code'],
                'price': price,
                'img': product['gridbox']['data']['image']
            })
scrape()