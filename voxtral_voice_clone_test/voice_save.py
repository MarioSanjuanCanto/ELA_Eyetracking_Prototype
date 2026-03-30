import base64
from pathlib import Path
from mistralai.client import Mistral
from dotenv import load_dotenv
import os

load_dotenv()

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

sample_audio_b64 = base64.b64encode(Path("reference.wav").read_bytes()).decode()

voice = client.audio.voices.create(
    name="FranVivo",
    sample_audio=sample_audio_b64,
    sample_filename="reference.wav",
    languages=["es"],
    gender="male",
)

print(f"Created voice: {voice.id}")
print(f"Name: {voice.name}")
print(f"Languages: {voice.languages}")