import pytest  # type: ignore
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# HELPER FUNKCIJE

def create_test_user():
    """Kreira korisnika sa random emailom i vraća njegove podatke."""
    email = f"test_{uuid.uuid4()}@example.com"
    payload = {
        "email": email,
        "password": "password123",
        "full_name": "Test User"
    }

    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201

    return payload


def login_user(email: str, password: str):
    """Loguje korisnika i vraća token."""
    response = client.post("/auth/login", json={
        "email": email,
        "password": password
    })

    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data

    return json_data["access_token"]


# AUTH TESTOVI

def test_register_user_success():
    payload = create_test_user()
    assert payload["email"] is not None


def test_login_success():
    user = create_test_user()
    token = login_user(user["email"], user["password"])
    assert token is not None


def test_login_wrong_password():
    user = create_test_user()

    response = client.post("/auth/login", json={
        "email": user["email"],
        "password": "pogresna_lozinka"
    })

    assert response.status_code == 401


# CHAT TESTOVI

def test_get_all_chats_unauthorized():
    response = client.get("/chat/get-all")
    assert response.status_code == 401


def test_delete_non_existent_chat():
    user = create_test_user()
    token = login_user(user["email"], user["password"])

    headers = {"Authorization": f"Bearer {token}"}
    response = client.delete("/chat/999999", headers=headers)

    assert response.status_code == 404


# MESSAGES TESTOVI

def test_send_anonymous_message():
    payload = {
        "content": "Zdravo, kako si?",
        "mode_id": 4
    }

    response = client.post("/messages/send-anonymous", json=payload)

    assert response.status_code == 200
    json_data = response.json()
    assert "content" in json_data


def test_get_modes():
    response = client.get("/messages/modes")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ADMIN TESTOVI

def test_admin_stats_forbidden_for_standard_user():
    user = create_test_user()
    token = login_user(user["email"], user["password"])

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/admin/stats", headers=headers)

    assert response.status_code == 403