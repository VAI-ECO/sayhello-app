import os
import json
from deep_translator import GoogleTranslator, exceptions

# Language codes
languages = {

    "es": "Spanish",
}

# Languages already translated
completed = {"en"}

# Load source JSON
with open("locales/en/translation.json", "r", encoding="utf-8") as f:
    source_data = json.load(f)

# Helper: Check if language is supported
def is_supported(lang_code):
    try:
        GoogleTranslator(source='en', target=lang_code)
        return True
    except exceptions.LanguageNotSupportedException:
        return False

# Recursive translation
def translate_recursive(obj, target_lang):
    if isinstance(obj, dict):
        return {k: translate_recursive(v, target_lang) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_recursive(item, target_lang) for item in obj]
    elif isinstance(obj, str):
        return GoogleTranslator(source='en', target=target_lang).translate(obj)
    else:
        return obj

# Translate and save
for lang_code, lang_name in languages.items():
    if lang_code in completed:
        continue

    if not is_supported(lang_code):
        print(f"Skipping {lang_code} ({lang_name}) – not supported by deep_translator.")
        continue

    try:
        print(f"Translating to {lang_code} ({lang_name})...")
        translated_data = translate_recursive(source_data, lang_code)

        lang_folder = os.path.join("locales", lang_code)
        os.makedirs(lang_folder, exist_ok=True)

        with open(os.path.join(lang_folder, "translation.json"), "w", encoding="utf-8") as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

        print(f"Saved translation to locales/{lang_code}/translation.json")
    except Exception as e:
        print(f"❌ Error while translating to {lang_code} ({lang_name}): {e}")
