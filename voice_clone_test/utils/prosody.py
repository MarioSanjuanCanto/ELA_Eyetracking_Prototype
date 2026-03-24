from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()


def apply_prosody(text, prosody_prompt, model="gpt-4o-mini"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    prompt = str(prosody_prompt) + "\nOBLIGATORIO: Responde solo con el texto modificado, sin explicaciones ni nada extra. \nTexto: { " + str(text) + " }"

    print(prompt)

    text_response = client.chat.completions.create(
        model = model,
        messages = [
            {
                "role": "system",
                "content": "Eres un experto en prosodia y entonación."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream = False
    )
    return text_response.choices[0].message.content
    


