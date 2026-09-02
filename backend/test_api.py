import urllib.request
import json

BASE_URL = "http://127.0.0.1:8008/api"

def test_endpoints():
    endpoints = [
        "/health",
        "/dashboard/summary",
        "/locations",
        "/transport-legs",
        "/shipments",
        "/inventory",
        "/personnel",
        "/emergencies"
    ]

    print("--- TESTING ALL FASTAPI REST ENDPOINTS ---")
    for ep in endpoints:
        url = BASE_URL + ep
        try:
            req = urllib.request.urlopen(url)
            data = json.loads(req.read().decode('utf-8'))
            print(f"[OK] GET {ep} - Status {req.status} - Items/Keys: {len(data) if isinstance(data, (list, dict)) else 'OK'}")
        except Exception as e:
            print(f"[FAIL] GET {ep} - Error: {e}")

if __name__ == "__main__":
    test_endpoints()
