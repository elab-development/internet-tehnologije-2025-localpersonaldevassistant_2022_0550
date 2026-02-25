from dotenv import load_dotenv
import os

_config_cache = {}

def get_config():
    
    global _config_cache
    if not _config_cache:
        load_dotenv()
        _config_cache['OLLAMA_URL'] = os.getenv("OLLAMA_URL", "http://localhost:11434")
        _config_cache['MODEL_NAME'] = os.getenv("MODEL_NAME", "llama3.2:1b")  
    return _config_cache

def update_config(key, value):
    
    global _config_cache
    _config_cache[key] = value
    print(f"Config azuriran: {key}={value}")
