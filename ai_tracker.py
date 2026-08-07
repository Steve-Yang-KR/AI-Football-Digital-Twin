from __future__ import annotations

import os
import threading
from dataclasses import dataclass
from typing import Any


@dataclass
class BackendStatus:
    available: bool
    model: str
    tracker: str
    reason: str | None = None


class FootballTracker:
    """Lazy Ultralytics YOLO + ByteTrack adapter.

    The default model is a generic YOLO person detector. Set FOOTBALL_YOLO_MODEL
    to a football-specific .pt file to expose player/goalkeeper/referee/ball
    classes without changing the API contract.
    """

    def __init__(self) -> None:
        self.model_name = os.getenv("FOOTBALL_YOLO_MODEL", "yolo11n.pt")
        self.tracker_name = os.getenv("FOOTBALL_TRACKER", "bytetrack.yaml")
        self.confidence = float(os.getenv("FOOTBALL_YOLO_CONF", "0.18"))
        self.image_size = int(os.getenv("FOOTBALL_YOLO_IMGSZ", "1280"))
        self._model: Any | None = None
        self._lock = threading.Lock()
        self._load_error: str | None = None

    def status(self) -> BackendStatus:
        if self._load_error:
            return BackendStatus(False, self.model_name, self.tracker_name, self._load_error)
        try:
            import cv2  # noqa: F401
            import numpy  # noqa: F401
            import ultralytics  # noqa: F401
        except Exception as exc:
            return BackendStatus(False, self.model_name, self.tracker_name, f"AI extras not installed: {exc}")
        return BackendStatus(True, self.model_name, self.tracker_name)

    def _ensure_model(self) -> Any:
        if self._model is not None:
            return self._model
        try:
            from ultralytics import YOLO

            self._model = YOLO(self.model_name)
            return self._model
        except Exception as exc:
            self._load_error = str(exc)
            raise

    def track_jpeg(self, image_bytes: bytes) -> dict[str, Any]:
        import cv2
        import numpy as np

        encoded = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode JPEG frame")

        height, width = frame.shape[:2]
        with self._lock:
            model = self._ensure_model()
            results = model.track(
                source=frame,
                persist=True,
                tracker=self.tracker_name,
                conf=self.confidence,
                imgsz=self.image_size,
                verbose=False,
            )

        detections: list[dict[str, Any]] = []
        if not results:
            return {"width": width, "height": height, "detections": detections}

        result = results[0]
        names = result.names or {}
        boxes = result.boxes
        if boxes is None:
            return {"width": width, "height": height, "detections": detections}

        xyxy = boxes.xyxy.cpu().tolist()
        confs = boxes.conf.cpu().tolist() if boxes.conf is not None else [0.0] * len(xyxy)
        classes = boxes.cls.cpu().tolist() if boxes.cls is not None else [-1] * len(xyxy)
        ids = boxes.id.int().cpu().tolist() if boxes.id is not None else [None] * len(xyxy)

        for bounds, score, class_id, track_id in zip(xyxy, confs, classes, ids):
            x1, y1, x2, y2 = bounds
            label = str(names.get(int(class_id), int(class_id)))
            # With generic COCO weights, keep person only. A custom football model
            # can emit player/goalkeeper/referee/ball classes directly.
            if self.model_name.startswith("yolo") and label != "person":
                continue
            detections.append(
                {
                    "track_id": track_id,
                    "class_id": int(class_id),
                    "label": label,
                    "confidence": round(float(score), 4),
                    "bbox": {
                        "x": round(x1 / width, 6),
                        "y": round(y1 / height, 6),
                        "w": round((x2 - x1) / width, 6),
                        "h": round((y2 - y1) / height, 6),
                    },
                    "foot": {
                        "x": round(((x1 + x2) / 2) / width, 6),
                        "y": round(y2 / height, 6),
                    },
                }
            )

        return {
            "width": width,
            "height": height,
            "model": self.model_name,
            "tracker": self.tracker_name,
            "detections": detections,
        }


football_tracker = FootballTracker()
