from functools import lru_cache

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


class EmbeddingService:
    def __init__(self) -> None:
        self._cache: dict[int, np.ndarray] = {}
        self._model = None

    def _load_model(self):
        if self._model is None and SentenceTransformer is not None:
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
        return self._model

    def _fallback_embed(self, text: str) -> np.ndarray:
        vector = np.zeros(64, dtype=float)
        for token in text.lower().split():
            vector[hash(token) % 64] += 1.0
        norm = np.linalg.norm(vector)
        return vector if norm == 0 else vector / norm

    def embed_text(self, text: str) -> np.ndarray:
        if not text.strip():
            return np.zeros(64, dtype=float)
        model = self._load_model()
        if model is None:
            return self._fallback_embed(text)
        vector = np.array(model.encode(text, normalize_embeddings=True))
        return vector

    def embed_texts(self, texts: list[str]) -> list[np.ndarray]:
        if not texts:
            return []
        model = self._load_model()
        if model is None:
            return [self._fallback_embed(text) for text in texts]
        return [np.array(item) for item in model.encode(texts, normalize_embeddings=True)]

    def similarity(self, left: str, right: str) -> float:
        left_vec = self.embed_text(left)
        right_vec = self.embed_text(right)
        if not left_vec.any() or not right_vec.any():
            return 0.0
        score = float(np.dot(left_vec, right_vec))
        return max(0.0, min(1.0, score))

    def cache_document_embedding(self, document_id: int, text: str) -> np.ndarray:
        if document_id not in self._cache:
            self._cache[document_id] = self.embed_text(text)
        return self._cache[document_id]

    def refresh_cache(self) -> None:
        self._cache.clear()


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
