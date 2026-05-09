
import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter()


@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    body = await request.json()
    user_id = body.get("user_id")
    email = body.get("email")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            customer_email=email,
            line_items=[{
                "price": os.getenv("STRIPE_PRICE_ID"),
                "quantity": 1,
            }],
            metadata={"user_id": user_id},
            success_url="http://localhost:3000/dashboard?upgraded=true",
            cancel_url="http://localhost:3000/dashboard?cancelled=true"
        )
        print("SESSION CREATED — user_id in metadata:", user_id)
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))