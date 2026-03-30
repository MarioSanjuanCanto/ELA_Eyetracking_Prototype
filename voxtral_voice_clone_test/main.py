import base64
from pathlib import Path
from mistralai.client import Mistral
from dotenv import load_dotenv
import os

load_dotenv()


client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

response = client.audio.speech.complete(
    model="voxtral-mini-tts-2603",
    input="Hola, soy Fran, tu asistente virtual. Estoy aquí para ayudarte en lo que necesites.",
    voice_id="en_paul_neutral",
    response_format="mp3",
)

Path("output.mp3").write_bytes(base64.b64decode(response.audio_data))
print("Saved to output.mp3")