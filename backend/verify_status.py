import sqlite3
import json
import urllib.request

def check_db():
    conn = sqlite3.connect('backend/polarlogix.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [t[0] for t in c.fetchall()]
    print("=== SQLITE DATABASE (polarlogix.db) ROW COUNTS ===")
    counts = {}
    for table in sorted(tables):
        count = c.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        counts[table] = count
        print(f"  * {table}: {count} rows")
    return counts

def check_api():
    base_url = "http://127.0.0.1:8008/api"
    endpoints = [
        ("Health Check", "/health"),
        ("Dashboard Summary", "/dashboard/summary"),
        ("Locations", "/locations"),
        ("Transport Legs", "/transport-legs"),
        ("Cargo Shipments", "/shipments"),
        ("Inventory Items", "/inventory"),
        ("Personnel Records", "/personnel"),
        ("Emergency Events", "/emergencies")
    ]
    print("\n=== API ENDPOINT RESPONSES (http://127.0.0.1:8008/api) ===")
    for label, path in endpoints:
        try:
            req = urllib.request.urlopen(f"{base_url}{path}")
            raw = req.read().decode('utf-8')
            data = json.loads(raw)
            if isinstance(data, list):
                print(f"  [OK] GET {path:20} -> Status {req.status} | Returned {len(data)} items")
                for item in data[:3]:
                    identifier = item.get('id') or item.get('code') or item.get('name')
                    desc = item.get('description') or item.get('item_name') or item.get('name') or item.get('event_type')
                    extra = f" (status: {item.get('status')})" if 'status' in item else ""
                    print(f"       -> [{identifier}] {desc}{extra}")
                if len(data) > 3:
                    print(f"       -> ... and {len(data) - 3} more items")
            elif isinstance(data, dict):
                print(f"  [OK] GET {path:20} -> Status {req.status} | Data: {json.dumps(data)}")
        except Exception as e:
            print(f"  [FAIL] GET {path:20} -> Error: {e}")

if __name__ == "__main__":
    check_db()
    check_api()
