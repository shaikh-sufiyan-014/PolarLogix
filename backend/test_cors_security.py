import importlib
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
import main as main_module


def _get_client():
    importlib.reload(main_module)
    return TestClient(main_module.app)


def test_cors_config_has_no_wildcard_with_credentials():
    """Regression test for Bug #1 (doc Section 2): wildcard origin must never be combined with allow_credentials=True."""
    cors_middleware = None
    for m in main_module.app.user_middleware:
        if m.cls.__name__ == "CORSMiddleware":
            cors_middleware = m
            break
    assert cors_middleware is not None, "CORSMiddleware must be configured"

    kwargs = cors_middleware.kwargs
    allow_origins = kwargs.get("allow_origins", [])
    allow_credentials = kwargs.get("allow_credentials", False)

    assert allow_credentials is True, "Credential-bearing auth (Bearer JWT) requires allow_credentials=True"
    assert "*" not in allow_origins, (
        "Wildcard origin combined with allow_credentials=True is invalid under the CORS spec "
        "and reflects arbitrary origins — this is the Bug #1 regression the master doc says was fixed."
    )


def test_preflight_from_allowed_deployed_origin_is_accepted():
    """A browser preflight from a deployed Vercel origin must receive valid CORS headers."""
    client = _get_client()
    origin = "https://polarlogix-sih.vercel.app"
    resp = client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert resp.status_code in (200, 204), f"Preflight failed with {resp.status_code}"
    assert resp.headers.get("access-control-allow-origin") == origin
    assert "authorization" in resp.headers.get("access-control-allow-headers", "").lower()


def test_preflight_from_unknown_origin_is_rejected():
    """An origin not on the explicit allow-list must not receive an allow-origin header."""
    client = _get_client()
    origin = "https://evil-origin.example.com"
    resp = client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert resp.headers.get("access-control-allow-origin") != origin, (
        "Unknown origin must not be reflected by CORS policy."
    )


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            print(f"--- {name} ---")
            fn()
            print(f"[OK] {name} passed")
    print("All CORS security tests passed.")
