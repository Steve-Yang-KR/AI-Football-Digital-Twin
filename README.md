# Football Digital Twin OS v2

This branch restarts the project as a working Python application instead of another static marketing page.

## Product definition

Use ordinary smartphones to observe a football match, maintain a live digital model of players, ball and team behavior, and simulate decisions before coaches act in the real world.

The Digital Twin loop is:

1. Physical match
2. Multi-camera observation
3. Synchronization and calibration
4. Player / ball / event tracking
5. Live Match Digital Twin
6. Tactical simulation
7. Coach decision support

## What works in this MVP

- FastAPI backend
- Live WebSocket stream for a simulated 22-player Match Digital Twin
- Functional dashboard navigation
- Live player and ball movement on a regulation-ratio pitch
- Current possession, xG, pressing and confidence metrics
- Python API for creating camera sessions
- Python what-if simulation API
- Interactive formation, press, tempo, width and fatigue controls
- Clear explanation of Player Twin, Match Twin and Team Twin
- Render deployment configuration

## What is simulated

The current WebSocket data and tactical predictions are transparent demo logic. They are not yet produced by real computer vision or a trained football prediction model.

## Next engineering milestone

Replace the simulation data source with the real capture pipeline:

- phone camera registration
- WebRTC video return
- video synchronization
- camera calibration
- panorama or shared field coordinates
- player and ball detection
- multi-camera tracking
- persistent match state

## Run locally

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## Deployment note

GitHub Pages cannot run Python, FastAPI or WebSockets. Deploy this branch to a Python web host such as Render, Railway, Fly.io, Azure, AWS or Google Cloud. `render.yaml` is included for a simple Render deployment.

## Branch

`feature/football-digital-twin-python-v2`
