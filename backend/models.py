from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BloodPressureReading(BaseModel):
    systolic: int
    diastolic: int
    heart_rate: int
    timestamp: datetime = datetime.now()
    notes: Optional[str] = None
    tags: List[str] = [] # e.g. ["Stressed", "Post-Exercise", "Salty Meal"]

class AnalysisResult(BaseModel):
    average_systolic: float
    average_diastolic: float
    status: str  # e.g., "Normal", "Elevated"
    trend: str   # e.g., "Stable", "Rising"
    recommendation: str
    correlations: List[str] = []

class HabitSuggestion(BaseModel):
    title: str
    description: str
    difficulty: str  # Easy, Medium, Hard

class ChatRequest(BaseModel):
    message: str

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    created_at: str
