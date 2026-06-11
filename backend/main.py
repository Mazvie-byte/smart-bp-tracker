from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from .models import BloodPressureReading, AnalysisResult, HabitSuggestion, ChatRequest, UserRegister, UserLogin, UserResponse
from .ai_engine import analyze_readings, generate_habits
from .storage import register_user, verify_user, get_user_readings, add_user_reading

app = FastAPI(title="Blood Pressure Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Blood Pressure Assistant API is running"}


# ──────────────────────────────────────────────
# AUTH ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    if not user.username or len(user.username.strip()) < 2:
        raise HTTPException(status_code=422, detail="Username must be at least 2 characters")
    if not user.password or len(user.password) < 4:
        raise HTTPException(status_code=422, detail="Password must be at least 4 characters")
    try:
        result = register_user(user.username.strip(), user.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@app.post("/login", response_model=UserResponse)
def login(user: UserLogin):
    try:
        result = verify_user(user.username.strip(), user.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# ──────────────────────────────────────────────
# READINGS ENDPOINTS (per-user)
# ──────────────────────────────────────────────

@app.post("/readings", response_model=BloodPressureReading)
def add_reading(reading: BloodPressureReading, username: str = Query(default="guest")):
    reading_dict = reading.model_dump()
    reading_dict["timestamp"] = reading_dict["timestamp"].isoformat()
    add_user_reading(username, reading_dict)
    return reading


@app.get("/readings", response_model=List[BloodPressureReading])
def get_readings(username: str = Query(default="guest")):
    raw = get_user_readings(username)
    return [BloodPressureReading(**r) for r in raw]


@app.get("/analysis", response_model=AnalysisResult)
def get_analysis(username: str = Query(default="guest")):
    raw = get_user_readings(username)
    if not raw:
        raise HTTPException(status_code=404, detail="No readings available for analysis")
    readings = [BloodPressureReading(**r) for r in raw]
    return analyze_readings(readings)


@app.get("/habits", response_model=List[HabitSuggestion])
def get_habit_suggestions(username: str = Query(default="guest")):
    raw = get_user_readings(username)
    if not raw:
        return generate_habits("Unknown", "Insufficient Data")
    readings = [BloodPressureReading(**r) for r in raw]
    analysis = analyze_readings(readings)
    return generate_habits(analysis.status, analysis.trend)


@app.post("/chat")
def chat_with_coach(request: ChatRequest, username: str = Query(default="guest")):
    # Retrieve context
    raw = get_user_readings(username)
    context_str = "No data yet."
    analysis = None

    if raw:
        readings = [BloodPressureReading(**r) for r in raw]
        analysis = analyze_readings(readings)
        context_str = (
            f"User Status: {analysis.status}. "
            f"Trend: {analysis.trend}. "
            f"Avg BP: {analysis.average_systolic}/{analysis.average_diastolic}. "
            f"Rec: {analysis.recommendation}"
        )

    # Context-aware AI Response
    msg_lower = request.message.lower()
    response = "I'm here to help with your blood pressure journey."

    if "trend" in msg_lower or "getting worse" in msg_lower or "better" in msg_lower:
        if analysis and "Rising" in context_str:
            response = f"I noticed your trend is **Rising**. This means your recent readings are higher than usual. {analysis.recommendation}"
        elif analysis and "Falling" in context_str:
            response = "Great news! Your trend is **Falling**, which means your blood pressure is improving. Keep it up!"
        elif analysis:
            response = f"Your trend is currently **Stable**. Consistency is key! Your average is {analysis.average_systolic}/{analysis.average_diastolic}."
        else:
            response = "I don't have enough data to determine your trend yet. Please add more readings."

    elif "diet" in msg_lower or "eat" in msg_lower or "food" in msg_lower:
        response = "For blood pressure, the **DASH diet** is best. Focus on fruits, vegetables, and low-fat dairy. Try to limit sodium!"

    elif "exercise" in msg_lower or "workout" in msg_lower:
        response = "Aim for at least 150 minutes of moderate activity per week. Brisk walking can significantly lower BP."

    elif "status" in msg_lower or "how am i" in msg_lower:
        if analysis:
            response = f"Your current status is classified as **{analysis.status}**. Based on your average of {analysis.average_systolic}/{analysis.average_diastolic}."
        else:
            response = "I don't have any readings yet. Please add some blood pressure readings first."

    else:
        response = f"That's a good question. Based on your data ({context_str}), I'd suggest focusing on consistent measurements. How else can I help?"

    return {"response": response}
