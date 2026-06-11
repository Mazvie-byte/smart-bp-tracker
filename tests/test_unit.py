"""
UNIT TESTS for the Blood Pressure Assistant.

Tests individual functions and models in isolation.
"""
import pytest
import numpy as np
from backend.models import BloodPressureReading, AnalysisResult, HabitSuggestion, ChatRequest
from backend.ai_engine import analyze_readings, generate_habits


# ──────────────────────────────────────────────
# Model Validation Tests
# ──────────────────────────────────────────────

class TestModels:
    """Unit tests for Pydantic model validation."""

    def test_blood_pressure_reading_valid(self):
        """Test creating a valid reading."""
        reading = BloodPressureReading(systolic=120, diastolic=80, heart_rate=72)
        assert reading.systolic == 120
        assert reading.diastolic == 80
        assert reading.heart_rate == 72
        assert reading.tags == []
        assert reading.notes is None

    def test_blood_pressure_reading_with_tags(self):
        """Test creating a reading with lifestyle tags."""
        reading = BloodPressureReading(
            systolic=130, diastolic=85, heart_rate=78,
            tags=["Stressed", "Caffeine"]
        )
        assert len(reading.tags) == 2
        assert "Stressed" in reading.tags

    def test_blood_pressure_reading_with_notes(self):
        """Test creating a reading with optional notes."""
        reading = BloodPressureReading(
            systolic=115, diastolic=75, heart_rate=68,
            notes="Taken after morning walk"
        )
        assert reading.notes == "Taken after morning walk"

    def test_blood_pressure_reading_has_timestamp(self):
        """Test that a reading gets a default timestamp."""
        reading = BloodPressureReading(systolic=120, diastolic=80, heart_rate=72)
        assert reading.timestamp is not None

    def test_blood_pressure_reading_invalid_type(self):
        """Test that invalid types raise validation errors."""
        with pytest.raises(Exception):
            BloodPressureReading(systolic="high", diastolic=80, heart_rate=72)

    def test_analysis_result_model(self):
        """Test creating a valid AnalysisResult."""
        result = AnalysisResult(
            average_systolic=120.5,
            average_diastolic=80.2,
            status="Normal",
            trend="Stable",
            recommendation="Keep up the good work!"
        )
        assert result.status == "Normal"
        assert result.correlations == []

    def test_habit_suggestion_model(self):
        """Test creating a valid HabitSuggestion."""
        habit = HabitSuggestion(
            title="Hydration",
            description="Drink 8 glasses of water",
            difficulty="Easy"
        )
        assert habit.difficulty == "Easy"

    def test_chat_request_model(self):
        """Test creating a valid ChatRequest."""
        req = ChatRequest(message="How is my trend?")
        assert req.message == "How is my trend?"


# ──────────────────────────────────────────────
# AI Engine: analyze_readings() Tests
# ──────────────────────────────────────────────

