import numpy as np
from pymongo import MongoClient, UpdateOne
from sentence_transformers import SentenceTransformer
import torch
from numpy.linalg import norm
from ..database.db import *

recipes = db["recipes"]

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

BATCH_SIZE = 256 


def search_embedding(query, top_k = 10):
    q = query.lower().strip()
    cursor = list(recipes.find({}, {"title": 1, "embedding": 1}))
    encode_query = model.encode(q, convert_to_numpy=True)
    
    embeddings = np.array([r['embedding'] for r in cursor])
    similarities = np.dot(embeddings, encode_query) / (norm(embeddings, axis=1) * norm(encode_query))
    top_idx = np.argsort(-similarities)[:top_k]
  
    results = []
    for i in top_idx:
        results.append({
            'title': cursor[i]['title'],
            'index': cursor[i]['_id'],
            'score': float(similarities[i])
        })
    return results