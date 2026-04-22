from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Resend
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI(title="PortfolioRoaster Waitlist API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ----- Models -----
class WaitlistCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = None


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WaitlistResponse(BaseModel):
    ok: bool
    already_joined: bool
    position: int
    total: int
    email_sent: bool = False


# ----- Email helper -----
WAITLIST_EMAIL_HTML = """
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'DM Mono','Courier New',monospace;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border:2px solid #0a0a0a;box-shadow:8px 8px 0 #ff4500;max-width:560px;">
          <tr>
            <td style="background:#0a0a0a;color:#ff4500;font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;letter-spacing:2px;padding:18px 28px;">
              PORTFOLIOROASTER
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <div style="color:#ff4500;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">// INCOMING TRANSMISSION</div>
              <h1 style="font-family:'Bebas Neue',Impact,sans-serif;font-size:48px;line-height:0.9;margin:0 0 8px;text-transform:uppercase;">YOU'RE IN.</h1>
              <p style="font-family:Georgia,serif;font-style:italic;font-size:22px;color:#0a0a0a;margin:0 0 18px;">Position <span style="color:#ff4500;font-style:normal;">#{position}</span> on the waitlist.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;color:#0a0a0a;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 14px;">Thanks for signing up to get brutally roasted. The app is currently <strong>coming soon</strong> — and <strong>100% free</strong> during early access.</p>
              <p style="margin:0 0 14px;">We'll email you the <strong>early-access install link</strong> the moment your slot opens up. No spam. No fluff. Just the link.</p>
              <p style="margin:0 0 14px;">Available on <strong>Android only</strong> at launch. iOS is next.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <div style="border-top:1px dashed rgba(10,10,10,0.25);padding-top:16px;color:#6b6358;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                Built with love by XenithHQ · April 2026
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_waitlist_email(email: str, position: int) -> bool:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping waitlist confirmation email")
        return False
    params = {
        "from": f"PortfolioRoaster <{SENDER_EMAIL}>",
        "to": [email],
        "subject": "You're on the PortfolioRoaster waitlist 🔥",
        "html": WAITLIST_EMAIL_HTML.replace("{position}", str(position)),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception:
        logger.exception("Resend send failed for %s", email)
        return False


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "PortfolioRoaster Waitlist API is live"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(payload: WaitlistCreate):
    email_norm = payload.email.strip().lower()

    existing = await db.waitlist.find_one({"email": email_norm}, {"_id": 0})
    total = await db.waitlist.count_documents({})

    if existing:
        position = await db.waitlist.count_documents(
            {"created_at": {"$lte": existing["created_at"]}}
        )
        return WaitlistResponse(
            ok=True,
            already_joined=True,
            position=position,
            total=total,
            email_sent=False,
        )

    entry = WaitlistEntry(email=email_norm, source=payload.source)
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    try:
        await db.waitlist.insert_one(doc)
    except Exception:
        logger.exception("Failed to insert waitlist entry")
        raise HTTPException(status_code=500, detail="Could not save your email. Try again.")

    total = await db.waitlist.count_documents({})
    position = total

    email_sent = await send_waitlist_email(email_norm, position)

    return WaitlistResponse(
        ok=True,
        already_joined=False,
        position=position,
        total=total,
        email_sent=email_sent,
    )


@api_router.get("/waitlist/count")
async def waitlist_count():
    total = await db.waitlist.count_documents({})
    return {"total": total}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_indexes():
    try:
        await db.waitlist.create_index("email", unique=True)
    except Exception:
        logger.exception("Could not create unique index on waitlist.email")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
