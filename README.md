Devil Levels — small level-based browser game

Overview
- Frontend: `index.html`, `styles.css`, `game.js` (Canvas game). Use left/right arrows or A/D to move.
- Backend: `app.py` (Flask) — serves static files + `/api/highscores` to GET/POST highscores saved in `highscores.json`.

Quick start (PowerShell):

```powershell
cd "C:\Users\d0$tEd\Documents\VS CODE\devil_game"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Open http://localhost:5001 in your browser.

Notes
- The game increases difficulty each level by spawning faster devils.
- When you lose all lives, submit your score and it will be saved to `highscores.json`.
- For production, host static files on a web server and run the API with a proper WSGI server.

Files created:
- `index.html`, `styles.css`, `game.js`, `app.py`, `requirements.txt`, `highscores.json`, `run_game.bat`.

Enjoy — want more levels, power-ups, or mobile touch controls? Reply with which feature next.