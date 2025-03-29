import json
from pathlib import Path

# CACHE_FILE = Path("../data/cache.json")
CACHE_FILE = Path("/Users/nivedhakumar/Developments/CS407/TrAIlblazer/backend/data/cache.json")

def load_cache():
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}

def save_cache(data):
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_cached(key):
    return load_cache().get(key)

def set_cache(key, value):
    data = load_cache()
    data[key] = value
    save_cache(data)
