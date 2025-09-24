"""
Polite async web scraper with:
- automatic free-proxy scraping + validation
- proxy rotation
- user-agent rotation
- concurrency limits + random delays
- exponential backoff on 429 / server errors
"""

import asyncio
import aiohttp
import async_timeout
import random
import time
from typing import List, Optional, Tuple, Set
from urllib.parse import urlparse
from aiohttp_socks import ProxyConnector  # optional: remove if you don't want SOCKS support
from tqdm import tqdm

# -------- CONFIG --------
PROXY_SOURCES = [
    "https://www.free-proxy-list.net/",
    "https://www.sslproxies.org/",
    "https://www.us-proxy.org/",
    # You can add raw lists or APIs as text files that return ip:port per line
]

TEST_URL = "https://httpbin.org/ip"      # lightweight endpoint to validate proxies
SCRAPE_TIMEOUT = 10                      # timeout for requests (seconds)
PROXY_VALIDATION_CONCURRENCY = 50
PROXY_VALIDATION_TIMEOUT = 8
MAX_SCRAPER_CONCURRENCY = 3              # how many pages to fetch concurrently
MIN_DELAY = 1.0                          # min random delay between requests (s)
MAX_DELAY = 4.0                          # max random delay between requests (s)
MAX_RETRIES = 4
BACKOFF_BASE = 2.0                       # exponential backoff base
WORKING_PROXY_FILE = "working_proxies.txt"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # add more real UA strings if you want
]
# -------------------------

# --- Helpers to fetch proxy-lists from HTML pages (naive) ---
# We'll parse ip:port strings out of page text via regex.
import re
PROXY_REGEX = re.compile(r"(\d{1,3}(?:\.\d{1,3}){3}:\d{2,5})")

async def fetch_text(session: aiohttp.ClientSession, url: str, timeout: int = 10) -> Optional[str]:
    try:
        async with async_timeout.timeout(timeout):
            async with session.get(url, headers={"User-Agent": random.choice(USER_AGENTS)}) as r:
                if r.status == 200:
                    return await r.text()
    except Exception:
        return None
    return None

async def gather_proxy_candidates() -> List[str]:
    """
    Naively fetch pages listed in PROXY_SOURCES and extract ip:port occurrences.
    You can add more sources or direct text raw lists.
    """
    candidates: Set[str] = set()
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_text(session, u, timeout=8) for u in PROXY_SOURCES]
        pages = await asyncio.gather(*tasks)
        for page in pages:
            if not page:
                continue
            for m in PROXY_REGEX.findall(page):
                candidates.add(m.strip())
    return sorted(list(candidates))

# --- Proxy validation ---
async def validate_proxy(proxy: str, timeout: float = PROXY_VALIDATION_TIMEOUT) -> Optional[Tuple[str, float]]:
    """
    Returns (proxy, rtt) if working, else None.
    Uses http(S) proxy format: http://ip:port
    For SOCKS proxies you'd need to detect and adapt the connector (not automated here).
    """
    # try both http and https proxy forms
    for scheme in ("http://", "https://"):
        full_proxy = scheme + proxy
        start = time.time()
        try:
            connector = None
            # For SOCKS proxies you'd use ProxyConnector.from_url or ProxyConnector(socks5...)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with async_timeout.timeout(timeout):
                    async with session.get(TEST_URL, proxy=full_proxy, headers={"User-Agent": random.choice(USER_AGENTS)}) as resp:
                        if resp.status == 200:
                            _ = await resp.text()
                            return proxy, time.time() - start
        except Exception:
            continue
    return None

async def validate_proxies_list(candidate_proxies: List[str]) -> List[str]:
    valid: List[Tuple[str, float]] = []
    sem = asyncio.Semaphore(PROXY_VALIDATION_CONCURRENCY)

    async def worker(p):
        async with sem:
            res = await validate_proxy(p)
            return res

    tasks = [worker(p) for p in candidate_proxies]
    for coro in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Validating proxies"):
        r = await coro
        if r:
            valid.append(r)
    # sort by RTT ascending
    valid_sorted = sorted(valid, key=lambda x: x[1])
    return [p for p, _ in valid_sorted]