class TestAnalyzeReadings:
    """Unit tests for the analyze_readings function."""

    def test_empty_readings_returns_unknown(self):
        """Test that empty readings list returns Unknown status."""
        result = analyze_readings([])
        assert result.status == "Unknown"
        assert result.trend == "Insufficient Data"
        assert result.average_systolic == 0

    def test_normal_readings_status(self, normal_readings):
        """Test that normal readings produce 'Normal' status."""
        result = analyze_readings(normal_readings)
        assert result.status == "Normal"
        assert 110 <= result.average_systolic <= 120

    def test_hypertension_readings_status(self, hypertension_readings):
        """Test that high readings produce hypertension status."""
        result = analyze_readings(hypertension_readings)
        assert "Hypertension" in result.status

    def test_elevated_status(self):
        """Test elevated status (120-129 sys, <80 dia)."""
        readings = [
            BloodPressureReading(systolic=125, diastolic=75, heart_rate=72, tags=[]),
            BloodPressureReading(systolic=122, diastolic=78, heart_rate=70, tags=[]),
            BloodPressureReading(systolic=127, diastolic=76, heart_rate=74, tags=[]),
        ]
        result = analyze_readings(readings)
        assert result.status == "Elevated"

    def test_stage1_hypertension(self):
        """Test Stage 1 Hypertension detection (130-139 sys or 80-89 dia)."""
        readings = [
            BloodPressureReading(systolic=135, diastolic=82, heart_rate=76, tags=[]),
            BloodPressureReading(systolic=132, diastolic=84, heart_rate=78, tags=[]),
        ]
        result = analyze_readings(readings)
        assert result.status == "Stage 1 Hypertension"

    def test_stage2_hypertension(self):
        """Test Stage 2 Hypertension detection (>=140 sys or >=90 dia)."""
        readings = [
            BloodPressureReading(systolic=145, diastolic=95, heart_rate=85, tags=[]),
            BloodPressureReading(systolic=150, diastolic=92, heart_rate=88, tags=[]),
        ]
        result = analyze_readings(readings)
        assert result.status == "Stage 2 Hypertension"

    def test_rising_trend_detection(self, rising_trend_readings):
        """Test that a rising pattern is detected as 'Rising' trend."""
        result = analyze_readings(rising_trend_readings)
        assert result.trend == "Rising"

    def test_falling_trend_detection(self):
        """Test that a falling pattern is detected as 'Falling' trend."""
        readings = [
            BloodPressureReading(systolic=140, diastolic=90, heart_rate=85, tags=[]),
            BloodPressureReading(systolic=138, diastolic=88, heart_rate=82, tags=[]),
            BloodPressureReading(systolic=135, diastolic=86, heart_rate=80, tags=[]),
            # Recent readings are significantly lower
            BloodPressureReading(systolic=118, diastolic=75, heart_rate=72, tags=[]),
            BloodPressureReading(systolic=115, diastolic=74, heart_rate=70, tags=[]),
            BloodPressureReading(systolic=112, diastolic=72, heart_rate=68, tags=[]),
        ]
        result = analyze_readings(readings)
        assert result.trend == "Falling"

    def test_stable_trend_with_few_readings(self):
        """Test that fewer than 5 readings results in Stable trend."""
        readings = [
            BloodPressureReading(systolic=120, diastolic=80, heart_rate=72, tags=[]),
            BloodPressureReading(systolic=118, diastolic=78, heart_rate=70, tags=[]),
        ]
        result = analyze_readings(readings)
        assert result.trend == "Stable"

    def test_tag_correlation_detection(self):
        """Test that high BP correlated with a tag is detected."""
        readings = [
            BloodPressureReading(systolic=115, diastolic=75, heart_rate=70, tags=[]),
            BloodPressureReading(systolic=118, diastolic=76, heart_rate=72, tags=[]),
            BloodPressureReading(systolic=145, diastolic=90, heart_rate=85, tags=["Stressed"]),
            BloodPressureReading(systolic=142, diastolic=88, heart_rate=82, tags=["Stressed"]),
            BloodPressureReading(systolic=112, diastolic=73, heart_rate=68, tags=[]),
        ]
        result = analyze_readings(readings)
        assert len(result.correlations) >= 1
        assert any("Stressed" in c for c in result.correlations)

    def test_averages_are_accurate(self, normal_readings):
        """Test that calculated averages match expected values."""
        result = analyze_readings(normal_readings)
        expected_sys = np.mean([r.systolic for r in normal_readings])
        expected_dia = np.mean([r.diastolic for r in normal_readings])
        assert result.average_systolic == round(expected_sys, 1)
        assert result.average_diastolic == round(expected_dia, 1)

    def test_recommendation_for_normal(self, normal_readings):
        """Test that normal readings get a positive recommendation."""
        result = analyze_readings(normal_readings)
        assert "good work" in result.recommendation.lower()

    def test_recommendation_for_hypertension(self, hypertension_readings):
        """Test that hypertension readings get a medical recommendation."""
        result = analyze_readings(hypertension_readings)
        assert "consult" in result.recommendation.lower() or "healthcare" in result.recommendation.lower()


# ──────────────────────────────────────────────
# AI Engine: generate_habits() Tests
# ──────────────────────────────────────────────

class TestGenerateHabits:
    """Unit tests for the generate_habits function."""

    def test_always_includes_hydration(self):
        """Test that hydration habit is always included."""
        habits = generate_habits("Normal", "Stable")
        titles = [h.title for h in habits]
        assert "Hydration" in titles

    def test_normal_stable_includes_meditation(self):
        """Test that Normal+Stable generates meditation habit."""
        habits = generate_habits("Normal", "Stable")
        titles = [h.title for h in habits]
        assert "Maintenance Meditation" in titles

    def test_hypertension_includes_diet_and_sodium(self):
        """Test that hypertension triggers DASH diet and sodium habits."""
        habits = generate_habits("Stage 2 Hypertension", "Stable")
        titles = [h.title for h in habits]
        assert "DASH Diet" in titles
        assert "Sodium Reduction" in titles

    def test_rising_trend_includes_daily_walk(self):
        """Test that rising trend triggers daily walk habit."""
        habits = generate_habits("Elevated", "Rising")
        titles = [h.title for h in habits]
        assert "Daily Walk" in titles

    def test_normal_stable_has_fewer_habits(self):
        """Test that normal+stable has fewer habits than hypertension."""
        normal_habits = generate_habits("Normal", "Stable")
        hyper_habits = generate_habits("Stage 2 Hypertension", "Rising")
        assert len(normal_habits) < len(hyper_habits)

    def test_habit_difficulty_values(self):
        """Test that all habits have valid difficulty values."""
        habits = generate_habits("Stage 1 Hypertension", "Rising")
        valid_difficulties = {"Easy", "Medium", "Hard"}
        for habit in habits:
            assert habit.difficulty in valid_difficulties
