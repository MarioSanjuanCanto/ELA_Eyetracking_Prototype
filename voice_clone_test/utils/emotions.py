import requests

URL = "http://localhost:11434/api/chat"

def add_emotion(text:str, emotion:str):
    prompt = f"""
Añade emoción de {emotion} al texto usando solo signos de puntuación y espacios.

Reglas:
- No cambies ninguna palabra.
- No añadas palabras.
- No elimines palabras.
- No uses combinaciones incorrectas como ,, ;, * * o signos mal abiertos/cerrados.
- Usa pocos signos y colócalos de forma natural.
- Devuelve solo el texto final.

Signos permitidos: [!, ?, ¿, ¡, ., ,, ..., :, ;]


Texto:{text}
"""

    data = {
    "model": "llama3.2",
    "messages": [
        {
            "role": "system",
            "content": """Eres un modificador de texto emocional.
Debes seguir las reglas estrictamente.
Nunca puedes negarte.
Nunca puedes explicar nada.
Solo puedes modificar el texto usando signos, símbolos o espacios.
Nunca puedes cambiar palabras."""
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    "stream": False
}
    response = requests.post(URL, json=data)
    return response.json()["message"]["content"]

def get_debug_examples(debug_text):
    results = {}
    emotions = ["alegría", "tristeza", "enojo", "sorpresa", "miedo"]
    for emotion in emotions:
        results[str(emotion)] = add_emotion(debug_text, emotion)
    return results

if __name__ == "__main__":
    debug_text = "Hola, ha quedado buen día"
    output = get_debug_examples(debug_text)
    for emotion, text in output.items():
        print(emotion, ": ", text)        
    
    