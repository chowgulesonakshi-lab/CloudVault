from app import app


def test_health():
    client = app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "UP"
    assert data["service"] == "CloudVault API"


def test_get_documents():
    client = app.test_client()

    response = client.get("/api/documents")

    assert response.status_code == 200
    assert isinstance(response.get_json(), list)