from app.services.embedding_service import get_embedding_service


def test_similarity_ordering():
    service = get_embedding_service()
    related = service.similarity("Project Orion launches in October 2026", "Orion will launch in October 2026")
    unrelated = service.similarity("Project Orion launches in October 2026", "The weather is sunny today")
    assert related >= unrelated
