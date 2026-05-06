from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ingest import ingest_pdf
from chat import answer_question
from quiz import generate_quiz
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
async def chat(question:str, user_id: str):
    response = await answer_question(question, user_id)
    return {"response": response}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Form(...)):
    contents = await file.read()
    chunk_count = await ingest_pdf(contents, file.filename, user_id)
    return {
        "filename": file.filename,
        "message": f"Successfully processed {chunk_count} chunks"
    }

@app.post("/quiz")
async def quiz_endpoint(topic: str, user_id: str, num_questions: int = 5):
    quiz = await generate_quiz(topic, user_id, num_questions)
    return {"quiz": quiz}



