import sqlite3
import uuid
import os
import shutil

class ReferenceManager:
    def __init__(self, db_path="data/patients.sqlite", storage_dir="data/recordings"):
        print("[db][ReferenceManager] Initializing...")
        self.db_path = db_path
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS recordings (
                    id TEXT PRIMARY KEY,
                    patient_name TEXT,
                    transcription TEXT,
                    audio_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

    def add_reference(self, patient_name, original_audio_path, transcription):
        print("[db][add_reference] Adding reference...")
        # 1. Generar ID único
        rec_id = str(uuid.uuid4())
        filename = f"{rec_id}.wav"
        dest_path = os.path.join(self.storage_dir, filename)

        # 2. Copiar archivo al almacenamiento centralizado
        shutil.copy(original_audio_path, dest_path)

        # 3. Guardar metadatos en DB
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO recordings (id, patient_name, transcription, audio_path) VALUES (?, ?, ?, ?)",
                (rec_id, patient_name, transcription, dest_path)
            )
        return rec_id

    def get_patient_records(self, patient_name):
        print("[db][get_patient_records] Getting patient records...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM recordings WHERE patient_name = ?", (patient_name,))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_id_records(self, id):
        print("[db][get_id_records] Getting id records...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM recordings WHERE id = ?", (id,))
            return dict(cursor.fetchone())

    def list_information(self):
        print("[db][list_information] Listing information...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM recordings")
            return [dict(row) for row in cursor.fetchall()]