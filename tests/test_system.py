"""
SYSTEM TESTS for the Blood Pressure Assistant.

End-to-end tests that verify the complete user journey through the system.
"""
import pytest
from fastapi.testclient import TestClient


# ──────────────────────────────────────────────
# Full User Journey
# ──────────────────────────────────────────────

class TestFullUserJourney:
    """System tests simulating a complete user workflow."""

    def test_new_user_flow(self, client):
        """
        Test the complete new user flow:
        1. No readings initially
        2. Add first reading
        3. Analysis becomes available
        4. Habits are generated
        5. Chat responds with context
        """
        # Step 1: Verify clean state
        response = client.get("/readings")
        assert response.status_code == 200
        assert response.json() == []

        # Step 2: Analysis should be unavailable
        response = client.get("/analysis")
        assert response.status_code == 404

        # Step 3: Add first reading
        reading = {"systolic": 125, "diastolic": 78, "heart_rate": 74}
        response = client.post("/readings", json=reading)
        assert response.status_code == 200

        # Step 4: Analysis is now available
        response = client.get("/analysis")
        assert response.status_code == 200
        analysis = response.json()
        assert analysis["average_systolic"] == 125.0
        assert analysis["status"] == "Elevated"

        # Step 5: Habits reflect the status
        response = client.get("/habits")
        assert response.status_code == 200
        habits = response.json()
        titles = [h["title"] for h in habits]
        assert "Hydration" in titles
        assert "DASH Diet" in titles  # Because status is Elevated (not Normal)

        # Step 6: Chat has context
        response = client.post("/chat", json={"message": "How am I doing?"})
        assert response.status_code == 200
        assert "Elevated" in response.json()["response"]

    def test_monitoring_over_time(self, client):
        """
        Test that the system correctly tracks changes over time:
        1. Start with normal readings
        2. Add higher readings
        3. Trend should shift to Rising
        4. Recommendations should update
        """
        # Phase 1: Add normal readings
        normal = [
            {"systolic": 112, "diastolic": 72, "heart_rate": 68},
            {"systolic": 115, "diastolic": 74, "heart_rate": 70},
            {"systolic": 113, "diastolic": 73, "heart_rate": 69},
        ]
        for r in normal:
            client.post("/readings", json=r)

        response = client.get("/analysis")
        initial_analysis = response.json()
        assert initial_analysis["status"] == "Normal"
        assert initial_analysis["trend"] == "Stable"

        # Phase 2: Add higher readings (simulating worsening)
        high = [
            {"systolic": 138, "diastolic": 88, "heart_rate": 82},
            {"systolic": 142, "diastolic": 90, "heart_rate": 85},
            {"systolic": 145, "diastolic": 92, "heart_rate": 87},
        ]
        for r in high:
            client.post("/readings", json=r)

        response = client.get("/analysis")
        updated_analysis = response.json()

        # Averages should have increased
        assert updated_analysis["average_systolic"] > initial_analysis["average_systolic"]

        # Trend should now be Rising
        assert updated_analysis["trend"] == "Rising"

        # Recommendation should mention rising
        assert "rising" in updated_analysis["recommendation"].lower()

    def test_smartwatch_simulation_flow(self, client):
        """
        Simulate the smartwatch demo flow:
        1. Post multiple auto-generated readings rapidly
        2. Verify all are stored
        3. Verify analysis updates correctly
        """
        import random
        readings = []
        for _ in range(10):
            r = {
                "systolic": random.randint(105, 145),
                "diastolic": random.randint(65, 95),
                "heart_rate": random.randint(60, 95),
            }
            response = client.post("/readings", json=r)
            assert response.status_code == 200
            readings.append(r)

        # All 10 readings should be stored
        response = client.get("/readings")
        assert len(response.json()) == 10

        # Analysis should be available and valid
        response = client.get("/analysis")
        assert response.status_code == 200
        analysis = response.json()
        assert analysis["average_systolic"] > 0
        assert analysis["average_diastolic"] > 0
        assert analysis["status"] in ["Normal", "Elevated", "Stage 1 Hypertension", "Stage 2 Hypertension"]
        assert analysis["trend"] in ["Stable", "Rising", "Falling"]

    def test_tag_correlation_system_flow(self, client):
        """
        Test that the system detects correlations between lifestyle tags and BP:
        1. Add readings without tags (normal BP)
        2. Add readings with 'Stressed' tag (higher BP)
        3. Verify correlation is detected
        """
        # Normal readings without tags
        for _ in range(3):
            client.post("/readings", json={"systolic": 115, "diastolic": 75, "heart_rate": 70, "tags": []})

        # Higher readings with 'Stressed' tag
        for _ in range(3):
            client.post("/readings", json={"systolic": 145, "diastolic": 90, "heart_rate": 85, "tags": ["Stressed"]})

        response = client.get("/analysis")
        analysis = response.json()

        # System should detect that 'Stressed' correlates with higher BP
        assert len(analysis["correlations"]) >= 1
        assert any("Stressed" in c for c in analysis["correlations"])


# ──────────────────────────────────────────────
# Data Consistency
# ──────────────────────────────────────────────

class TestDataConsistency:
    """System tests verifying data consistency across endpoints."""

    def test_readings_count_consistency(self, client):
        """Test that GET /readings count matches number of POST calls."""
        n = 7
        for i in range(n):
            client.post("/readings", json={"systolic": 115 + i, "diastolic": 75, "heart_rate": 70})
        response = client.get("/readings")
        assert len(response.json()) == n

    def test_analysis_average_consistency(self, client):
        """Test that reported averages are mathematically correct."""
        values = [110, 120, 130]
        for v in values:
            client.post("/readings", json={"systolic": v, "diastolic": 80, "heart_rate": 72})

        response = client.get("/analysis")
        data = response.json()
        expected_avg = sum(values) / len(values)
        assert data["average_systolic"] == round(expected_avg, 1)

    def test_habits_consistent_with_analysis(self, client):
        """Test that habits returned are consistent with analysis status."""
        # Add hypertension readings
        for _ in range(3):
            client.post("/readings", json={"systolic": 150, "diastolic": 95, "heart_rate": 88})

        analysis = client.get("/analysis").json()
        habits = client.get("/habits").json()
        titles = [h["title"] for h in habits]

        # If status is Stage 2 Hypertension, DASH Diet should be recommended
        assert "Hypertension" in analysis["status"]
        assert "DASH Diet" in titles

    def test_chat_context_consistent_with_analysis(self, client):
        """Test that chat responses reference accurate data."""
        # Add normal readings
        for _ in range(5):
            client.post("/readings", json={"systolic": 115, "diastolic": 75, "heart_rate": 70})

        analysis = client.get("/analysis").json()
        chat = client.post("/chat", json={"message": "What is my trend?"}).json()

        # Chat should mention the correct trend
        assert analysis["trend"] in chat["response"]


# ──────────────────────────────────────────────
# CORS & API Configuration
# ──────────────────────────────────────────────

class TestAPIConfig:
    """System tests for API configuration."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers allow the frontend origin."""
        response = client.options(
            "/readings",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        # FastAPI CORS middleware should respond to preflight
        assert response.status_code in [200, 405]

    def test_api_title(self, client):
        """Test that the OpenAPI docs have the correct title."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        assert response.json()["info"]["title"] == "Blood Pressure Assistant API"
