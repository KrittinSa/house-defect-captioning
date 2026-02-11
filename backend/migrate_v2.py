
from sqlmodel import SQLModel, Session, select
from models import Project, DefectRecord
from database import engine
import sqlalchemy

def migrate():
    print("🚀 Starting Migration V2: Multi-Project")
    
    # 1. Create new table (Project)
    # create_all will create Project table if it doesn't exist
    SQLModel.metadata.create_all(engine)
    print("✅ Created 'project' table")
    
    with Session(engine) as session:
        # 2. Ensure Default Project Exists
        default_project = session.exec(select(Project).where(Project.name == "Default Project")).first()
        if not default_project:
            default_project = Project(name="Default Project", address="Main Site")
            session.add(default_project)
            session.commit()
            session.refresh(default_project)
            print(f"✅ Created Default Project (ID: {default_project.id})")
        else:
            print(f"ℹ️ Default Project already exists (ID: {default_project.id})")
            
        default_project_id = default_project.id

    # 3. Alter existing table (DefectRecord) to add column
    # SQLite ALTER TABLE works for adding columns
    with engine.connect() as connection:
        try:
            # Check if column exists is hard in raw SQL per db type, so we try adding it.
            # If it fails, likely it exists.
            connection.execute(sqlalchemy.text("ALTER TABLE defectrecord ADD COLUMN project_id INTEGER REFERENCES project(id)"))
            print("✅ Added 'project_id' column to 'defectrecord'")
        except Exception as e:
             if "duplicate column" in str(e) or "no such table" not in str(e): # simplistic check
                 print(f"ℹ️ 'project_id' column likely already exists or other error: {e}")

    # 4. Migrate Data (Update null project_ids)
    with Session(engine) as session:
        # SQLModel doesn't support update() directly on session usually, use exec with sqlalchemy statement
        statement = sqlalchemy.update(DefectRecord).where(DefectRecord.project_id == None).values(project_id=default_project_id)
        result = session.exec(statement)
        session.commit()
        print(f"✅ Assigned {result.rowcount} existing defects to Default Project")

    print("🎉 Migration V2 Complete!")

if __name__ == "__main__":
    migrate()
