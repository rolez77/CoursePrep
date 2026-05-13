import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from supabase import create_client
import tempfile

load_dotenv()


supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 500,
    chunk_overlap = 50
)



BUCKET = "course-materials"

def _ensure_bucket():
    try:
        supabase.storage.create_bucket(BUCKET, options={"public": True})
    except Exception:
        pass  # already exists

def _upload_to_storage(file_bytes: bytes, filename: str, user_id: str, course_id: str) -> str | None:
    _ensure_bucket()
    path = f"{user_id}/{course_id}/{filename}"
    try:
        supabase.storage.from_(BUCKET).upload(path, file_bytes, {"content-type": "application/pdf", "upsert": "true"})
    except Exception:
        try:
            supabase.storage.from_(BUCKET).update(path, file_bytes, {"content-type": "application/pdf"})
        except Exception:
            return None
    return supabase.storage.from_(BUCKET).get_public_url(path)


async def ingest_pdf(file_bytes: bytes, filename: str, user_id: str, course_id: str = None):
    file_url = _upload_to_storage(file_bytes, filename, user_id, course_id or "global")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    loader = PyPDFLoader(tmp_path)
    pages = loader.load()
    chunks = text_splitter.split_documents(pages)

    for chunk in chunks:
        embedding = embeddings.embed_query(chunk.page_content)
        supabase.table("documents").insert({
            "content": chunk.page_content,
            "embedding": embedding,
            "user_id": user_id,
            "course_id": course_id,
            "metadata": {
                "filename": filename,
                "page": chunk.metadata.get("page", 0),
                "file_url": file_url,
            }
        }).execute()
    os.unlink(tmp_path)
    return len(chunks)
