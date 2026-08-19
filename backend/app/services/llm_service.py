from abc import ABC, abstractmethod

import httpx

from app.core.config import get_settings

settings = get_settings()


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: str) -> str:
        raise NotImplementedError


class MockLLMProvider(BaseLLMProvider):
    async def generate_response(self, prompt: str, context: str) -> str:
        if not context.strip():
            return f"Summary for request: {prompt.strip()}"
        first_lines = [line.strip("- ").strip() for line in context.splitlines() if line.strip()][:4]
        return " ".join(first_lines)


class OpenAIProvider(BaseLLMProvider):
    async def generate_response(self, prompt: str, context: str) -> str:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        payload = {
            "model": settings.openai_model,
            "messages": [
                {
                    "role": "system",
                    "content": "Generate a concise business response from provided runtime context. Do not classify safety.",
                },
                {"role": "user", "content": f"Prompt: {prompt}\nContext:\n{context}"},
            ],
            "temperature": 0.2,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()


def get_llm_provider() -> BaseLLMProvider:
    if settings.llm_provider.lower() == "openai":
        return OpenAIProvider()
    return MockLLMProvider()
