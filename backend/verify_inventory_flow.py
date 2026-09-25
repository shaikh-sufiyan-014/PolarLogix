import requests

BASE_URL = "http://127.0.0.1:8000"

def test_live_inventory():
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"username": "admin.ncpor", "password": "Demo@Admin2026"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch Bharati inventory
    inv_res = requests.get(f"{BASE_URL}/api/inventory?location_id=LOC-BHA", headers=headers)
    assert inv_res.status_code == 200
    items = inv_res.json()
    print(f"Total Bharati inventory items: {len(items)}")
    first_item = items[0]
    item_id = first_item["id"]
    old_qty = first_item["quantity"]
    old_min = first_item["minimum_threshold"]
    print(f"Original item: {item_id} '{first_item['item_name']}' - Qty: {old_qty}, Min: {old_min}")

    # Patch item to low stock (< minimum threshold)
    patch_res = requests.patch(f"{BASE_URL}/api/inventory/{item_id}", json={"quantity": old_min - 10}, headers=headers)
    assert patch_res.status_code == 200, f"Patch failed: {patch_res.text}"
    patched_data = patch_res.json()
    print(f"Successfully patched item: Qty updated to {patched_data['quantity']} (Threshold: {patched_data['minimum_threshold']}) -> Low Stock: {patched_data['quantity'] <= patched_data['minimum_threshold']}")

    # Create a temporary item and verify deletion with confirmation
    create_res = requests.post(
        f"{BASE_URL}/api/inventory/LOC-BHA",
        json={
            "location_id": "LOC-BHA",
            "item_name": "Temporary Test Item For Deletion",
            "category": "spare_parts",
            "quantity": 100.0,
            "unit": "units",
            "minimum_threshold": 10.0
        },
        headers=headers
    )
    assert create_res.status_code == 201
    temp_item_id = create_res.json()["id"]
    print(f"Created temporary item for deletion test: {temp_item_id}")

    del_res = requests.delete(f"{BASE_URL}/api/inventory/{temp_item_id}", headers=headers)
    assert del_res.status_code == 200, f"Delete failed: {del_res.text}"
    print(f"Successfully deleted temporary item: {del_res.json()}")

    # Restore item back to optimal
    restore_res = requests.patch(f"{BASE_URL}/api/inventory/{item_id}", json={"quantity": old_qty}, headers=headers)
    assert restore_res.status_code == 200
    print(f"Successfully restored item back to optimal level ({restore_res.json()['quantity']})")

if __name__ == "__main__":
    test_live_inventory()