# --- Polite scraping with proxies ---
class Scraper:
    def __init__(self, urls: List[str], proxies: Optional[List[str]] = None):
        self.urls = urls
        self.proxies = proxies or []
        self.semaphore = asyncio.Semaphore(MAX_SCRAPER_CONCURRENCY)
        self.session = None  # will be created per-request (proxy specific) to avoid connection reuse problems across proxies

    def pick_proxy(self) -> Optional[str]:
        if not self.proxies:
            return None
        return random.choice(self.proxies)

    async def fetch_with_proxy(self, url: str, proxy: Optional[str]) -> Tuple[int, Optional[str]]:
        """
        Returns (status_code, text or None)
        """
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        proxy_url = None
        if proxy:
            # use http proxy form by default
            if proxy.startswith("http://") or proxy.startswith("https://"):
                proxy_url = proxy
            else:
                proxy_url = "http://" + proxy  # default
        try:
            async with async_timeout.timeout(SCRAPE_TIMEOUT):
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers, proxy=proxy_url) as resp:
                        text = await resp.text()
                        return resp.status, text
        except Exception as e:
            return 0, None

    async def polite_fetch(self, url: str) -> Optional[str]:
        """
        Implements retries, backoff, random delay, proxy rotation.
        """
        attempt = 0
        while attempt <= MAX_RETRIES:
            attempt += 1
            proxy = self.pick_proxy()
            # random delay BEFORE request to look human
            await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

            status, text = await self.fetch_with_proxy(url, proxy)
            if status == 200 and text:
                return text
            # handle 429 or 5xx with backoff and possibly switch proxy
            if status == 429 or (500 <= status < 600) or status == 0:
                backoff = (BACKOFF_BASE ** attempt) + random.random()
                await asyncio.sleep(backoff)
                # optionally remove proxy from pool if it's causing repeated failures
                if proxy and random.random() < 0.3:
                    # probabilistic removal to avoid over-pruning
                    try:
                        self.proxies.remove(proxy)
                    except ValueError:
                        pass
                continue
            # other statuses - give up after attempts
        return None

    async def run(self):
        results = {}
        tasks = []
        for u in self.urls:
            tasks.append(self._task(u))
        for t in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Scraping"):
            u, content = await t
            results[u] = content
        return results

    async def _task(self, url):
        async with self.semaphore:
            content = await self.polite_fetch(url)
            return url, content

# --- High-level orchestrator ---
async def main_flow(urls_to_scrape: List[str]):
    print("[*] Gathering proxy candidates...")
    candidates = await gather_proxy_candidates()
    print(f"[*] Found {len(candidates)} proxy candidates (raw). Validating top ones...")

    # quick dedupe & keep first N to validate (avoid overloading sources)
    candidates = candidates[:500]

    valid_proxies = await validate_proxies_list(candidates)
    print(f"[*] Valid proxies: {len(valid_proxies)}")

    # save working proxies
    with open(WORKING_PROXY_FILE, "w") as f:
        for p in valid_proxies:
            f.write(p + "\n")

    print(f"[*] Saved working proxies to {WORKING_PROXY_FILE}")

    # create scraper with validated proxies
    scraper = Scraper(urls=urls_to_scrape, proxies=valid_proxies)
    results = await scraper.run()

    # Example: do something with results
    for url, content in results.items():
        if content:
            print(f"[OK] {url} -> {len(content)} bytes")
        else:
            print(f"[FAIL] {url}")

    return results

# --- Example usage ---
if __name__ == "__main__":
    # Example target URLs (replace with real targets)
    TARGET_URLS = [
        "https://httpbin.org/get",
        "https://example.com/",
        # add your list here
    ]

    asyncio.run(main_flow(TARGET_URLS))
