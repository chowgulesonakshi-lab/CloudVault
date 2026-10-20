import pytest

from app import app, db


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()

        yield app.test_client()

        db.session.remove()
        db.drop_all()


def test_health(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "UP"


def test_get_documents(client):
    response = client.get("/api/documents")

    assert response.status_code == 200
    assert response.get_json() == []