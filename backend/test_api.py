import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"

def test_persistence():
    # 1. Get a defect
    print("Fetching defects...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/defects")
        with urllib.request.urlopen(req) as response:
            data = response.read()
            defects = json.loads(data)
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
        
    if not defects:
        print("⚠️ No defects found to test.")
        return
        
    target_defect = defects[0]
    defect_id = target_defect['id']
    print(f"Testing on Defect ID: {defect_id} (Current Severity: {target_defect.get('severity')})")
    
    # 2. Update Severity
    new_severity = "Critical" if target_defect.get('severity') != "Critical" else "Low"
    print(f"Attempting to update severity to: {new_severity}")
    
    data = json.dumps({"severity": new_severity}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/defects/{defect_id}",
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                print(f"❌ Update failed: {response.status}")
                return
            print("✅ Update request successful.")
    except Exception as e:
        print(f"❌ Update error: {e}")
        return
    
    # 3. Verify Persistence
    print("Verifying persistence...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/defects")
        with urllib.request.urlopen(req) as response:
            data = response.read()
            defects = json.loads(data)
            updated_defect = next((d for d in defects if d['id'] == defect_id), None)
            
            if updated_defect:
                print(f"Updated Severity: {updated_defect.get('severity')}")
                if updated_defect.get('severity') == new_severity:
                    print("🎉 SUCCESS: Severity persisted correctly!")
                else:
                    print("❌ FAILURE: Severity reverted or did not update.")
            else:
                print("❌ Could not find defect after update.")
    except Exception as e:
        print(f"❌ Verification error: {e}")

if __name__ == "__main__":
    test_persistence()
