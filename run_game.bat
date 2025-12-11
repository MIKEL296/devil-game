@echo off
REM Run the Devil Levels game (Windows)
python -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt
python app.py
pause
