# /// script
# dependencies = [
#     "requests",
#     "pillow",
# ]
# ///

import requests
import json
import os
from PIL import Image
import io

# Configuration
API_URL = "http://localhost:8000/generate-report"
OUTPUT_PDF = "api_test_output.pdf"

def create_dummy_image():
    img = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_generate_report():
    print("🚀 Testing /generate-report endpoint...")
    
    # Create dummy images
    img1 = create_dummy_image()
    img2 = create_dummy_image()
    
    # Prepare payload
    files = [
        ('files', ('image1.jpg', img1, 'image/jpeg')),
        ('files', ('image2.jpg', img2, 'image/jpeg'))
    ]
    
    metadata = [
        {"caption": "ทดสอบภาษาไทย 1", "room": "Living Room", "severity": "High"},
        {"caption": "Testing English 2", "room": "Bedroom", "severity": "Low"}
    ]
    
    data = {
        "metadata": json.dumps(metadata)
    }
    
    try:
        response = requests.post(API_URL, files=files, data=data)
        
        if response.status_code == 200:
            with open(OUTPUT_PDF, 'wb') as f:
                f.write(response.content)
            print(f"✅ Success! PDF saved to {OUTPUT_PDF}")
            # Check file size
            size = os.path.getsize(OUTPUT_PDF)
            print(f"📄 File size: {size} bytes")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Should run the server first! (uvicorn backend.app:app --reload)")

if __name__ == "__main__":
    test_generate_report()
