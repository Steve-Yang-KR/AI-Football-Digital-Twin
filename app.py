from __future__ import annotations

import asyncio
import math
import random
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from ai_tracker import football_tracker

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="Football Digital Twin OS", version="2.4.0")
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

Role = Literal["LEFT", "CENTER", "RIGHT"]
ROLES = ("LEFT", "CENTER", "RIGHT")
SESSIONS: dict[str, dict[str, Any]] = {}
SIGNAL_PEERS: dict[str, dict[str, dict[str, WebSocket]]] = {}


class SimulationRequest(BaseModel):
    formation: str = "4-3-3"
    press_height: int = Field(62, ge=0, le=100)
    tempo: int = Field(58, ge=0, le=100)
    width: int = Field(64, ge=0, le=100)
    fatigue: int = Field(31, ge=0, le=100)


class CameraStatus(BaseModel):
    role: Role
    connected: bool = True
    battery: int | None = Field(default=None, ge=0, le=100)
    fps: int = Field(default=30, ge=0, le=120)
    latency: int = Field(default=0, ge=0, le=10000)
    device: str = "mobile-browser"


def empty_camera() -> dict[str, Any]:
    return {"connected": False, "streaming": False, "battery": None, "fps": 0, "latency": 0, "device": None, "last_seen": None}


def new_session(base_url: str) -> dict[str, Any]:
    code = secrets.token_hex(3).upper()
    session = {"code": code, "created_at": datetime.now(timezone.utc).isoformat(), "join_url": f"{base_url.rstrip('/')}/phone/{code}", "cameras": {role: empty_camera() for role in ROLES}}
    SESSIONS[code] = session
    SIGNAL_PEERS[code] = {role: {} for role in ROLES}
    return session


def twin_frame(tick: int) -> dict[str, Any]:
    players = []
    for i in range(22):
        base_x = 15 + (i % 11) * 6.6
        base_y = 18 + ((i * 17) % 64)
        players.append({"id": i + 1, "team": "A" if i < 11 else "B", "x": round(max(3, min(97, base_x + math.sin((tick + i * 7) / 18) * 4.2)), 2), "y": round(max(4, min(96, base_y + math.cos((tick + i * 11) / 21) * 5.6)), 2)})
    possession = round(50 + math.sin(tick / 26) * 11)
    return {"timestamp": datetime.now(timezone.utc).isoformat(), "players": players, "ball": {"x": round(50 + math.sin(tick / 9) * 24, 2), "y": round(50 + math.cos(tick / 12) * 19, 2)}, "metrics": {"possession_a": possession, "possession_b": 100 - possession, "xg_a": round(1.18 + abs(math.sin(tick / 40)) * 0.72, 2), "xg_b": round(0.76 + abs(math.cos(tick / 43)) * 0.61, 2), "pressing": "HIGH" if tick % 40 < 22 else "MID BLOCK", "confidence": round(0.88 + abs(math.sin(tick / 31)) * 0.08, 2)}}


@app.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/phone/{code}", response_class=HTMLResponse)
async def phone_camera(request: Request, code: str) -> HTMLResponse:
    code = code.upper()
    if code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Camera session not found")
    return templates.TemplateResponse("phone.html", {"request": request, "code": code})


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "football-digital-twin-os"}


@app.get("/api/ai/status")
async def ai_status() -> dict[str, Any]:
    status = football_tracker.status()
    return {
        "available": status.available,
        "engine": "ultralytics-yolo-bytetrack",
        "model": status.model,
        "tracker": status.tracker,
        "reason": status.reason,
        "mode": "server" if status.available else "browser-fallback",
    }


@app.post("/api/ai/track")
async def ai_track(request: Request) -> dict[str, Any]:
    status = football_tracker.status()
    if not status.available:
        raise HTTPException(status_code=503, detail=status.reason or "Server AI unavailable")
    frame = await request.body()
    if not frame:
        raise HTTPException(status_code=400, detail="JPEG frame body is required")
    if len(frame) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Frame is too large")
    try:
        result = await asyncio.to_thread(football_tracker.track_jpeg, frame)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tracking failed: {exc}") from exc
    result["timestamp"] = datetime.now(timezone.utc).isoformat()
    return result


