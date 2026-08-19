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
