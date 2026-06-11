import requests

data = [
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

for d in data:
    r = requests.post("http://localhost:8000/readings", json=d)
    print(f"  {d['systolic']}/{d['diastolic']} -> {r.status_code}")

print(f"\nSeeded {len(data)} readings")