@app.post("/api/sessions")
async def create_session(request: Request) -> dict[str, Any]:
    return new_session(str(request.base_url))


@app.get("/api/sessions/{code}")
async def get_session(code: str) -> dict[str, Any]:
    session = SESSIONS.get(code.upper())
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    now = datetime.now(timezone.utc)
    for camera in session["cameras"].values():
        if camera["last_seen"] and (now - datetime.fromisoformat(camera["last_seen"])).total_seconds() > 12:
            camera["connected"] = camera["streaming"] = False
    return session


@app.post("/api/sessions/{code}/camera")
async def update_camera(code: str, payload: CameraStatus) -> dict[str, Any]:
    session = SESSIONS.get(code.upper())
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    camera = session["cameras"][payload.role]
    camera.update(payload.model_dump())
    camera["last_seen"] = datetime.now(timezone.utc).isoformat()
    return {"ok": True, "code": code.upper(), "camera": camera}


@app.websocket("/ws/signal/{code}/{role}/{peer_type}")
async def signal_socket(websocket: WebSocket, code: str, role: str, peer_type: str) -> None:
    code, role, peer_type = code.upper(), role.upper(), peer_type.lower()
    if code not in SESSIONS or role not in ROLES or peer_type not in {"phone", "viewer"}:
        await websocket.close(code=4404)
        return
    await websocket.accept()
    peers = SIGNAL_PEERS.setdefault(code, {r: {} for r in ROLES})[role]
    old = peers.get(peer_type)
    if old:
        try:
            await old.close(code=4000)
        except Exception:
            pass
    peers[peer_type] = websocket
    other_type = "viewer" if peer_type == "phone" else "phone"
    other = peers.get(other_type)
    if other:
        await other.send_json({"type": "peer-ready", "peer": peer_type})
        await websocket.send_json({"type": "peer-ready", "peer": other_type})
    try:
        while True:
            message = await websocket.receive_json()
            target = peers.get(other_type)
            if target:
                await target.send_json(message)
            if peer_type == "phone" and message.get("type") == "streaming":
                SESSIONS[code]["cameras"][role]["streaming"] = bool(message.get("value"))
    except WebSocketDisconnect:
        pass
    finally:
        if peers.get(peer_type) is websocket:
            peers.pop(peer_type, None)
        if peer_type == "phone":
            camera = SESSIONS.get(code, {}).get("cameras", {}).get(role)
            if camera:
                camera["connected"] = camera["streaming"] = False
        other = peers.get(other_type)
        if other:
            try:
                await other.send_json({"type": "peer-left", "peer": peer_type})
            except Exception:
                pass


@app.post("/api/simulate")
async def simulate(payload: SimulationRequest) -> dict[str, Any]:
    attacking_index = payload.press_height * 0.34 + payload.tempo * 0.31 + payload.width * 0.18
    win_probability = max(12, min(82, 38 + attacking_index * 0.42 - payload.fatigue * 0.27 * 0.36))
    xg = max(0.35, min(3.4, 0.72 + attacking_index / 72 - payload.fatigue / 210))
    risk = max(7, min(91, 16 + payload.press_height * 0.42 + payload.tempo * 0.25 - payload.width * 0.14))
    confidence = max(0.55, min(0.97, 0.92 - abs(payload.press_height - 62) / 400 - payload.fatigue / 700))
    recommendation = "Lower the press or keep one midfielder behind the ball" if risk > 63 else "Reduce tempo and prepare a substitution" if payload.fatigue > 62 else "Sustain pressure and attack the weak-side half-space" if win_probability > 63 else "Maintain structure"
    return {"formation": payload.formation, "win_probability": round(win_probability, 1), "expected_goals": round(xg, 2), "transition_risk": round(risk, 1), "confidence": round(confidence, 2), "recommendation": recommendation}


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
