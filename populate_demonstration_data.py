import json
import os
import random
from datetime import datetime, timedelta

DATA_FILE = os.path.join("backend", "data", "readings.json")

base_data = [
    {"systolic": 118, "diastolic": 76, "heart_rate": 72, "tags": ["Meds Taken"]},
    {"systolic": 122, "diastolic": 78, "heart_rate": 74, "tags": ["Post-Exercise"]},
    {"systolic": 135, "diastolic": 88, "heart_rate": 82, "tags": ["Stressed", "High Salt"]},
    {"systolic": 128, "diastolic": 82, "heart_rate": 76, "tags": ["Caffeine"]},
    {"systolic": 140, "diastolic": 92, "heart_rate": 88, "tags": ["Stressed", "High Salt"]},
    {"systolic": 115, "diastolic": 74, "heart_rate": 68, "tags": ["Post-Exercise"]},
    {"systolic": 132, "diastolic": 86, "heart_rate": 80, "tags": ["Caffeine"]},
    {"systolic": 125, "diastolic": 80, "heart_rate": 75, "tags": []},
    {"systolic": 138, "diastolic": 90, "heart_rate": 85, "tags": ["Stressed"]},
    {"systolic": 120, "diastolic": 78, "heart_rate": 71, "tags": ["Meds Taken"]},
]

def main():
    if not os.path.exists(DATA_FILE):
        print(f"File not found: {DATA_FILE}")
        return

    with open(DATA_FILE, "r") as f:
        readings = json.load(f)

    mazvita_readings = []
    now = datetime.now()
    
    # Let's generate data for the last 45 days (more than a month)
    # 2 readings per day
    for i in range(45, -1, -1):
        for j in range(2):
            template = dict(random.choice(base_data))
            # randomize a little bit
            template["systolic"] += random.randint(-5, 5)
            template["diastolic"] += random.randint(-3, 3)
            template["heart_rate"] += random.randint(-4, 4)
            
            # 8 AM and 6 PM
            hour = 8 if j == 0 else 18
            reading_date = now - timedelta(days=i)
            reading_date = reading_date.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59), microsecond=0)
            
            template["timestamp"] = reading_date.isoformat()
            template["notes"] = None
            mazvita_readings.append(template)

    readings["Mazvita"] = mazvita_readings

    with open(DATA_FILE, "w") as f:
        json.dump(readings, f, indent=2)
    
    print(f"Successfully generated {len(mazvita_readings)} readings for Mazvita over the last 45 days.")

if __name__ == "__main__":
    main()
