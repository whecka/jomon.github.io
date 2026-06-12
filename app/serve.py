#!/usr/bin/env python3
"""Static server for the Jomon app that also accepts in-app feedback.

Serves files from this directory, and accepts POST /api/feedback with a JSON
body, appending one JSON line per note to ../feedback/inbox.jsonl. A nightly
scheduled agent reads that inbox, acts on each pending item, and marks it done.
"""
import json, os, sys
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

APP_DIR = os.path.dirname(os.path.abspath(__file__))
INBOX = os.path.join(APP_DIR, "..", "feedback", "inbox.jsonl")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=APP_DIR, **k)

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._json(204, {})

    def do_POST(self):
        if self.path.rstrip("/") != "/api/feedback":
            return self._json(404, {"error": "not found"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception as e:
            return self._json(400, {"error": str(e)})
        entry = {
            "id": data.get("id") or int(datetime.now().timestamp() * 1000),
            "text": (data.get("text") or "").strip(),
            "context": data.get("context") or "",
            "created": datetime.now(timezone.utc).isoformat(),
            "status": "pending",
        }
        if not entry["text"]:
            return self._json(400, {"error": "empty feedback"})
        os.makedirs(os.path.dirname(INBOX), exist_ok=True)
        with open(INBOX, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return self._json(200, {"ok": True, "id": entry["id"]})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    print(f"Jomon serving {APP_DIR} on http://localhost:{port}  (feedback -> {os.path.abspath(INBOX)})")
    ThreadingHTTPServer(("", port), Handler).serve_forever()
