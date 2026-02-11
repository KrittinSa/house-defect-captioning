import os
import re
from fpdf import FPDF
import config

def contains_thai(text):
    return bool(re.search('[\u0e00-\u0e7f]', str(text)))

class DefectReportPDF(FPDF):
    def header(self):
        # Add logo or title
        font_name = "ThaiFont" if "ThaiFont" in self.fonts else "Arial"
        self.set_font(font_name, "B", 16)
        self.cell(0, 10, "House Defect Inspection Report", ln=True, align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        font_name = "ThaiFont" if "ThaiFont" in self.fonts else "Arial"
        self.set_font(font_name, "", 8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

def generate_defect_pdf(report_items, output_path):
    """
    report_items: List of dictionaries { 'image': PIL.Image, 'caption': str, 'room': str, 'severity': str }
    """
    pdf = DefectReportPDF()
    pdf.alias_nb_pages()
    # Disable auto-page-break for precise grid control
    pdf.set_auto_page_break(auto=False)
    
    # Load Thai Font from config (Sarabun is recommended as it has Latin support)
    font_path = config.FONT_PATH
    font_name = "ThaiFont"
    if os.path.exists(font_path):
        pdf.add_font(font_name, "", font_path)
        pdf.add_font(font_name, "B", font_path)
        pdf.add_font(font_name, "I", font_path)
    else:
        print(f"⚠️ Font not found at {font_path}. Falling back to Arial.")
        font_name = "Arial"

    pdf.add_page()
    
    # Grid Settings (6 items per page: 2 cols x 3 rows)
    margin = 10
    col_width = 90
    img_w = 85
    img_h = 60 
    row_height = 85 
    items_per_page = 6
    cols = 2
    
    start_y = 25
    
    for i, item in enumerate(report_items):
        # Calculate grid position relative to the page
        item_in_page = i % items_per_page
        col = item_in_page % cols
        row = item_in_page // cols
        
        # New page trigger
        if i > 0 and item_in_page == 0:
            pdf.add_page()
            
        x = margin + (col * (col_width + 10))
        y = start_y + (row * row_height)
        
        # 1. Defect Label
        pdf.set_xy(x, y)
        pdf.set_font(font_name, "B", 10)
        pdf.cell(col_width, 5, f"Defect #{i+1}", ln=False)
        
        # 2. Image
        img = item['image'].copy()
        w, h = img.size
        target_ratio = img_w / img_h
        current_ratio = w / h
        
        if current_ratio > target_ratio:
            new_w = h * target_ratio
            left = (w - new_w) / 2
            img = img.crop((left, 0, w - left, h))
        else:
            new_h = w / target_ratio
            top = (h - new_h) / 2
            img = img.crop((0, top, w, h - top))
            
        temp_img_path = f"outputs/temp_pdf_{i}.jpg"
        os.makedirs("outputs", exist_ok=True)
        img.save(temp_img_path)
        
        pdf.image(temp_img_path, x=x, y=y+6, w=img_w, h=img_h)
        
        # 3. Room & Severity Tags
        pdf.set_xy(x, y + img_h + 8)
        room = item.get('room', 'General')
        severity = item.get('severity', 'Low')
        
        # Room tag
        pdf.set_font(font_name, "B", 8)
        pdf.set_text_color(100, 100, 100) # Gray
        pdf.cell(pdf.get_string_width(f"Room: {room}") + 2, 4, f"Room: {room}", ln=False)
        
        # Severity tag
        pdf.set_font(font_name, "B", 8)
        if severity == "High":
             pdf.set_text_color(200, 0, 0)
        elif severity == "Medium":
             pdf.set_text_color(200, 100, 0)
        else:
             pdf.set_text_color(0, 150, 0)
             
        # Print "Severity: {severity}"
        label = f"Severity: {severity}"
        pdf.set_x(x + img_w - pdf.get_string_width(label))
        pdf.cell(0, 4, label, ln=True)
        
        # 4. Caption
        pdf.set_xy(x, y + img_h + 13)
        pdf.set_text_color(0, 0, 0) # Reset to black
        pdf.set_font(font_name, "", 9)
        pdf.multi_cell(img_w, 4, f"{item['caption']}")
        
        # Clean up
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

    pdf.output(output_path)
    return output_path
