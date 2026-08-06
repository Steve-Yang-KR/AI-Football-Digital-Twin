from fastapi import Request
from fastapi.responses import HTMLResponse, Response

from app import app, templates


@app.middleware('http')
async def add_hologram_link_to_panorama(request: Request, call_next):
    response = await call_next(request)
    if request.url.path != '/' or response.headers.get('content-type', '').split(';')[0] != 'text/html':
        return response

    body = b''.join([chunk async for chunk in response.body_iterator])
    html = body.decode('utf-8')
    script = '<script src="/static/hologram-link.js"></script>'
    if script not in html:
        html = html.replace('</body>', f'{script}</body>')

    headers = dict(response.headers)
    headers.pop('content-length', None)
    return Response(
        content=html,
        status_code=response.status_code,
        headers=headers,
        media_type='text/html',
    )


@app.get('/hologram', response_class=HTMLResponse)
async def hologram(request: Request) -> HTMLResponse:
    return templates.TemplateResponse('hologram.html', {'request': request})


@app.get('/platform', response_class=HTMLResponse)
async def platform_homepage(request: Request) -> HTMLResponse:
    return templates.TemplateResponse('platform.html', {'request': request})
