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



async def ingest_pdf(file_bytes: bytes, filename: str, user_id: str):
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
            "metadata":{
                "filename": filename,
                "page": chunk.metadata.get("page", 0)
            }
        }).execute()
    os.unlink(tmp_path)
    return len(chunks)
