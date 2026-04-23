from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware


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
def chat(question:str):
    return {"response": f"This is a mock answer to {question}"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    return{
        "filename": file.filename,
        "size" : len(contents),
        "message" : f"File {file.filename} contents recieved succesfully!"

    }



