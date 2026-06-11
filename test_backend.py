import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ai_engine import analyze_readings
from backend.models import BloodPressureReading

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Blood Pressure Assistant API is running"}

def test_ai_engine_normal_bp():
    readings = [
        BloodPressureReading(systolic=115, diastolic=75, heart_rate=70),
        BloodPressureReading(systolic=118, diastolic=78, heart_rate=72)
    ]
    result = analyze_readings(readings)
    assert result.status == "Normal"
    assert result.average_systolic == 116.5
    assert result.average_diastolic == 76.5

def test_ai_engine_stage1_hypertension():
    readings = [
        BloodPressureReading(systolic=135, diastolic=85, heart_rate=80),
        BloodPressureReading(systolic=132, diastolic=82, heart_rate=78)
    ]
    result = analyze_readings(readings)
    assert result.status == "Stage 1 Hypertension"

def test_ai_engine_stage2_hypertension():
    readings = [
        BloodPressureReading(systolic=145, diastolic=95, heart_rate=85),
        BloodPressureReading(systolic=142, diastolic=92, heart_rate=82)
    ]
    result = analyze_readings(readings)
    assert result.status == "Stage 2 Hypertension"

def test_ai_engine_trend_rising():
    readings = [
        BloodPressureReading(systolic=120, diastolic=80, heart_rate=70),
        BloodPressureReading(systolic=122, diastolic=82, heart_rate=72),
        BloodPressureReading(systolic=135, diastolic=85, heart_rate=80),
        BloodPressureReading(systolic=138, diastolic=88, heart_rate=82),
        BloodPressureReading(systolic=140, diastolic=90, heart_rate=85)
    ]
    result = analyze_readings(readings)
    assert result.trend == "Rising"

def test_api_add_reading():
    reading_data = {
        "systolic": 120,
        "diastolic": 80,
        "heart_rate": 72,
        "tags": ["Test"]
    }
    response = client.post("/readings?username=testuser", json=reading_data)
    assert response.status_code == 200
    assert response.json()["systolic"] == 120
    assert response.json()["diastolic"] == 80

def test_api_get_analysis_no_data():
    response = client.get("/analysis?username=emptyuser")
    assert response.status_code == 404

def test_register_and_login():
    # Register
    reg_response = client.post("/register", json={"username": "testuser_auth", "password": "password123"})
    if reg_response.status_code != 409: # Might already exist from previous test runs
        assert reg_response.status_code == 200
    
    # Login
    log_response = client.post("/login", json={"username": "testuser_auth", "password": "password123"})
    assert log_response.status_code == 200
    assert log_response.json()["username"] == "testuser_auth"
