import requests
from bs4 import BeautifulSoup
import asyncio
import aiohttp
import random

USER_AGENTS = [
    "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.7538.1864 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.4105.1164 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.8119.1428 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; TG200 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.4376.1939 Mobile Safari/537.36"
]

MAX_CONCURRENCY = 3

MIN_DELAY = 1.5
MAX_DELAY = 4.0

async def fetch_page(session, url, semaphore):
    async with semaphore:
        headers = {'User-Agent': random.choice(USER_AGENTS)}
        await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as response:
                text = await response.text()
                # print(f"Fetched {url} -> {response.status}", flush=True)
                return text
        except Exception as e:
            print(f'Error fetching {url}: {e}')
            return None
        

async def get_results(URLS):
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_page(session, url, semaphore) for url in URLS]
        results = await asyncio.gather(*tasks)
    return results