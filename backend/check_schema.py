import sqlite3
import os

def check_and_migrate():
    # Prioritize backend/database.db or check all that have tables
    potential_paths = ['backend/database.db', 'database.db']
    valid_db_path = None
    
    for p in potential_paths:
        if os.path.exists(p):
            try:
                temp_conn = sqlite3.connect(p)
                temp_curr = temp_conn.cursor()
                temp_curr.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='defectrecord';")
                if temp_curr.fetchone():
                    valid_db_path = p
                    temp_conn.close()
                    break
                temp_conn.close()
            except:
                pass
                
    if not valid_db_path:
        print("❌ Could not find a database with 'defectrecord' table.")
        print(f"Checked: {potential_paths}")
        return

    print(f"📂 Found active database at: {valid_db_path}")
    conn = sqlite3.connect(valid_db_path)
    cursor = conn.cursor()
    
    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"📋 Tables: {tables}")
    
    table_name = 'defectrecord'
    if 'defectrecord' not in tables:
        if 'DefectRecord' in tables:
            table_name = 'DefectRecord'
        elif 'defect_record' in tables:
            table_name = 'defect_record'
        else:
            print("❌ defectrecord table not found")
            return

    # Check columns
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [info[1] for info in cursor.fetchall()]
    print(f"🔍 Current columns in {table_name}: {columns}")
    
    if 'severity' not in columns:
        print("⚠️ 'severity' column missing! Adding it now...")
        try:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN severity VARCHAR DEFAULT 'Low'")
            conn.commit()
            print("✅ Added 'severity' column.")
        except Exception as e:
            print(f"❌ Error adding column: {e}")
    else:
        print("✅ 'severity' column already exists.")
        
    conn.close()

if __name__ == "__main__":
    check_and_migrate()
