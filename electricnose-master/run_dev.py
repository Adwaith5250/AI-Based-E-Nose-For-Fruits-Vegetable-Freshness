"""Run the FastAPI backend and Vite frontend together."""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend" / "enose_project"
processes: list[subprocess.Popen] = []


def stop_processes(*_args: object) -> None:
    for process in reversed(processes):
        if process.poll() is None:
            process.terminate()
    for process in reversed(processes):
        if process.poll() is None:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


def main() -> int:
    signal.signal(signal.SIGINT, stop_processes)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, stop_processes)

    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.api_server:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=ROOT,
        env=os.environ.copy(),
    )
    processes.append(backend)

    frontend = subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=FRONTEND,
        env=os.environ.copy(),
    )
    processes.append(frontend)

    print("Backend:  http://127.0.0.1:8000")
    print("Frontend: open the Vite URL shown below")
    print("Press Ctrl+C to stop both servers.")

    try:
        while True:
            if backend.poll() is not None:
                print("Backend stopped; stopping frontend.")
                return backend.returncode or 1
            if frontend.poll() is not None:
                print("Frontend stopped; stopping backend.")
                return frontend.returncode or 1
            time.sleep(0.2)
    finally:
        stop_processes()


if __name__ == "__main__":
    raise SystemExit(main())