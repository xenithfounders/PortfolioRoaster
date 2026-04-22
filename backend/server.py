from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="PortfolioRoaster Waitlist API")
api_router = APIRouter(prefix="/api")


# ----- Models -----
class WaitlistCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = None  # e.g. "hero", "footer"


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
        # Compute position by created_at
        position = (
            await db.waitlist.count_documents(
                {"created_at": {"$lte": existing["created_at"]}}
            )
        )
        return WaitlistResponse(
            ok=True, already_joined=True, position=position, total=total
        )

    entry = WaitlistEntry(email=email_norm, source=payload.source)
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    try:
        await db.waitlist.insert_one(doc)
    except Exception as e:
        logger.exception("Failed to insert waitlist entry")
        raise HTTPException(status_code=500, detail="Could not save your email. Try again.")

    total = await db.waitlist.count_documents({})
    position = total  # newest entry is at the end
    return WaitlistResponse(
        ok=True, already_joined=False, position=position, total=total
    )


@api_router.get("/waitlist/count")
async def waitlist_count():
    total = await db.waitlist.count_documents({})
    return {"total": total}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_indexes():
    try:
        await db.waitlist.create_index("email", unique=True)
    except Exception:
        logger.exception("Could not create unique index on waitlist.email")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
