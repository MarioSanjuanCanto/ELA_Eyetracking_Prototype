import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel
import uuid
import os
import gc
import utils.emotions as emotions
import utils.prosody as prosody
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

def generate_audio(text, language, model, prompt_items, name=""):
    '''
    Generate audio from text
    '''
    print(f"[voice_clone][generate_audio] Generating audio... {text}")
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    with torch.inference_mode():
        wavs, sr = model.generate_voice_clone(
            text=text,
            language=language,
            voice_clone_prompt=prompt_items,
        )

    if name == "" or name is None:
        name = f"voice_{uuid.uuid4()}.wav"
    else:
        name = name + ".wav"

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

# _________________________ Access to Database _________________________ 

def add_reference(patient_name, audio_path, transcription):
    print("[voice_clone][add_reference] Adding reference...")
    ref = db.ReferenceManager()
    ref.add_reference(patient_name, audio_path, transcription)
    print("[voice_clone][add_reference] Reference added.")

def get_reference(patient_name):
    print("[voice_clone][get_reference] Getting reference...")
    ref = db.ReferenceManager()
    return ref.get_patient_records(patient_name)

def list_references():
    print("[voice_clone][list_references] Listing references...")
    ref = db.ReferenceManager()

    result = ref.list_patients()

    for i, patient in enumerate(result):
        print("[" + str(i) + "] : " + patient["id"] + " - " + patient["patient_name"])

    return result

def delete_reference(id):
    print("[voice_clone][delete_reference] Deleting reference...")
    ref = db.ReferenceManager()
    ref.remove_reference_by_id(id)
    print("[voice_clone][delete_reference] Reference deleted.")

def update_reference(id, patient_name, transcription, audio_path):
    print("[voice_clone][update_reference] Updating reference...")
    ref = db.ReferenceManager()
    ref.update_reference(id, patient_name, transcription, audio_path)
    print("[voice_clone][update_reference] Reference updated.")

def add_prosody(patient_id, prosody_prompt):
    print("[voice_clone][add_prosody] Adding prosody...")
    ref = db.ReferenceManager()
    ref.add_prosody(patient_id, prosody_prompt)
    print("[voice_clone][add_prosody] Prosody added.")

def get_prosody(patient_id):
    print("[voice_clone][get_prosody] Getting prosody...")
    ref = db.ReferenceManager()
    return ref.get_prosody(patient_id)

def list_prosodies():
    print("[voice_clone][list_prosodies] Listing prosodies...")
    ref = db.ReferenceManager()
    result = ref.list_prosody()
    for i, prosody in enumerate(result):
        print("[" + str(i) + "] : " + prosody["patient_id"] + " - " + prosody["prosody_prompt"])
    return result

def update_prosody(patient_id, prosody_prompt):
    print("[voice_clone][update_prosody] Updating prosody...")
    ref = db.ReferenceManager()
    ref.update_prosody(patient_id, prosody_prompt)
    print("[voice_clone][update_prosody] Prosody updated.")

def remove_prosody(patient_id):
    print("[voice_clone][remove_prosody] Removing prosody...")
    ref = db.ReferenceManager()
    ref.remove_prosody(patient_id)
    print("[voice_clone][remove_prosody] Prosody removed.")

# _________________________ Emotions Test _________________________ 

def emotions_test(patient_name, text):
    '''
    Test adding emotions to text
    '''
    print("[voice_clone][emotions_test] Starting emotions test...")
    model = load_Qwen_model()
    print("[voice_clone][emotions_test] Generating prompt")
    ref = db.ReferenceManager()
    data = ref.get_patient_records(patient_name)[0]
    prompt_items = generate_prompt(model, data["audio_path"], data["transcription"])
    print("[voice_clone][emotions_test] Generating prompt with emotions")
    text_with_emotions = emotions.get_debug_examples(text)
    for rhythm, text in text_with_emotions.items():
        print("[emotion_test] Generando audio con emoción: ", rhythm, " / ", text)
        path = generate_audio(text, "Spanish", model, prompt_items)
        play_audio(path)

# _________________________ Debug Functions _________________________ 

def debug_generate_audio(model, patient_name, language ,text, name=""):
    '''
    Generate audio for debugging
    '''
    print("[voice_clone][debug_generate_audio] Starting debug generate audio...")
    ref = db.ReferenceManager()
    data = ref.get_patient_records(patient_name)[0]
    prompt_items = generate_prompt(model, data["audio_path"], data["transcription"])
    audio_path = generate_audio(text, language, model, prompt_items, name)
    play_audio(audio_path)

if __name__ == "__main__":
    model = load_Qwen_model()
    
    input_text = "Hola, estoy un poco preocupado porque tengo una enfermedad rara, pero para nada quiero dejar todo sin intentar solucionarlo."
    output = emotions.apply_rhythm(input_text, "Medio") 
    print("Emotions: " + str(output))

    debug_generate_audio(model, "Fran Vivó", "Spanish", input_text, "Fran_test_6")
    debug_generate_audio(model, "Fran Vivó", "Spanish", output, "Fran_test_7")

    

'''
[0] : 4b9d2428-84b0-4503-8a7e-899bfeab1b13 - Fran Vivó
[1] : 1bc3ee7b-09bf-41cb-ab6e-e0172f57bd11 - Nuria López
[2] : 48679e79-cc08-4e7b-9b52-6b3f6118910d - Fran Vivó Valenciano
'''


'''
NURIA PROSODIA LENTO:
    prosody_prompt = get_prosody("1bc3ee7b-09bf-41cb-ab6e-e0172f57bd11").get("prosody_prompt","")
    output = prosody.apply_prosody("Hola amiga, estoy un poco preocupada porque tengo una enfermedad rara, pero para nada quiero dejar todo sin intentar solucionarlo.", prosody_prompt, model="gpt-5.1")
    print("Prosody: " + str(output))
    output = emotions.apply_rhythm(output, "Medio") 
    print("Emotions: " + str(output))
    debug_generate_audio(model, "Nuria López", "Spanish", output, "Nuria_test_5")
'''
