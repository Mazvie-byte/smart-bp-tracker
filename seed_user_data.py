import requests

BASE_URL = "http://localhost:8000"
USERNAME = "Mazvita"
PASSWORD = "password123"

def seed():
    # 1. Try to register the user
    try:
        r = requests.post(f"{BASE_URL}/register", json={"username": USERNAME, "password": PASSWORD})
        if r.status_code in (200, 201):
            print(f"Created account for '{USERNAME}' with password '{PASSWORD}'")
        elif r.status_code == 409:
            print(f"Account '{USERNAME}' already exists. Skipping registration.")
        else:
            print(f"Error registering user: {r.text}")
            return
    except requests.exceptions.ConnectionError:
        print("Backend server is not running on port 8000")
        return

    # 2. Seed data for the user
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

    print("\nSeeding readings...")
    for d in data:
        r = requests.post(f"{BASE_URL}/readings?username={USERNAME}", json=d)
        if r.status_code == 200:
            print(f"  {d['systolic']}/{d['diastolic']} -> Success")
        else:
            print(f"  Failed: {r.text}")

    print(f"\nSuccessfully seeded {len(data)} readings for user '{USERNAME}'")
    print(f"You can now login with Username: {USERNAME} and Password: {PASSWORD}")

if __name__ == "__main__":
    seed()
