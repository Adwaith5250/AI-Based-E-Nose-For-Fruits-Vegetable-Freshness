"""Compatibility launcher for the Streamlit backend app."""

import runpy


if __name__ == "__main__":
    runpy.run_module("backend.app", run_name="__main__")
