@echo off
echo Starting AI Blood Pressure Assistant...

:: Create a virtual environment if it doesn't exist
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    echo Installing backend dependencies...
    pip install -r requirements.txt
    cd ..
)

:: Install frontend dependencies if node_modules doesn't exist
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo Starting Backend Server...
start "BP Backend" cmd /k "backend\venv\Scripts\activate && python -m uvicorn backend.main:app --reload"

echo Starting Frontend Server...
start "BP Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Project started!
echo   Fronted: http://localhost:5173
echo   Backend: http://localhost:8000
echo ===================================================
echo.
pause
