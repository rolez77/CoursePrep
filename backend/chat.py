import os
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
    model = "text-embedding-3-small",
    openai_api_key = os.getenv("OPENAI_API_KEY")
)

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def answer_question(question: str, user_id: str, course_id: str = None):

    question_embedding = embeddings.embed_query(question)

    result = supabase.rpc("match_documents",{
        "query_embedding": question_embedding,
        "match_count": 5,
        "user_id": user_id
    }).execute()

    chunks = result.data
    context = "\n\n".join([chunk["content"] for chunk in chunks])


    message = claude.messages.create(
        model = "claude-sonnet-4-5",
        max_tokens = 1024,
        messages = [
            {
                "role": "user",
                "content": f"""You are a helpful tutor assistant. Use the following course material to answer the student's question. 
                If the answer is not in the course material, say so honestly.

                Course material:
                {context}

                Student question: {question}"""
            }
        ]
    )
    return message.content[0].text