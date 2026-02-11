
import requests
import json

BASE_URL = "http://localhost:8000"

def test_update_defect():
    # 1. Get all defects to find an ID
    response = requests.get(f"{BASE_URL}/defects")
    defects = response.json()
    if not defects:
        print("No defects found to test update.")
        return

    target_id = defects[0]['id']
    original_room = defects[0].get('room', 'Unknown')
    print(f"Testing update for defect ID: {target_id} (Original Room: {original_room})")

    # 2. Update the room
    new_room = "Bathroom" if original_room != "Bathroom" else "Kitchen"
    update_data = {"room": new_room, "caption": "Updated Caption from Test"}
    
    patch_response = requests.patch(f"{BASE_URL}/defects/{target_id}", json=update_data)
    
    if patch_response.status_code == 200:
        updated_defect = patch_response.json()
        print(f"Update Success! New Room: {updated_defect['room']}, New Caption: {updated_defect['caption']}")
        if updated_defect['room'] == new_room:
            print("Verification PASSED")
        else:
            print("Verification FAILED (Room mismatch)")
    else:
        print(f"Update Failed. Status Code: {patch_response.status_code}")
        print(patch_response.text)

if __name__ == "__main__":
    test_update_defect()
