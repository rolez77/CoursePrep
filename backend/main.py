from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ingest import ingest_pdf
from chat import answer_question
import os


load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]

)

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/chat")
async def chat(question:str):
    response = await answer_question(question)
    return {"response": response}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    chunk_count = await ingest_pdf(contents, file.filename)
    return {
        "filename": file.filename,
        "message": f"Successfully processed {chunk_count} chunks"
    }



