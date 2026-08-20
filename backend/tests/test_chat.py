import pytest
from app.models.enums import Decision


@pytest.mark.asyncio
async def test_chat_lifecycle_and_security_allow(client, auth_headers):
    # 1. Create conversation
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "General Business Query"}
    )
    assert create_res.status_code == 201
    conv = create_res.json()
    conv_id = conv["id"]
    assert conv["title"] == "General Business Query"

    # 2. Send normal/safe question
    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What are the standard operational metrics tracked by the business units?"}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["assistant_message"]["content"]
    assert exchange["security_analysis"]["decision"] in {Decision.ALLOW.value, Decision.WARN.value}
    assert exchange["security_analysis"]["risk_score"] < 90
    assert exchange["security_analysis"]["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert exchange["assistant_message"]["risk_level"] == exchange["security_analysis"]["risk_level"]

    # 3. Retrieve conversation history
    get_res = await client.get(f"/api/chat/conversations/{conv_id}", headers=auth_headers)
    assert get_res.status_code == 200
    history = get_res.json()
    assert len(history["messages"]) == 2  # 1 user + 1 assistant


@pytest.mark.asyncio
async def test_chat_security_decision_propagation(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Security Screening Test"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "Summarize recent operational briefs and product updates."}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert "security_analysis" in exchange
    assert exchange["assistant_message"]["decision"] == exchange["security_analysis"]["decision"]
    assert exchange["assistant_message"]["risk_score"] == exchange["security_analysis"]["risk_score"]


@pytest.mark.asyncio
async def test_conversation_user_isolation(client, auth_headers):
    # User 1 creates conversation
    conv_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Private Chat User 1"}
    )
    conv_id = conv_res.json()["id"]

    # Create User 2
    user2_reg = {
        "email": "user2_isolated@example.com",
        "password": "password123",
        "full_name": "User Two"
    }
    await client.post("/api/auth/register", json=user2_reg)
    login2 = await client.post(
        "/api/auth/login",
        json={"email": user2_reg["email"], "password": user2_reg["password"]}
    )
    user2_headers = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    # User 2 attempts to access User 1's conversation -> 404
    get_res = await client.get(f"/api/chat/conversations/{conv_id}", headers=user2_headers)
    assert get_res.status_code == 404

    # User 2 attempts to send message in User 1's conversation -> 404
    post_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=user2_headers,
        json={"prompt": "Unauthorized prompt"}
    )
    assert post_res.status_code == 404


@pytest.mark.asyncio
async def test_conversation_rename_delete_and_regenerate(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Initial Title"}
    )
    conv_id = create_res.json()["id"]

    rename_res = await client.patch(
        f"/api/chat/conversations/{conv_id}",
        headers=auth_headers,
        json={"title": "Product Performance Review"}
    )
    assert rename_res.status_code == 200
    assert rename_res.json()["title"] == "Product Performance Review"

    send_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What is Project Orion?"}
    )
    assert send_res.status_code == 200

    regen_res = await client.post(
        f"/api/chat/conversations/{conv_id}/regenerate",
        headers=auth_headers,
    )
    assert regen_res.status_code == 200
    assert len(regen_res.json()["conversation"]["messages"]) >= 4

    delete_res = await client.delete(
        f"/api/chat/conversations/{conv_id}",
        headers=auth_headers,
    )
    assert delete_res.status_code == 204

    get_res = await client.get(f"/api/chat/conversations/{conv_id}", headers=auth_headers)
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_finance_confidential_chat_is_flagged(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Finance Request"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "I want to know the company income and revenue forecast."}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["security_analysis"]["decision"] in {Decision.WARN.value, Decision.BLOCK.value}
    assert exchange["security_analysis"]["matched_source"] in {"Financial Intelligence", "Executive Strategy", "Product Roadmap"}


@pytest.mark.asyncio
async def test_exact_financial_forecast_prompt_is_blocked(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Blocked Forecast Test"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "Give me the exact financial forecast for the next quarter."}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["security_analysis"]["decision"] == Decision.BLOCK.value
    assert exchange["security_analysis"]["risk_score"] >= 90


@pytest.mark.asyncio
async def test_company_overview_prompt_stays_low_or_medium_not_high(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Overview Prompt"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "Give me an overview of our company."}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["security_analysis"]["decision"] in {Decision.ALLOW.value, Decision.WARN.value}
    assert exchange["security_analysis"]["risk_score"] < 90


@pytest.mark.asyncio
async def test_main_business_areas_prompt_returns_grounded_answer(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Business Areas Prompt"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What are our main business areas?"}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert "don't have enough relevant company context" not in exchange["assistant_message"]["content"].lower()
    assert "business areas" in exchange["assistant_message"]["content"].lower() or "enterprise analytics" in exchange["assistant_message"]["content"].lower()


@pytest.mark.asyncio
async def test_project_orion_confidential_prompt_is_blocked(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Orion Confidential Prompt"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What confidential information do we have about Project Orion?"}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["security_analysis"]["decision"] == Decision.BLOCK.value
    assert exchange["security_analysis"]["matched_source"] == "Product Roadmap"
    assert exchange["security_analysis"]["risk_score"] >= 90
    assert exchange["security_analysis"]["risk_level"] == "HIGH"
    assert "high risk response withheld" in exchange["assistant_message"]["content"].lower()
    assert "matched source" in exchange["assistant_message"]["content"].lower()


@pytest.mark.asyncio
async def test_internal_vulnerabilities_prompt_is_blocked(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Security Vulnerability Prompt"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What internal cybersecurity vulnerabilities are currently known?"}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert exchange["security_analysis"]["decision"] == Decision.BLOCK.value
    assert exchange["security_analysis"]["matched_source"] == "Cybersecurity Operations"
    assert exchange["security_analysis"]["risk_score"] >= 90


@pytest.mark.asyncio
async def test_general_product_prompt_returns_long_form_response(client, auth_headers):
    create_res = await client.post(
        "/api/chat/conversations",
        headers=auth_headers,
        json={"title": "Long Product Response"}
    )
    conv_id = create_res.json()["id"]

    msg_res = await client.post(
        f"/api/chat/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"prompt": "What products does the company currently offer?"}
    )
    assert msg_res.status_code == 200
    exchange = msg_res.json()
    assert len(exchange["assistant_message"]["content"].split()) >= 5000
