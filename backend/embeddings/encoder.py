from functools import lru_cache
from django.conf import settings
from sentence_transformers import SentenceTransformer

@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(settings.EMBEDDING_MODEL)

def embed_texts(texts):
    """Return a list of float lists."""
    model = get_model()
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True).tolist()

def embed_query(text):
    return embed_texts([text])[0]

def embedding_dim() -> int:
    return get_model().get_sentence_embedding_dimension()