#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_LEVEL="${LOG_LEVEL:-INFO}"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "=== H-Tag Analyzer dev server ==="
echo "Backend : http://127.0.0.1:8000 (LOG_LEVEL=$LOG_LEVEL)"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
echo

(
  cd "$BACKEND_DIR"
  if [[ -f ".venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source .venv/bin/activate
  fi
  export LOG_LEVEL
  exec uvicorn main:app \
    --reload \
    --port 8000 \
    --host 127.0.0.1 \
    --log-level "$(echo "$LOG_LEVEL" | tr '[:upper:]' '[:lower:]')" \
    --access-log
) 2>&1 | sed -u 's/^/[backend] /' &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  exec npm run dev -- --port 5173 --host localhost
) 2>&1 | sed -u 's/^/[frontend] /' &
FRONTEND_PID=$!

wait
