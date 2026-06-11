import json
import hashlib
import os
from datetime import datetime
from typing import Dict, List, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
READINGS_FILE = os.path.join(DATA_DIR, "readings.json")


def _ensure_data_dir():
    """Create data directory if it doesn't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)


def _hash_password(password: str) -> str:
    """Hash a password using SHA-256 with a fixed salt."""
    salted = f"bp_tracker_salt_{password}"
    return hashlib.sha256(salted.encode()).hexdigest()


# ──────────────────────────────────────────────
# USER STORAGE
# ──────────────────────────────────────────────

def load_users() -> Dict:
    """Load all users from JSON file."""
    _ensure_data_dir()
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def save_users(users: Dict):
    """Save all users to JSON file."""
    _ensure_data_dir()
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def register_user(username: str, password: str) -> dict:
    """Register a new user. Returns user dict or raises ValueError."""
    users = load_users()
    
    # Check if username already exists (case-insensitive)
    username_lower = username.lower()
    for existing_user in users:
        if existing_user.lower() == username_lower:
            raise ValueError("Username already exists")
    
    users[username] = {
        "password_hash": _hash_password(password),
        "created_at": datetime.now().isoformat()
    }
    save_users(users)
    return {"username": username, "created_at": users[username]["created_at"]}


def verify_user(username: str, password: str) -> dict:
    """Verify login credentials. Returns user dict or raises ValueError."""
    users = load_users()
    
    # Case-insensitive username lookup
    matched_username = None
    for existing_user in users:
        if existing_user.lower() == username.lower():
            matched_username = existing_user
            break
    
    if not matched_username:
        raise ValueError("User not found. Please create an account first.")
    
    user = users[matched_username]
    if user["password_hash"] != _hash_password(password):
        raise ValueError("Incorrect password")
    
    return {"username": matched_username, "created_at": user["created_at"]}


# ──────────────────────────────────────────────
# READINGS STORAGE
# ──────────────────────────────────────────────

def load_all_readings() -> Dict[str, List]:
    """Load all readings from JSON file, keyed by username."""
    _ensure_data_dir()
    if not os.path.exists(READINGS_FILE):
        return {}
    with open(READINGS_FILE, "r") as f:
        return json.load(f)


def save_all_readings(all_readings: Dict[str, List]):
    """Save all readings to JSON file."""
    _ensure_data_dir()
    with open(READINGS_FILE, "w") as f:
        json.dump(all_readings, f, indent=2, default=str)


def get_user_readings(username: str) -> List[dict]:
    """Get readings for a specific user."""
    all_readings = load_all_readings()
    return all_readings.get(username, [])


def add_user_reading(username: str, reading: dict) -> dict:
    """Add a reading for a specific user and persist it."""
    all_readings = load_all_readings()
    if username not in all_readings:
        all_readings[username] = []
    all_readings[username].append(reading)
    save_all_readings(all_readings)
    return reading
