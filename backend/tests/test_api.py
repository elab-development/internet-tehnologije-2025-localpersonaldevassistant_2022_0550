import pytest # type: ignore
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# AUTH TESTOVI

def test_register_user_success():
    """Test uspešne registracije korisnika."""
    payload = {
        "email": "testuser@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code in [201, 400]

def test_login_success():
    """Test uspešnog logovanja."""
    payload = {"email": "testuser@example.com", "password": "password123"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    """Test logovanja sa pogrešnom lozinkom."""
    payload = {"email": "testuser@example.com", "password": "pogresna_lozinka"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401


# CHAT TESTOVI

def test_get_all_chats_unauthorized():
    """Provera IDOR/Auth zaštite: Ne možeš dobiti četove bez tokena."""
    response = client.get("/chat/get-all")
    assert response.status_code == 401


# MESSAGES TESTOVI

def test_send_anonymous_message():
    """Test slanja poruke kao guest."""
    payload = {"content": "Zdravo, kako si?", "mode_id": 4}
    response = client.post("/messages/send-anonymous", json=payload)
    assert response.status_code == 200
    assert "content" in response.json()


# ADMIN TESTOVI

def test_admin_stats_forbidden_for_standard_user():
    """Provera bezbednosti: Običan korisnik ne sme da vidi admin statistiku."""
    login_res = client.post("/auth/login", json={"email": "testuser@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/admin/stats", headers=headers)
    assert response.status_code == 403

def test_get_modes():
    """Test dobijanja dostupnih AI modova."""
    response = client.get("/messages/modes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_delete_non_existent_chat():
    """Test brisanja četa koji ne postoji."""
    login_res = client.post("/auth/login", json={"email": "testuser@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.delete("/chat/999999", headers=headers)
    assert response.status_code == 404