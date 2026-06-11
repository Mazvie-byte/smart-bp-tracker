"""
Shared test fixtures for the Blood Pressure Assistant backend tests.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app, readings_db
from backend.models import BloodPressureReading
from datetime import datetime


@pytest.fixture(autouse=True)
def clear_readings_db():
    """Clear the in-memory readings database before each test."""
    readings_db.clear()
    yield
    readings_db.clear()


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_reading():
    """A single normal blood pressure reading."""
    return BloodPressureReading(
        systolic=118,
        diastolic=76,
        heart_rate=72,
        timestamp=datetime.now(),
        tags=[]
    )


@pytest.fixture
def normal_readings():
    """A set of readings in the normal range."""
    return [
        BloodPressureReading(systolic=115, diastolic=75, heart_rate=70, tags=[]),
        BloodPressureReading(systolic=118, diastolic=76, heart_rate=72, tags=[]),
        BloodPressureReading(systolic=112, diastolic=74, heart_rate=68, tags=[]),
        BloodPressureReading(systolic=116, diastolic=77, heart_rate=71, tags=[]),
        BloodPressureReading(systolic=114, diastolic=73, heart_rate=69, tags=[]),
    ]


@pytest.fixture
def hypertension_readings():
    """A set of readings in the hypertension range."""
    return [
        BloodPressureReading(systolic=145, diastolic=92, heart_rate=85, tags=["Stressed"]),
        BloodPressureReading(systolic=150, diastolic=95, heart_rate=88, tags=["Stressed"]),
        BloodPressureReading(systolic=142, diastolic=90, heart_rate=82, tags=["High Salt"]),
        BloodPressureReading(systolic=148, diastolic=93, heart_rate=86, tags=["Stressed"]),
        BloodPressureReading(systolic=155, diastolic=98, heart_rate=90, tags=["Caffeine"]),
    ]


@pytest.fixture
def rising_trend_readings():
    """Readings that show a rising trend (recent readings higher than older ones)."""
    return [
        BloodPressureReading(systolic=110, diastolic=70, heart_rate=68, tags=[]),
        BloodPressureReading(systolic=112, diastolic=72, heart_rate=70, tags=[]),
        BloodPressureReading(systolic=115, diastolic=74, heart_rate=72, tags=[]),
        # Recent readings are significantly higher
        BloodPressureReading(systolic=135, diastolic=85, heart_rate=80, tags=[]),
        BloodPressureReading(systolic=138, diastolic=88, heart_rate=82, tags=[]),
        BloodPressureReading(systolic=140, diastolic=90, heart_rate=84, tags=[]),
    ]


@pytest.fixture
def reading_payload():
    """Raw JSON payload for posting a reading."""
    return {
        "systolic": 120,
        "diastolic": 80,
        "heart_rate": 75,
        "tags": ["Meds Taken"]
    }
