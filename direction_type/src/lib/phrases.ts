import phrasesData from "../../phrases_es.json";

export interface PhraseCategory {
    [key: string]: string[];
}

export const phrases = phrasesData as PhraseCategory;

export const CATEGORY_MAP: Record<string, string> = {
    "Saludos": "saludos",
    "Despedidas": "despedidas",
    "Frases Importantes": "frases_importantes",
    "Preguntas": "preguntas",
    "Control del entorno": "control_entorno",
    "Necesidades": "necesidades",
    "Emergencias": "emergencias",
    "TECLADO": "teclado"
};
