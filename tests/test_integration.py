"""
INTEGRATION TESTS for the Blood Pressure Assistant API.

Tests API endpoints and the interaction between components via HTTP.
"""
import pytest
from fastapi.testclient import TestClient


# ──────────────────────────────────────────────
# Root Endpoint
# ──────────────────────────────────────────────

class TestRootEndpoint:
    """Test the API root endpoint."""

    def test_root_returns_message(self, client):
        """Test that GET / returns the welcome message."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["message"] == "Blood Pressure Assistant API is running"


# ──────────────────────────────────────────────
# Readings Endpoints
# ──────────────────────────────────────────────

class TestReadingsEndpoints:
    """Integration tests for the /readings endpoints."""

    def test_post_reading_success(self, client, reading_payload):
        """Test that POST /readings creates a new reading."""
        response = client.post("/readings", json=reading_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["systolic"] == 120
        assert data["diastolic"] == 80
        assert data["heart_rate"] == 75

    def test_post_reading_returns_timestamp(self, client, reading_payload):
        """Test that a posted reading gets a timestamp."""
        response = client.post("/readings", json=reading_payload)
        assert "timestamp" in response.json()

    def test_post_reading_with_tags(self, client):
        """Test posting a reading with lifestyle tags."""
        payload = {"systolic": 130, "diastolic": 85, "heart_rate": 78, "tags": ["Stressed", "Caffeine"]}
        response = client.post("/readings", json=payload)
        assert response.status_code == 200
        assert response.json()["tags"] == ["Stressed", "Caffeine"]

    def test_post_reading_invalid_data(self, client):
        """Test that invalid data returns 422."""
        response = client.post("/readings", json={"systolic": "not_a_number"})
        assert response.status_code == 422

    def test_get_readings_empty(self, client):
        """Test GET /readings returns empty list when no data."""
        response = client.get("/readings")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_readings_after_post(self, client, reading_payload):
        """Test GET /readings returns readings that were posted."""
        client.post("/readings", json=reading_payload)
        response = client.get("/readings")
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_multiple_readings_accumulate(self, client):
        """Test that multiple POST calls accumulate readings."""
        for sys_val in [115, 120, 125]:
            client.post("/readings", json={"systolic": sys_val, "diastolic": 80, "heart_rate": 72})
        response = client.get("/readings")
        assert len(response.json()) == 3


# ──────────────────────────────────────────────
# Analysis Endpoint
# ──────────────────────────────────────────────

class TestAnalysisEndpoint:
    """Integration tests for the /analysis endpoint."""

    def test_analysis_no_data_returns_404(self, client):
        """Test that GET /analysis with no readings returns 404."""
        response = client.get("/analysis")
        assert response.status_code == 404

    def test_analysis_with_data(self, client):
        """Test that GET /analysis returns valid analysis after adding readings."""
        client.post("/readings", json={"systolic": 120, "diastolic": 80, "heart_rate": 72})
        response = client.get("/analysis")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "trend" in data
        assert "recommendation" in data
        assert "average_systolic" in data
        assert "average_diastolic" in data

    def test_analysis_reflects_readings(self, client):
        """Test that analysis averages match the posted readings."""
        client.post("/readings", json={"systolic": 120, "diastolic": 80, "heart_rate": 72})
        client.post("/readings", json={"systolic": 130, "diastolic": 90, "heart_rate": 78})
        response = client.get("/analysis")
        data = response.json()
        assert data["average_systolic"] == 125.0
        assert data["average_diastolic"] == 85.0


# ──────────────────────────────────────────────
# Habits Endpoint
# ──────────────────────────────────────────────

class TestHabitsEndpoint:
    """Integration tests for the /habits endpoint."""

    def test_habits_without_data(self, client):
        """Test GET /habits with no readings still returns habits."""
        response = client.get("/habits")
        assert response.status_code == 200
        habits = response.json()
        assert len(habits) >= 1  # At least hydration

    def test_habits_with_normal_data(self, client):
        """Test that normal readings produce appropriate habits."""
        for _ in range(5):
            client.post("/readings", json={"systolic": 115, "diastolic": 75, "heart_rate": 70})
        response = client.get("/habits")
        habits = response.json()
        titles = [h["title"] for h in habits]
        assert "Hydration" in titles

    def test_habits_with_hypertension_data(self, client):
        """Test that hypertension readings produce diet/sodium habits."""
        for _ in range(3):
            client.post("/readings", json={"systolic": 150, "diastolic": 95, "heart_rate": 88})
        response = client.get("/habits")
        habits = response.json()
        titles = [h["title"] for h in habits]
        assert "DASH Diet" in titles
        assert "Sodium Reduction" in titles


# ──────────────────────────────────────────────
# Chat Endpoint
# ──────────────────────────────────────────────

class TestChatEndpoint:
    """Integration tests for the /chat endpoint."""

    def test_chat_diet_question(self, client):
        """Test that diet-related questions get diet advice."""
        response = client.post("/chat", json={"message": "What should I eat?"})
        assert response.status_code == 200
        assert "DASH" in response.json()["response"]

    def test_chat_exercise_question(self, client):
        """Test that exercise questions get exercise advice."""
        response = client.post("/chat", json={"message": "What exercise should I do?"})
        assert response.status_code == 200
        assert "150 minutes" in response.json()["response"]

    def test_chat_generic_question(self, client):
        """Test that unrecognized questions get a helpful response."""
        response = client.post("/chat", json={"message": "Hello there"})
        assert response.status_code == 200
        assert len(response.json()["response"]) > 0

    def test_chat_trend_with_data(self, client):
        """Test trend question when data is available."""
        for _ in range(5):
            client.post("/readings", json={"systolic": 118, "diastolic": 76, "heart_rate": 72})
        response = client.post("/chat", json={"message": "What is my trend?"})
        assert response.status_code == 200
        data = response.json()
        assert "Stable" in data["response"] or "trend" in data["response"].lower()

    def test_chat_empty_message_still_works(self, client):
        """Test that an empty message returns a response without crashing."""
        response = client.post("/chat", json={"message": ""})
        assert response.status_code == 200
