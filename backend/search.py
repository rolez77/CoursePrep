import os
import re
from dotenv import load_dotenv
from supabase import create_client
import anthropic


load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def search_courses(query:str):

    res = supabase.table("courses").select("*").eq("is_public", True).execute()
    print("[search] public courses:", res.data)
    all_courses = res.data

    if not query.strip():
        return all_courses
    
    query_lower = query.lower()
    matched = [
        c for c in all_courses
        if query_lower in (c.get("name") or "").lower()
        or query_lower in (c.get("description") or "").lower()
        or query_lower in (c.get("university") or "").lower()
    ]

    return matched


async def generate_syllabus_summary(course_id: int):

    res = supabase.table("documents").select('content').eq("course_id", course_id).execute()

    chunks = res.data

    if not chunks:
        return "No syllabus materials found."
    
    context = "\n\n".join([chunk["content"] for chunk in chunks[:20]])

    message = claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""Extract the following information from this course syllabus and return ONLY a valid JSON object with no other text:

{{
  "professor": "professor name or null",
  "days": "lecture days (e.g. Mon/Wed/Fri) or null",
  "topics": ["topic 1", "topic 2"],
  "homeworks": "homework description or null",
  "exams": "exam description or null"
}}

If a field cannot be found in the materials, use null. Topics should be a concise list of the main course topics (up to 8).

Course material:
{context}"""
            }
        ]
    )

    raw = message.content[0].text.strip()
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    summary = json_match.group(0) if json_match else raw

    supabase.table("courses").update({"syllabus_summary": summary}).eq("id", course_id).execute()

    return summary