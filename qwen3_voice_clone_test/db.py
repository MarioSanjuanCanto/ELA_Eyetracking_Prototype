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

            conn.execute("""
                CREATE TABLE IF NOT EXISTS prosody (
                    patient_id TEXT PRIMARY KEY,
                    prosody_prompt TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patient_id) REFERENCES recordings(id)
                )
            """)

    # __________________ recordings table __________________
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
        print("[db][add_reference] Reference added.")
        return rec_id

    def remove_reference_by_id(self, id):
        print("[db][remove_reference_by_id] Removing reference...")
        # Remove reference from DB
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM recordings WHERE id = ?", (id,))
        # Remove audio file
        os.remove(os.path.join(self.storage_dir, f"{id}.wav"))
        print("[db][remove_reference_by_id] Reference removed.")

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

    def list_patients(self):
        print("[db][list_patients] Listing patients...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM recordings")
            return [dict(row) for row in cursor.fetchall()]

    def update_reference(self, id, patient_name, transcription, audio_path):
        print("[db][update_reference] Updating reference...")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE recordings SET patient_name = ?, transcription = ?, audio_path = ? WHERE id = ?",
                (patient_name, transcription, audio_path, id)
            )
        print("[db][update_reference] Reference updated.")

    # __________________ prosody table __________________
    
    def add_prosody(self, patient_id, prosody_prompt):
        print("[db][add_prosody] Adding prosody...")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO prosody (patient_id, prosody_prompt) VALUES (?, ?)",
                (patient_id, prosody_prompt)
            )
        print("[db][add_prosody] Prosody added.")

    def get_prosody(self, patient_id):
        print("[db][get_prosody] Getting prosody...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM prosody WHERE patient_id = ?", (patient_id,))
            return dict(cursor.fetchone())

    def remove_prosody(self, patient_id):
        print("[db][remove_prosody] Removing prosody...")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM prosody WHERE patient_id = ?", (patient_id,))
        print("[db][remove_prosody] Prosody removed.")

    def list_prosody(self):
        print("[db][list_prosody] Listing prosody...")
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM prosody")
            return [dict(row) for row in cursor.fetchall()]

    def update_prosody(self, patient_id, prosody_prompt):
        print("[db][update_prosody] Updating prosody...")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE prosody SET prosody_prompt = ? WHERE patient_id = ?",
                (prosody_prompt, patient_id)
            )
        print("[db][update_prosody] Prosody updated.")


