# AI Football Digital Twin

A smartphone-based football digital twin concept that connects multi-camera capture and panorama reconstruction with future AI vision, player tracking, match analytics, simulation, and prediction.

## Current demo

The repository contains a standalone interactive `index.html` suitable for GitHub Pages. It includes:

- Platform overview
- Live field twin with 22 simulated players and a ball
- Match time slider
- AI vision concept screen
- Match analytics concept screen
- Tactical what-if simulation
- Responsive desktop and mobile layout

## Evidence boundary

The source MVP document supports the camera capture, recording, hardware, alignment, and panorama pipeline. Player detection, tracking, analytics, simulation, and prediction are presented as clearly labeled concept layers for future development.

## Branch workflow

- `main`: stable version
- `develop-football-twin`: active development and review

## GitHub Pages

After merging the development pull request, open **Settings → Pages**, select **Deploy from a branch**, and choose:

- Branch: `main`
- Folder: `/ (root)`

The expected public address is:

`https://steve-yang-kr.github.io/AI-Football-Digital-Twin/`

## Next development priorities

1. Separate CSS and JavaScript into maintainable modules.
2. Add the source-supported camera and panorama screens.
3. Add a real QR/WebRTC connection service for multiple phones.
4. Integrate panorama stitching and recording storage.
5. Add validated AI detection and tracking models.
