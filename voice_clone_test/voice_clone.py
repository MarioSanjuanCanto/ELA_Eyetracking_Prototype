import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel
import uuid
import os
import gc
import utils.emotions as emotions
import subprocess
import db

# _________________________ Voice Clone Functionality _________________________ 

def play_audio(file_path):
    '''
    Play an audio in an exact path
    '''
    print("[voice_clone][play_audio] Playing audio...")
    subprocess.run(["afplay", file_path])

def load_Qwen_model():
    '''
    Load Qwen voice clone model
    '''
    print("[voice_clone][load_Qwen_model] Loading model...")
    return Qwen3TTSModel.from_pretrained(
        "./models/Qwen3-TTS-12Hz-1.7B-Base",
        device_map="mps",
        dtype=torch.float16
    )

def generate_prompt(model, ref_audio: str, ref_text: str):
    '''
    Generate prompt for voice clone
    '''
    print("[voice_clone][generate_prompt] Generating prompt...")
    with torch.inference_mode():
        prompt_items = model.create_voice_clone_prompt(
            ref_audio=ref_audio,
            ref_text=ref_text,
            x_vector_only_mode=False,
        )
    return prompt_items

def generate_audio(text, language, model, prompt_items):
    '''
    Generate audio from text
    '''
    print("[voice_clone][generate_audio] Generating audio...")
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    with torch.inference_mode():
        wavs, sr = model.generate_voice_clone(
            text=text,
            language=language,
            voice_clone_prompt=prompt_items,
        )

    name = f"voice_{uuid.uuid4()}.wav"
    path = os.path.join(output_dir, name)
    sf.write(path, wavs[0], sr)

    del wavs
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()

    return path

def clear_runtime_memory():
    '''
    Clear the AI cache
    '''
    print("[voice_clone][clear_runtime_memory] Clearing memory...")
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
    print("[voice_clone][clear_runtime_memory] Done.")

# _________________________ Emotions Test _________________________ 

def emotions_test(audio_path, audio_transcription):
    '''
    Test adding emotions to text
    '''
    print("[voice_clone][emotions_test] Starting emotions test...")
    model = load_Qwen_model()
    print("[voice_clone][emotions_test] Generating prompt")
    prompt_items = generate_prompt(model, audio_path, audio_transcription)
    print("[voice_clone][emotions_test] Generating prompt with emotions")
    text_with_emotions = emotions.get_debug_examples(audio_transcription)
    for emotion, text in text_with_emotions.items():
        print("[emotion_test] Generando audio con emoción: ", emotion, " / ", text)
        path = generate_audio(text, "Spanish", model, prompt_items)
        play_audio(path)

# _________________________ Debug Functions _________________________ 
def debug_generate_audio(patient_name, text):
    '''
    Generate audio for debugging
    '''
    print("[voice_clone][debug_generate_audio] Starting debug generate audio...")
    model = load_Qwen_model()
    ref = db.ReferenceManager()
    data = ref.get_patient_records(patient_name)[0]
    prompt_items = generate_prompt(model, data["audio_path"], data["transcription"])
    audio_path = generate_audio(text, "Spanish", model, prompt_items)
    play_audio(audio_path)

if __name__ == "__main__":
    #debug_generate_audio("Fran Vivó", "Este es un audio de prueba, a ver que tal sale")
    clear_runtime_memory()
   

    