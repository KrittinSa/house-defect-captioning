from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel

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
