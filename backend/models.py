from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class DefectRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    caption: str
    label: str
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.now)
    image_path: Optional[str] = None
    room: Optional[str] = Field(default="General")
    severity: Optional[str] = Field(default="Low")
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
