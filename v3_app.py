from pathlib import Path

from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from hologram_app import app, templates

BASE_DIR = Path(__file__).resolve().parent

# Preserve the previous single-file dashboard at /legacy while replacing only the root page.
for route in list(app.router.routes):
    if getattr(route, "path", None) == "/" and "GET" in getattr(route, "methods", set()):
        app.router.routes.remove(route)

if not any(getattr(route, "path", None) == "/static" for route in app.router.routes):
    app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


def page_context(request: Request, active: str, title: str, subtitle: str) -> dict:
    return {"request": request, "active": active, "title": title, "subtitle": subtitle}


@app.get("/", response_class=HTMLResponse)
async def overview(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/overview.html", page_context(
        request, "overview", "Overview", "Reality → Capture → Observation → Digital Twin → Simulation → Decision"
    ))


@app.get("/capture", response_class=HTMLResponse)
async def capture_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/capture.html", page_context(
        request, "capture", "Capture", "Connect phones, create sessions and manage live camera inputs."
    ))


@app.get("/observation", response_class=HTMLResponse)
async def observation_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/observation.html", page_context(
        request, "observation", "Observation", "Review panorama, camera alignment and the live evidence layer."
    ))


@app.get("/digital-twin", response_class=HTMLResponse)
async def twin_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/digital_twin.html", page_context(
        request, "twin", "Digital Twin", "Maintain player, match and team state in one trusted model."
    ))


@app.get("/simulation", response_class=HTMLResponse)
async def simulation_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/simulation.html", page_context(
        request, "simulation", "Simulation", "Test tactical what-if scenarios against the current Twin state."
    ))


@app.get("/legacy", response_class=HTMLResponse)
async def legacy_dashboard(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("index.html", {"request": request})
