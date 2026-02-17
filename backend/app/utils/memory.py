import chromadb # type: ignore
from chromadb.utils import embedding_functions # type: ignore
import uuid
from datetime import datetime
import ollama

ef = embedding_functions.DefaultEmbeddingFunction()

class MemoryManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./chroma_data")
        self.collection = self.client.get_or_create_collection(
            name="user_memory",
            embedding_function=ef
        )

    def add_memory(self, user_id: int, chat_id: int, text: str, scope: str):
        if scope == "ignore":
            return
        
        self.collection.add(
            ids=[str(uuid.uuid4())],
            documents=[text],
            metadatas=[{
                "user_id": user_id,
                "chat_id": chat_id,
                "memory_scope": scope,
                "timestamp": datetime.now().isoformat()
            }]
        )

    def recall_memory(self, user_id: int, chat_id: int, query: str, limit: int = 5):
        results = self.collection.query(
            query_texts=[query],
            n_results=limit,
            where={
                "$and": [
                    {"user_id": user_id},
                    {"$or": [
                        {"memory_scope": "global"},
                        {"chat_id": chat_id}
                    ]}
                ]
            }
        )
        return results['documents'][0] if results['documents'] else []

memory_manager = MemoryManager()


async def classify_memory_scope(content: str) -> str:
    prompt = f"""
    Analyze the following user message and classify it into one of three categories:
    1. 'global' - If the message contains personal info about the user, their preferences, or how they want to be addressed.
    2. 'conversation' - If the message is a regular question, factual inquiry, or specific to the current topic.
    3. 'ignore' - If it's a greeting (hi, hello), a short acknowledgement (ok, thanks), or nonsensical.

    Message: "{content}"
    Respond with only one word: global, conversation, or ignore.
    """
    try:
        response = ollama.chat(model='llama3.2:1b', messages=[{'role': 'user', 'content': prompt}])
        result = response['message']['content'].strip().lower()
        
        for word in ['global', 'conversation', 'ignore']:
            if word in result:
                return word
        return 'conversation'
    except:
        return 'conversation'