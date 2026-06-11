from typing import List
from models import BloodPressureReading, AnalysisResult, HabitSuggestion
import numpy as np

def analyze_readings(readings: List[BloodPressureReading]) -> AnalysisResult:
    if not readings:
        return AnalysisResult(
            average_systolic=0,
            average_diastolic=0,
            status="Unknown",
            trend="Insufficient Data",
            recommendation="Please add more readings."
        )

    # Calculate averages
    systolies = [r.systolic for r in readings]
    diastolies = [r.diastolic for r in readings]
    avg_sys = np.mean(systolies)
    avg_dia = np.mean(diastolies)

    # Determine Status (Simplified JNC 7 / ACC/AHA guidelines)
    status = "Normal"
    if avg_sys >= 140 or avg_dia >= 90:
        status = "Stage 2 Hypertension"
    elif avg_sys >= 130 or avg_dia >= 80:
        status = "Stage 1 Hypertension"
    elif avg_sys >= 120 and avg_sys < 130 and avg_dia < 80:
        status = "Elevated"
    
    # Determine Trend (Simple heuristic: compare last 3 vs all previous)
    trend = "Stable"
    if len(readings) >= 5:
        recent_avg_sys = np.mean(systolies[-3:])
        past_avg_sys = np.mean(systolies[:-3])
        if recent_avg_sys > past_avg_sys + 5:
            trend = "Rising"
        elif recent_avg_sys < past_avg_sys - 5:
            trend = "Falling"

    # Analyze Correlations
    correlations = []
    if len(readings) >= 3:
        # Simple analysis: Check avg BP for each tag vs overall avg
        tag_counts = {}
        tag_sums = {}
        
        for r in readings:
            for tag in r.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
                tag_sums[tag] = tag_sums.get(tag, 0) + r.systolic

        for tag, count in tag_counts.items():
            if count >= 2: # Min 2 occurrences to say something
                tag_avg = tag_sums[tag] / count
                diff = tag_avg - avg_sys
                if diff > 10:
                    correlations.append(f"Your BP is significantly higher ({int(diff)} pts) when you report '{tag}'.")
                elif diff < -10:
                    correlations.append(f"Your BP is lower ({int(abs(diff))} pts) when you report '{tag}'.")

    # Generate Recommendation
    recommendation = "Keep up the good work!"
    if status != "Normal":
        recommendation = "Consult a healthcare provider. Reduce sodium intake and monitor daily."
    if trend == "Rising":
        recommendation += " Your BP has been rising recently, check for lifestyle changes."
    
    if correlations:
        recommendation += " " + " ".join(correlations)

    return AnalysisResult(
        average_systolic=round(avg_sys, 1),
        average_diastolic=round(avg_dia, 1),
        status=status,
        trend=trend,
        recommendation=recommendation,
        correlations=correlations
    )

def generate_habits(status: str, trend: str) -> List[HabitSuggestion]:
    habits = []
    
    # Universal habit
    habits.append(HabitSuggestion(
        title="Hydration",
        description="Drink at least 8 glasses of water daily.",
        difficulty="Easy"
    ))

    if status != "Normal":
        habits.append(HabitSuggestion(
            title="DASH Diet",
            description="Incorporate more fruits, vegetables, and whole grains.",
            difficulty="Medium"
        ))
        habits.append(HabitSuggestion(
            title="Sodium Reduction",
            description="Limit sodium intake to under 2300mg per day.",
            difficulty="Hard"
        ))

    if trend == "Rising":
        habits.append(HabitSuggestion(
            title="Daily Walk",
            description="Take a 30-minute brisk walk every day.",
            difficulty="Medium"
        ))
        
    if status == "Normal" and trend == "Stable":
        habits.append(HabitSuggestion(
            title="Maintenance Meditation",
            description="5 minutes of mindfulness to keep stress low.",
            difficulty="Easy"
        ))

    return habits
