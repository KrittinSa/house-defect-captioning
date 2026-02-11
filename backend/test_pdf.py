# /// script
# dependencies = [
#     "fpdf2",
#     "pillow",
# ]
# ///

from pdf_generator import generate_defect_pdf
from PIL import Image
import os
import shutil

# Create dummy image
img = Image.new('RGB', (100, 100), color = 'red')

# Dummy items
items = [
    {
        'image': img,
        'caption': 'ทดสอบภาษาไทย Test Caption',
        'room': 'Living Room',
        'severity': 'High'
    }
]

print("Generating PDF...")
try:
    output_path = "test_output.pdf"
    generate_defect_pdf(items, output_path)
    print(f"PDF Generated successfully at {output_path}")
    
    # Clean up
    # if os.path.exists(output_path):
    #     os.remove(output_path)
    if os.path.exists("outputs"):
        shutil.rmtree("outputs")
        
except Exception as e:
    print(f"Error: {e}")
