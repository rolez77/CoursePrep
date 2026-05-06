import os
import json
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from supabase import create_client
import anthropic

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def generate_quiz(topic: str, user_id: str, num_questions: int = 5):

    topic_embedding = embeddings.embed_query(topic)

    result = supabase.rpc("match_documents",{
        "query_embedding": topic_embedding,
        "match_count": 5,
        "user_id": user_id
    }).execute()

    chunks = result.data
    context = "\n\n".join([chunk["content"] for chunk in chunks])
    message = claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"""You are a professor creating a quiz based on course material.
Generate exactly {num_questions} multiple choice questions based on the content below.

Return ONLY a JSON array with no extra text, in this exact format:
[
  {{
    "question": "Question text here?",
    "options": ["A) option one", "B) option two", "C) option three", "D) option four"],
    "correct": "A) option one",
    "explanation": "Brief explanation of why this is correct"
  }}
]

Course material:
{context}

Topic focus: {topic}"""
            }
        ]
    )

    raw = message.content[0].text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    # Debug — print what Claude returned
    print("Claude raw response:", raw[:200])

    
    questions = json.loads(raw)

    return questions