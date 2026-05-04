from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

def apply_rhythm(text: str, rhythm: str, model="gpt-4o-mini"):
    """
    Usa GPT para ajustar el ritmo del habla (Rápido, Medio, Lento) 
    usando SOLO espacios y signos de puntuación.
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""
Modifica el texto para controlar el ritmo de un modelo de síntesis de voz (TTS).
Ritmo deseado: {rhythm}

HERRAMIENTAS PERMITIDAS:
1. ESPACIOS: Puedes añadir espacios extra entre palabras para ralentizar.
2. SIGNOS: Usa '...', ',', '.' para crear pausas.

REGLAS PARA LOS RITMOS:
- LENTO: Usa muchísimos espacios entre CADA palabra y añade '...' frecuentemente (ej: "Palabra   ...   palabra").
- MEDIO: Usa espacios normales y alguna coma extra para pequeñas pausas.
- RÁPIDO: Une las palabras lo más posible, sin comas ni puntos intermedios.

REGLAS DE INTEGRIDAD (VITAL):
1. **NO AÑADAS PALABRAS NUEVAS**.
2. **NO ELIMINES PALABRAS**.
3. **NO CAMBIES NI UNA LETRA** (no alargues vocales, solo añade signos y espacios).
4. El texto resultante debe tener exactamente las mismas palabras en el mismo orden.

Texto original: {text}

OBLIGATORIO: Devuelve SOLO el texto modificado.
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "Eres un experto en prosodia y ritmo para modelos de voz. Solo devuelves el texto formateado."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=False
    )
    return response.choices[0].message.content

def get_debug_examples(debug_text):
    results = {}
    rhythms = ["Rápido", "Medio", "Lento"]
    for rhythm in rhythms:
        results[rhythm] = apply_rhythm(debug_text, rhythm)
    return results

if __name__ == "__main__":
    debug_text = "Mañana tengo que ir al médico para la revisión."
    output = get_debug_examples(debug_text)
    for rhythm, text in output.items():
        print(f"{rhythm}: {text}")