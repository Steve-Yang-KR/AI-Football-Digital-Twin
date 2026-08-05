from __future__ import annotations

import asyncio
import math
import random
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="Football Digital Twin OS", version="2.0.0")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


class SimulationRequest(BaseModel):
    formation: str = "4-3-3"
    press_height: int = Field(62, ge=0, le=100)
    tempo: int = Field(58, ge=0, le=100)
    width: int = Field(64, ge=0, le=100)
    fatigue: int = Field(31, ge=0, le=100)


SESSIONS: dict[str, dict[str, Any]] = {}


def new_session() -> dict[str, Any]:
    code = secrets.token_hex(3).upper()
    session = {
        "code": code,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "cameras": {
            "LEFT": {"connected": False, "battery": 0, "fps": 0, "latency": 0},
            "CENTER": {"connected": False, "battery": 0, "fps": 0, "latency": 0},
            "RIGHT": {"connected": False, "battery": 0, "fps": 0, "latency": 0},
        },
    }
    SESSIONS[code] = session
    return session


def twin_frame(tick: int) -> dict[str, Any]:
    players = []
    for i in range(22):
        team = "A" if i < 11 else "B"
        base_x = 15 + (i % 11) * 6.6
        base_y = 18 + ((i * 17) % 64)
        x = max(3, min(97, base_x + math.sin((tick + i * 7) / 18) * 4.2))
        y = max(4, min(96, base_y + math.cos((tick + i * 11) / 21) * 5.6))
        players.append({"id": i + 1, "team": team, "x": round(x, 2), "y": round(y, 2)})

    ball_x = 50 + math.sin(tick / 9) * 24
    ball_y = 50 + math.cos(tick / 12) * 19
    possession = round(50 + math.sin(tick / 26) * 11)
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "players": players,
        "ball": {"x": round(ball_x, 2), "y": round(ball_y, 2)},
        "metrics": {
            "possession_a": possession,
            "possession_b": 100 - possession,
            "xg_a": round(1.18 + abs(math.sin(tick / 40)) * 0.72, 2),
            "xg_b": round(0.76 + abs(math.cos(tick / 43)) * 0.61, 2),
            "pressing": "HIGH" if tick % 40 < 22 else "MID BLOCK",
            "confidence": round(0.88 + abs(math.sin(tick / 31)) * 0.08, 2),
        },
    }


@app.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "football-digital-twin-os"}


@app.post("/api/sessions")
async def create_session() -> dict[str, Any]:
    return new_session()


@app.get("/api/sessions/{code}")
async def get_session(code: str) -> dict[str, Any]:
    code = code.upper()
    return SESSIONS.get(code, {"code": code, "status": "not_found"})


@app.post("/api/simulate")
async def simulate(payload: SimulationRequest) -> dict[str, Any]:
    attacking_index = payload.press_height * 0.34 + payload.tempo * 0.31 + payload.width * 0.18
    fatigue_penalty = payload.fatigue * 0.27
    win_probability = max(12, min(82, 38 + attacking_index * 0.42 - fatigue_penalty * 0.36))
    xg = max(0.35, min(3.4, 0.72 + attacking_index / 72 - payload.fatigue / 210))
    transition_risk = max(7, min(91, 16 + payload.press_height * 0.42 + payload.tempo * 0.25 - payload.width * 0.14))
    confidence = max(0.55, min(0.97, 0.92 - abs(payload.press_height - 62) / 400 - payload.fatigue / 700))

    recommendation = "Maintain structure"
    if transition_risk > 63:
        recommendation = "Lower the press or keep one midfielder behind the ball"
    elif payload.fatigue > 62:
        recommendation = "Reduce tempo and prepare a substitution"
    elif win_probability > 63:
        recommendation = "Sustain pressure and attack the weak-side half-space"

    return {
        "formation": payload.formation,
        "win_probability": round(win_probability, 1),
        "expected_goals": round(xg, 2),
        "transition_risk": round(transition_risk, 1),
        "confidence": round(confidence, 2),
        "recommendation": recommendation,
    }


@app.websocket("/ws/twin")
async def twin_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    tick = random.randint(0, 500)
    try:
        while True:
            await websocket.send_json(twin_frame(tick))
            tick += 1
            await asyncio.sleep(0.7)
    except WebSocketDisconnect:
        return
