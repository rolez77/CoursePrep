from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ingest import ingest_pdf
from chat import answer_question
from quiz import generate_quiz
from search import search_courses, generate_syllabus_summary
from stripe_routes import router as stripe_router
import os
import json
import stripe
from supabase import create_client

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                    "https://courseprep.xyz",
                    "https://www.courseprep.xyz",
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(stripe_router)

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Form(...), course_id: str = Form(None)):
    

    profile = supabase.table("profiles").select("is_pro, upload_count").eq("id", user_id).single().execute()
    
    if not profile.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_pro = profile.data.get("is_pro", False)
    upload_count = profile.data.get("upload_count", 0)

    if not is_pro and upload_count >= 1:
        raise HTTPException(status_code=403, detail="Free plan limit reached. Upgrade to Pro for unlimited uploads.")

    contents = await file.read()
    chunk_count = await ingest_pdf(contents, file.filename, user_id, course_id)

    supabase.table("profiles").update(
        {"upload_count": upload_count + 1}
    ).eq("id", user_id).execute()

    return {
        "filename": file.filename,
        "message": f"Successfully processed {chunk_count} chunks"
    }

@app.post("/chat")
async def chat(question: str, user_id: str, course_id: str = None):
    response = await answer_question(question, user_id, course_id)
    return {"response": response}

@app.post("/quiz")
async def quiz_endpoint(topic: str, user_id: str, num_questions: int = 5, course_id: str = None):
    quiz = await generate_quiz(topic, user_id, num_questions, course_id)
    return {"quiz": quiz}

@app.get("/search")
async def search(query: str = ""):
    courses = await search_courses(query)
    return {"courses": courses}

@app.get("/courses/{course_id}/summary")
async def get_summary(course_id: int):
    res = supabase.table("courses").select("syllabus_summary").eq("id", course_id).execute()
    if res.data and res.data[0].get("syllabus_summary"):
        return {"summary": res.data[0]["syllabus_summary"]}
    summary = await generate_syllabus_summary(course_id)
    return {"summary": summary}

@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
        event = json.loads(payload)  # convert to plain dict always
    except Exception as e:
        print("Webhook verification failed:", str(e))
        try:
            event = json.loads(payload)
        except Exception:
            return {"status": "error"}

    print("EVENT TYPE:", event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print("METADATA:", session.get("metadata"))

        try:
            user_id = session["metadata"]["user_id"]
        except (KeyError, TypeError):
            print("No user_id found in metadata")
            return {"status": "ok"}

        print(f"Upgrading user {user_id} to Pro")
        result = supabase.table("profiles").update(
            {"is_pro": True, "stripe_customer_id": session["customer"]}
        ).eq("id", user_id).execute()
        print("Supabase result:", result)
        print("Done — upgraded to Pro")

    if event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"]["customer"]
        supabase.table("profiles").update(
            {"is_pro": False}
        ).eq("stripe_customer_id", customer_id).execute()
        print(f"Downgraded customer {customer_id}")

    return {"status": "ok"}

@app.post("/webhook-test")
async def webhook_test(request: Request):
    body = await request.body()
    print("WEBHOOK TEST HIT:", body[:100])
    return {"status": "ok"}

