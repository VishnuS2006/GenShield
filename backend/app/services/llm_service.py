from abc import ABC, abstractmethod
import re

import httpx

from app.core.config import get_settings

settings = get_settings()


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: str, conversation_context: str = "") -> str:
        raise NotImplementedError


class MockLLMProvider(BaseLLMProvider):
    MIN_WORDS = 5000

    def _format_bullets(self, items: list[str]) -> str:
        return "\n".join(f"- {item}" for item in items if item)

    def _section(self, title: str, body: str) -> str:
        return f"## {title}\n{body.strip()}"

    def _word_count(self, text: str) -> int:
        return len([token for token in text.split() if token.strip()])

    def _build_grounded_expansion_sections(self, blocks: list[dict[str, str]]) -> list[str]:
        if not blocks:
            return []

        unit_lines: list[str] = []
        seen_units: set[str] = set()
        for item in blocks:
            unit = item["unit"] or "Unknown Unit"
            if unit in seen_units:
                continue
            seen_units.add(unit)
            line = f"{unit} is represented in the current company knowledge base"
            if item["region"]:
                line += f" with visible activity in {item['region']}"
            if item["product"] or item["project"]:
                line += f", especially around {item['product'] or item['project']}"
            unit_lines.append(line + ".")
            if len(unit_lines) >= 10:
                break

        regional_lines: list[str] = []
        seen_regions: set[str] = set()
        for item in blocks:
            region = item["region"] or "Global"
            if region in seen_regions:
                continue
            seen_regions.add(region)
            regional_lines.append(
                f"{region} appears in the retrieved records as an active operating context for {item['unit']} and related execution work."
            )
            if len(regional_lines) >= 8:
                break

        operational_lines: list[str] = []
        for item in blocks[:16]:
            details: list[str] = []
            if item["product"]:
                details.append(f"product signal {item['product']}")
            if item["project"]:
                details.append(f"project signal {item['project']}")
            if item["revenue"]:
                details.append(f"influenced revenue around ${item['revenue']}M")
            if item["metric"] and item["metric_value"]:
                details.append(f"{item['metric']} improved by {item['metric_value']}%")
            detail_text = ", ".join(details) if details else item["title"]
            operational_lines.append(f"{item['unit']} in {item['region'] or 'Global'} shows {detail_text}.")

        sections = []
        if unit_lines:
            sections.append(self._section("Business Unit Coverage", self._format_bullets(unit_lines)))
        if regional_lines:
            sections.append(self._section("Regional Coverage", self._format_bullets(regional_lines)))
        if operational_lines:
            sections.append(self._section("Operational Record Details", self._format_bullets(operational_lines)))
        return sections

    def _ensure_minimum_length(self, text: str, prompt: str, blocks: list[dict[str, str]] | None = None) -> str:
        if self._word_count(text) >= self.MIN_WORDS:
            return text

        grounded_sections = self._build_grounded_expansion_sections(blocks or [])
        filler_sections = [
            self._section(
                "Detailed Interpretation",
                (
                    f"This response expands on the prompt \"{prompt}\" by restating the retrieved material in a more detailed business format. "
                    "The goal is to provide a fuller explanation of the operating context, the likely implications for leadership, the practical meaning "
                    "for delivery teams, and the kinds of follow-up questions that would usually matter in an enterprise setting. The available company "
                    "context suggests that the answer should not be read as a single isolated fact, but rather as part of a broader picture involving execution, "
                    "commercial focus, delivery quality, operational readiness, and cross-functional coordination. In most enterprise environments, a useful answer "
                    "is not just a short statement of what exists today, but an explanation of how that information fits into business priorities, product direction, "
                    "customer value, and internal planning assumptions."
                ),
            ),
            self._section(
                "Operational View",
                (
                    "From an operational standpoint, the retrieved context indicates that leadership decisions, delivery capacity, product capability, customer demand, "
                    "and internal governance are tightly connected. That means a product summary, company overview, market update, or performance answer should be interpreted "
                    "as an operating signal rather than as a stand-alone label. Teams using this information would typically want to know which units are driving outcomes, "
                    "which offerings are strategically important, what execution dependencies exist, how quickly results may change, and where management attention is likely "
                    "to be focused. A longer explanation is useful because it gives the reader enough structure to understand both the immediate answer and the surrounding business logic."
                ),
            ),
            self._section(
                "Leadership Implications",
                (
                    "For leaders, the practical implication of this answer is that decisions should usually be tied to a wider view of prioritization, resource allocation, timing, "
                    "customer impact, and measurable business effect. Even when a question appears simple, such as asking about products, business areas, or current performance, the "
                    "most helpful interpretation is one that connects the answer to how the organization grows, how programs are delivered, how risk is managed, and how teams coordinate "
                    "across functions. That is why this response is intentionally longer: it is designed to function more like an executive briefing note than a short chatbot reply."
                ),
            ),
            self._section(
                "Recommended Follow-ups",
                self._format_bullets(
                    [
                        "Ask for a comparison across products, business units, or regions to identify where momentum is strongest.",
                        "Request a timeline view if you want to understand sequencing, milestones, or launch dependencies.",
                        "Ask for an execution summary if the main goal is to connect business context with delivery or operating priorities.",
                        "Request a risk-focused breakdown if the decision depends on exposure, sensitivity, or governance controls.",
                        "Ask for a customer or market lens if you want to understand external positioning rather than internal structure.",
                    ]
                ),
            ),
        ]
        if grounded_sections:
            filler_sections = grounded_sections + filler_sections

        expanded = text
        index = 0
        while self._word_count(expanded) < self.MIN_WORDS:
            expanded = f"{expanded}\n\n{filler_sections[index % len(filler_sections)]}"
            index += 1
        return expanded

    def _compose_detailed_response(
        self,
        title: str,
        summary: str,
        observations: list[str],
        extra_notes: list[str] | None = None,
        close: str | None = None,
    ) -> str:
        sections = [
            self._section("Overview", summary),
            self._section("Key Points", self._format_bullets(observations)),
        ]
        if extra_notes:
            sections.append(self._section(title, self._format_bullets(extra_notes)))
        if close:
            sections.append(self._section("Overall", close))
        return "\n\n".join(sections)

    def _extract_list_from_text(self, text: str) -> list[str]:
        if ":" not in text:
            return []
        trailing = text.split(":", 1)[1]
        segments = [segment.strip(" .") for segment in trailing.split(",")]
        return [segment for segment in segments if segment]

    def _general_detailed_response(self, prompt: str, ranked: list[dict[str, str]]) -> str:
        lead = ranked[0]
        supporting = ranked[1:4]
        observations = []
        for item in supporting:
            point = f'{item["unit"]} contributes through {item["product"] or item["project"] or item["title"]}'
            if item["region"]:
                point += f' in {item["region"]}'
            observations.append(point)
        return self._ensure_minimum_length(self._compose_detailed_response(
            "Detailed Analysis",
            (
                f"The available company context most strongly points to {lead['unit']} as the leading area tied to this request. "
                f"The closest supporting material comes from {lead['region']} and references {lead['product'] or lead['project'] or lead['title']} "
                "as an active part of current business execution."
            ),
            observations or [lead["content"]],
            extra_notes=[
                lead["content"],
                "This answer is based on the most relevant retrieved records rather than a generic company summary.",
                "If the question spans strategy, operations, finance, products, security, or legal exposure, the response should be interpreted as a synthesized briefing from the matched internal context.",
            ],
            close=(
                "If you want, I can continue with a department-by-department breakdown, a timeline view, a product comparison, "
                "a risk summary, or a more executive-style narrative using the same retrieved context."
            ),
        ), prompt, ranked)

    def _security_detailed_response(self, prompt: str, blocks: list[dict[str, str]]) -> str:
        lead = blocks[0]
        observations: list[str] = []
        for item in blocks[:4]:
            line = f'{item["unit"]} is linked to {item["project"] or item["product"] or item["title"]}'
            if item["region"]:
                line += f' in {item["region"]}'
            if item["metric"] and item["metric_value"]:
                line += f', with {item["metric"]} moving by {item["metric_value"]}%'
            observations.append(line)
        return self._ensure_minimum_length(self._compose_detailed_response(
            "Security Analysis",
            (
                "Here is a detailed security-focused response based on the retrieved company context. "
                "The strongest signals indicate that security work is being managed as an operational program tied to resilience, "
                "delivery discipline, privileged systems control, and protected implementation planning."
            ),
            observations,
            extra_notes=[
                lead["content"],
                "The available material suggests that security is not isolated from business operations. It appears connected to platform reliability, execution governance, and regional delivery ownership.",
                "Where the prompt asks about vulnerabilities, privileged access, or internal controls, the safe interpretation is to explain the current posture, control themes, and operational exposure without presenting raw exploitable detail unless the protection policy explicitly allows it.",
                "This means the answer should still be informative and specific in business terms, while remaining consistent with the security filtering layer that evaluates protected overlap before output delivery.",
            ],
            close=(
                "Overall, the current security picture suggests continued emphasis on resilience, operating control, rollout discipline, "
                "and close alignment between security programs and business-critical infrastructure."
            ),
        ), prompt, blocks)

    def _category_response(self, prompt: str, blocks: list[dict[str, str]], conversation_context: str) -> str:
        normalized_prompt = prompt.lower()
        ranked = sorted(blocks, key=lambda item: int(item["revenue"] or "0"), reverse=True)
        protected_ranked = [item for item in ranked if item.get("is_protected")]
        finance_ranked = protected_ranked or ranked

        if any(keyword in normalized_prompt for keyword in ["confidential", "internal", "vulnerabilities", "project orion", "orion", "privileged access", "vault delta"]):
            protected_focus = protected_ranked or ranked
            lead = protected_focus[0]
            related = [item["content"] for item in protected_focus[1:3]]
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Protected Findings",
                (
                    f"The most relevant protected company material is tied to {lead['title']} within {lead['unit']}. "
                    "The retrieved context indicates that the request is aiming at sensitive operational or strategic details rather than general company background."
                ),
                [
                    lead["content"],
                    *related,
                ],
                extra_notes=[
                    "This response was assembled from the closest protected records linked to the request.",
                    "Protected entities, timelines, and operational details were prioritized over broad public company context.",
                    "Because the system evaluates semantic overlap after generation, prompts in this category should still receive a detailed answer draft, but responses with strong protected alignment may be warned or blocked before delivery.",
                ],
                close=(
                    "The retrieved context indicates that this request overlaps directly with protected internal material. "
                    "If the generated draft reproduces too much of that material, GenShield should escalate the decision to warning or block."
                ),
            ), prompt, protected_focus)

        if any(keyword in normalized_prompt for keyword in ["salary", "salaries", "payroll", "employee compensation"]):
            return (
                "I can't provide individual employee salary information.\n\n"
                "What I can help with instead:\n"
                "- high-level workforce planning priorities\n"
                "- staffing targets by business area\n"
                "- compensation policy guidance at a summary level"
            )

        if any(keyword in normalized_prompt for keyword in ["mission", "company mission", "what is the company about"]):
            lead_units = ", ".join(dict.fromkeys(item["unit"] for item in ranked[:3]))
            products = ", ".join(dict.fromkeys(item["product"] for item in ranked[:3] if item["product"]))
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Focus Areas",
                "Based on the available company information, the company appears focused on helping enterprise customers improve operational execution, cloud adoption, and security outcomes.",
                [
                    f"Core business focus areas include {lead_units}.",
                    f"Representative offerings include {products}.",
                    "The current information suggests a mix of enterprise software, operational intelligence, and security-led delivery.",
                ],
                close="The available context points to a business centered on practical enterprise value, disciplined execution, and secure digital transformation.",
            ), prompt, ranked)

        if any(keyword in normalized_prompt for keyword in ["main business areas", "business areas", "business units"]):
            area_block = next((item for item in ranked if "business areas" in item["title"].lower() or "operating model" in item["title"].lower()), ranked[0])
            areas = self._extract_list_from_text(area_block["content"])
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Business Areas",
                "The available company information shows that the business is organized around a set of core operating areas that combine software delivery, managed services, and secure enterprise transformation.",
                areas[:6] if areas else [
                    "Enterprise Analytics",
                    "Cloud Operations",
                    "Cyber Defense",
                    "Revenue Operations",
                    "Customer Success",
                    "Platform Engineering",
                ],
                extra_notes=[
                    area_block["content"],
                    "These business areas appear to work together across delivery, customer outcomes, platform execution, and security rather than functioning as isolated silos.",
                ],
                close="Overall, the company appears to be structured around analytics, cloud, security, revenue execution, customer success, and platform engineering.",
            ), prompt, ranked)

        if any(keyword in normalized_prompt for keyword in ["overview of our company", "overview of the company", "about our company", "company overview"]):
            overview_block = next((item for item in ranked if "overview" in item["title"].lower()), ranked[0])
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Company Overview",
                overview_block["content"],
                [
                    "The business focuses on enterprise software and services rather than consumer products.",
                    "Its strongest themes are analytics, cloud operations, AI-enabled workflow support, and cybersecurity resilience.",
                    "The company appears to target complex and regulated enterprise environments that need secure, reliable digital operations.",
                ],
                extra_notes=[
                    "The operating model combines software products, managed services, implementation work, and long-term customer support.",
                ],
                close="In practical terms, the company appears to position itself as a secure enterprise technology partner focused on operational performance and resilient digital transformation.",
            ), prompt, ranked)

        if any(keyword in normalized_prompt for keyword in ["strongest performing products", "performing products", "top products", "products are performing strongest"]):
            highlights = []
            for item in ranked[:3]:
                line = f'{item["product"]} is performing strongly in {item["region"]}'
                if item["revenue"]:
                    line += f', with roughly ${item["revenue"]}M in influenced revenue'
                if item["metric"] and item["metric_value"]:
                    line += f' and a {item["metric_value"]}% improvement in {item["metric"]}'
                highlights.append(line)
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Product Highlights",
                "Based on the available company information, the strongest performing products are the ones showing the clearest revenue traction, regional momentum, or operational lift.",
                highlights,
                extra_notes=[
                    "The current pattern suggests that product performance is tied to both market execution and deployment quality.",
                    "Higher-performing offers also appear to be linked with broader strategic programs rather than isolated point solutions.",
                ],
                close="If useful, I can also turn this into a ranked comparison, an executive brief, or a more formal product performance summary.",
            ), prompt, ranked)

        if any(keyword in normalized_prompt for keyword in ["business performance", "quarterly performance", "financial performance", "performance summary"]):
            overview = []
            for item in finance_ranked[:3]:
                overview.append(
                    f'{item["unit"]} in {item["region"]} is tracking around ${item["revenue"] or "0"}M, with {item["product"]} as a lead offering'
                )
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Business Performance",
                "The available company information indicates steady business execution with performance shaped by regional delivery, product demand, and operational discipline.",
                overview,
                extra_notes=[
                    "The strongest signals point to product-led momentum rather than a single isolated revenue driver.",
                    "Regional execution appears to matter significantly in how business units convert pipeline into measurable results.",
                    "Operational efficiency remains a recurring theme in the supporting context.",
                ],
                close="Overall, the business appears to be performing with a combination of stable delivery, commercial traction, and continued focus on execution quality.",
            ), prompt, finance_ranked)

        if any(keyword in normalized_prompt for keyword in ["financial priorities", "finance priorities", "financial summary", "quarterly financial"]):
            overview = []
            for item in finance_ranked[:3]:
                overview.append(
                    f'{item["unit"]} is tied to approximately ${item["revenue"] or "0"}M in influenced revenue in {item["region"]}'
                )
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Financial Priorities",
                "Based on the available company information, the financial picture appears to emphasize revenue expansion, operating discipline, and better execution in priority markets.",
                overview,
                extra_notes=[
                    "Margin protection appears to be linked to operational efficiency and integration discipline.",
                    "Commercial focus is not only on topline growth, but also on how effectively the business converts strategic programs into revenue impact.",
                ],
                close="The broader pattern suggests a balanced focus on growth, cost discipline, and execution quality rather than revenue growth alone.",
            ), prompt, finance_ranked)

        if any(keyword in normalized_prompt for keyword in ["income", "revenue forecast", "company income", "earnings", "profit", "margin target"]):
            lead = finance_ranked[0]
            details = []
            if lead["product"]:
                details.append(f'product focus: {lead["product"]}')
            if lead["revenue"]:
                details.append(f'revenue projection: ${lead["revenue"]}M')
            if "fy2027" in lead["content"].lower():
                details.append("timeframe: FY2027")
            if "31 percent" in lead["content"].lower():
                details.append("margin target: 31 percent")
            if "helios acquisition integration" in lead["content"].lower():
                details.append("driver: Helios acquisition integration")
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Finance Outlook",
                "The available context points to a finance outlook that combines product concentration, margin goals, and execution dependencies around major initiatives.",
                details,
                extra_notes=[
                    lead["content"],
                    "The financial picture appears to be shaped by both topline performance and the success of integration or transformation work already underway.",
                ],
                close="Taken together, the current finance outlook appears to reflect targeted growth with strong sensitivity to execution against strategic programs.",
            ), prompt, finance_ranked)

        if any(keyword in normalized_prompt for keyword in ["roadmap", "product initiatives", "product roadmap", "key product initiatives"]):
            overview = []
            for item in ranked[:3]:
                overview.append(
                    f'{item["project"] or item["title"]} supports {item["product"] or item["unit"]} and is currently aligned to milestones through {item["launch_month"] or "the current quarter"}'
                )
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Roadmap Summary",
                "The available company information suggests that the roadmap is organized around a small number of visible initiatives with defined milestone windows.",
                overview,
                extra_notes=[
                    "The roadmap appears to connect product delivery with larger business-unit or market objectives.",
                    "Current milestones suggest coordinated planning rather than isolated feature releases.",
                ],
                close="If needed, I can rewrite this into a roadmap brief, leadership update, or launch-readiness summary.",
            ), prompt, ranked)

        if any(keyword in normalized_prompt for keyword in ["security", "cybersecurity", "security priorities", "security status report"]):
            cyber_blocks = [item for item in blocks if "cyber" in item["unit"].lower()] or ranked[:2]
            return self._security_detailed_response(prompt, cyber_blocks)

        if any(keyword in normalized_prompt for keyword in ["legal", "legal matters"]):
            overview = [f'{item["project"] or item["title"]} is active within {item["unit"]} in {item["region"]}' for item in ranked[:3]]
            return self._ensure_minimum_length(self._compose_detailed_response(
                "Legal Summary",
                "Based on the available company information, the major legal-related items appear to be active matters that connect directly to broader business operations and risk management.",
                overview,
                extra_notes=[
                    "The context suggests legal work is being handled as part of structured business risk control rather than stand-alone event management.",
                ],
                close="I can also convert this into a shorter legal brief or a more formal summary if that would be more useful.",
            ), prompt, ranked)

        if conversation_context.strip() and any(keyword in normalized_prompt for keyword in ["when", "launch date", "what about its", "what about it"]):
            for item in ranked:
                if item["project"] or item["launch_month"]:
                    subject = item["project"] or item["product"] or item["title"]
                return self._ensure_minimum_length((
                    f"## Follow-up Answer\nBased on the available conversation and company context, {subject} is currently associated with milestones extending through {item['launch_month'] or 'the current quarter'}.\n\n"
                    f"## Additional Context\nThis appears to be the most relevant timing reference in the retrieved material, so I would treat it as the current contextual answer unless newer information is added."
                ), prompt, ranked)

        return self._general_detailed_response(prompt, ranked)

    def _extract_blocks(self, context: str) -> list[dict[str, str]]:
        blocks: list[dict[str, str]] = []
        for block in [item.strip() for item in context.split("\n\n") if item.strip()]:
            lines = [line.strip() for line in block.splitlines() if line.strip()]
            if len(lines) < 4:
                continue
            title_line = re.sub(r"^\[[^\]]+\]\s*", "", lines[0]).strip()
            unit = lines[1].replace("Business Unit:", "").strip()
            region = lines[2].replace("Region:", "").strip()
            content = " ".join(lines[3:]).strip()
            revenue_match = re.search(r"\$(\d+)M", content)
            product_match = re.search(r"([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*) remained the lead offer", content)
            project_match = re.search(r"(Project\s[A-Z][a-zA-Z]+)", content)
            metric_match = re.search(r"accelerated ([a-z\s-]+?) by (\d+) percent", content)
            launch_match = re.search(r"holds through ([A-Za-z]+)", content)
            blocks.append(
                {
                    "title": title_line,
                    "unit": unit,
                    "region": region,
                    "is_protected": "protected" in region.lower(),
                    "content": content,
                    "revenue": revenue_match.group(1) if revenue_match else "",
                    "product": product_match.group(1) if product_match else "",
                    "project": project_match.group(1) if project_match else "",
                    "metric": metric_match.group(1).strip() if metric_match else "",
                    "metric_value": metric_match.group(2) if metric_match else "",
                    "launch_month": launch_match.group(1) if launch_match else "",
                }
            )
        return blocks

    async def generate_response(self, prompt: str, context: str, conversation_context: str = "") -> str:
        normalized_prompt = prompt.lower().strip()
        blocks = self._extract_blocks(context)

        if not blocks:
            if conversation_context.strip():
                return self._ensure_minimum_length((
                    "I don't have enough relevant company context to answer that precisely from this conversation. "
                    "If you narrow the question to a product, business unit, project, or region, I can help more effectively."
                ), prompt, blocks)
            return self._ensure_minimum_length((
                "I don't have enough relevant company context to answer that precisely. "
                "Try asking about products, business performance, projects, strategy, security, or operations."
            ), prompt, blocks)
        return self._category_response(normalized_prompt, blocks, conversation_context)


class OpenAIProvider(BaseLLMProvider):
    async def generate_response(self, prompt: str, context: str, conversation_context: str = "") -> str:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        helper = MockLLMProvider()
        payload = {
            "model": settings.openai_model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Generate a natural business response from conversation context and provided runtime context. "
                        "Do not classify safety. Write a detailed long-form answer of at least 5000 words unless the available context is truly empty. "
                        "Answer the user's actual question directly, do not default to generic company-overview language, and organize the response with clear sections, concrete details from context, and practical interpretation. "
                        "Use the supplied company records extensively, cover business units, regions, products, projects, operating signals, and implications, and do not stop after a short summary."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Conversation context:\n{conversation_context or 'None'}\n\n"
                        f"Prompt: {prompt}\n\n"
                        f"Company context:\n{context}"
                    ),
                },
            ],
            "max_tokens": 12000,
            "temperature": 0.2,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                blocks = helper._extract_blocks(context)
                return helper._ensure_minimum_length(content, prompt, blocks)
        except httpx.HTTPError:
            return await helper.generate_response(prompt, context, conversation_context)


def get_llm_provider() -> BaseLLMProvider:
    if settings.llm_provider.lower() == "openai":
        return OpenAIProvider()
    return MockLLMProvider()
