import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import io
from PIL import Image

from app import app, get_session
from models import DefectRecord

def create_dummy_image():
    img = Image.new('RGB', (10, 10), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

# Setup in-memory database for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_defect(client: TestClient):
    # Mock file upload
    img_content = create_dummy_image()
    files = {'file': ('test.jpg', img_content, 'image/jpeg')}
    response = client.post("/predict", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "id" in data
    assert data["filename"] == "test.jpg"
    
    # Verify it exists in DB via API
    response = client.get("/defects")
    assert response.status_code == 200
    defects = response.json()
    assert len(defects) == 1
    assert defects[0]["filename"] == "test.jpg"

def test_delete_defect(client: TestClient):
    # Create a defect first
    img_content = create_dummy_image()
    files = {'file': ('delete_me.jpg', img_content, 'image/jpeg')}
    client.post("/predict", files=files)
    
    # Get ID
    response = client.get("/defects")
    defects = response.json()
    defect_id = defects[0]["id"]
    
    # Delete
    response = client.delete(f"/defects/{defect_id}")
    assert response.status_code == 200
    
    # Verify gone
    response = client.get("/defects")
    defects = response.json()
    assert len(defects) == 0
