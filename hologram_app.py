from fastapi import Request
from fastapi.responses import HTMLResponse

from app import app, templates


@app.get('/hologram', response_class=HTMLResponse)
async def hologram(request: Request) -> HTMLResponse:
    return templates.TemplateResponse('hologram.html', {'request': request})
