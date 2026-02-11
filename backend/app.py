import os
import io
import torch
import json
import shutil
from typing import List
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# Local imports
import config
from engine import ImageCaptioningEngine
from pdf_generator import generate_defect_pdf
from database import create_db_and_tables, get_session
from models import DefectRecord, Project

# SQLModel
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

# Setup Uploads Directory
UPLOADS_DIR = os.path.join(config.BACKEND_DIR, "outputs", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="House Defect AI Service", lifespan=lifespan)

# Mount static files for image access
app.mount("/static", StaticFiles(directory=os.path.join(config.BACKEND_DIR, "outputs")), name="static")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine
print("⏳ Loading AI Model into memory...")
engine = ImageCaptioningEngine()

# --- API Endpoints ---

@app.get("/status")
def status():
    return {
        "status": "online", 
        "model": "ViT-GPT2 Thai",
        "device": config.DEVICE
    }

# --- Project CRUD ---

@app.get("/projects", response_model=List[Project])
def get_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()

@app.post("/projects", response_model=Project)
def create_project(project: Project, session: Session = Depends(get_session)):
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Optional: Delete associated defects or cascade?
    # For now, defects might become orphaned or you can cascade delete
    # Ideally should cascade delete defects first
    statement = select(DefectRecord).where(DefectRecord.project_id == project_id)
    defects = session.exec(statement).all()
    for d in defects:
        session.delete(d)
        
    session.delete(project)
    session.commit()
    return {"success": True, "message": "Project and its defects deleted"}

# --- Defect Operations ---

@app.post("/predict")
async def predict(
    project_id: int = Form(...), # Require project_id
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    try:
        # Check project validity
        project = session.get(Project, project_id)
        if not project:
             raise HTTPException(status_code=404, detail="Project not found")

        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Save image to disk
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        save_path = os.path.join(UPLOADS_DIR, safe_filename)
        
        with open(save_path, "wb") as f:
            f.write(image_data)
        
        # Preprocess & Generate
        caption = engine.predict(image)
        
        # Create Database Record
        label = "detected_defect" 
        confidence = 0.95
        
        defect = DefectRecord(
            filename=file.filename,
            caption=caption,
            label=label,
            confidence=confidence,
            image_path=f"uploads/{safe_filename}", # Relative to static mount
            room="General",
            severity="Low",
            project_id=project_id
        )
        session.add(defect)
        session.commit()
        session.refresh(defect)
        
        return {
            "success": True,
            "id": defect.id,
            "filename": defect.filename,
            "caption": defect.caption,
            "label": defect.label,
            "confidence": defect.confidence,
            "image_url": f"/static/uploads/{safe_filename}",
            "timestamp": defect.timestamp,
            "project_id": defect.project_id
        }
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        if isinstance(e, HTTPException):
            raise e
        return {"success": False, "error": str(e)}

@app.get("/defects", response_model=List[DefectRecord])
def get_defects(
    project_id: int = None, # Optional filter
    session: Session = Depends(get_session)
):
    query = select(DefectRecord).order_by(DefectRecord.timestamp.desc())
    if project_id:
        query = query.where(DefectRecord.project_id == project_id)
        
    defects = session.exec(query).all()
    return defects

@app.delete("/defects/{defect_id}")
def delete_defect(defect_id: int, session: Session = Depends(get_session)):
    defect = session.get(DefectRecord, defect_id)
    if not defect:
        raise HTTPException(status_code=404, detail="Defect not found")
    
    # Optional: Delete file from disk
    if defect.image_path:
        full_path = os.path.join(config.BACKEND_DIR, "outputs", defect.image_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            
    session.delete(defect)
    session.commit()
    return {"success": True, "message": "Defect deleted"}

@app.patch("/defects/{defect_id}", response_model=DefectRecord)
def update_defect(
    defect_id: int, 
    updates: dict, 
    session: Session = Depends(get_session)
):
    defect = session.get(DefectRecord, defect_id)
    if not defect:
        raise HTTPException(status_code=404, detail="Defect not found")
    
    # Update fields
    for key, value in updates.items():
        if hasattr(defect, key):
            setattr(defect, key, value)
    
    session.add(defect)
    session.commit()
    session.refresh(defect)
    return defect

@app.post("/generate-report")
async def generate_report(
    files: List[UploadFile] = File(...),
    metadata: str = Form(...)
):
    try:
        # Parse metadata JSON
        # Expected format: [ { "caption": "...", "room": "...", "severity": "..." }, ... ]
        meta_list = json.loads(metadata)
        
        report_items = []
        
        # Ensure we process up to the minimum length of files or metadata
        count = min(len(files), len(meta_list))
        
        for i in range(count):
            file = files[i]
            meta = meta_list[i]
            
            # Read and convert image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            
            report_items.append({
                "image": image,
                "caption": meta.get("caption", ""),
                "room": meta.get("room", "Unknown"),
                "severity": meta.get("severity", "Low")
            })
            
        # Generate PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"DefectReport_{timestamp}.pdf"
        output_path = os.path.join(config.BACKEND_DIR, "reports", output_filename)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        generate_defect_pdf(report_items, output_path)
        
        # Return as downloadable file
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=output_filename
        )

    except Exception as e:
        print(f"❌ Report Generation Error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/generate-report-db")
async def generate_report_db(
    defect_ids: List[int],
    session: Session = Depends(get_session)
):
    try:
        # Fetch defects from DB
        statement = select(DefectRecord).where(DefectRecord.id.in_(defect_ids)).order_by(DefectRecord.timestamp.desc())
        defects = session.exec(statement).all()
        
        if not defects:
            raise HTTPException(status_code=404, detail="No defects found for the given IDs")

        report_items = []
        
        for defect in defects:
            # Construct full image path
            # defect.image_path is like "uploads/xyz.jpg" relative to "outputs/"
            if not defect.image_path:
                continue
                
            full_path = os.path.join(config.BACKEND_DIR, "outputs", defect.image_path)
            
            if os.path.exists(full_path):
                try:
                    image = Image.open(full_path).convert("RGB")
                    report_items.append({
                        "image": image,
                        "caption": defect.caption,
                        "room": defect.room or "Unknown",
                        "severity": defect.severity or "Low"
                    })
                except Exception as img_err:
                    print(f"⚠️ Error loading image {full_path}: {img_err}")
            else:
                 print(f"⚠️ Image file missing: {full_path}")

        if not report_items:
             raise HTTPException(status_code=400, detail="Could not load any valid images for the report")

        # Generate PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"DefectReport_Selected_{timestamp}.pdf"
        output_path = os.path.join(config.BACKEND_DIR, "reports", output_filename)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        generate_defect_pdf(report_items, output_path)
        
        # Return as downloadable file
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=output_filename
        )

    except Exception as e:
        print(f"❌ DB Report Generation Error: {e}")
        # If it's already an HTTPException, re-raise it
        if isinstance(e, HTTPException):
            raise e
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
