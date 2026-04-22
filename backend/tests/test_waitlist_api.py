"""Backend API tests for PortfolioRoaster Waitlist API.

Covers:
- GET /api/ (root greeting)
- GET /api/health
- POST /api/waitlist (valid, duplicate, invalid)
- GET /api/waitlist/count
- Uniqueness / count increment
"""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env for REACT_APP_BACKEND_URL (public URL)
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _fresh_email(tag="t"):
    return f"TEST_{tag}_{uuid.uuid4().hex[:10]}@example.com"


# ---------- Basic endpoints ----------
class TestBasic:
    def test_root_greeting(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "PortfolioRoaster" in data["message"] or "waitlist" in data["message"].lower()

    def test_health(self, client):
        r = client.get(f"{API}/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

    def test_count_endpoint_returns_int(self, client):
        r = client.get(f"{API}/waitlist/count")
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert isinstance(data["total"], int)
        assert data["total"] >= 0


# ---------- Waitlist POST ----------
class TestWaitlistJoin:
    def test_join_with_valid_email(self, client):
        before = client.get(f"{API}/waitlist/count").json()["total"]
        email = _fresh_email("valid")
        r = client.post(f"{API}/waitlist", json={"email": email, "source": "pytest"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["already_joined"] is False
        assert isinstance(data["position"], int) and data["position"] > 0
        assert data["total"] == before + 1
        # email_sent key MUST be present
        assert "email_sent" in data, f"email_sent missing in response: {data}"
        assert isinstance(data["email_sent"], bool)
        # For non-verified recipients in Resend TEST mode, email_sent should be False
        assert data["email_sent"] is False, (
            f"Expected email_sent=False for non-verified TEST mode recipient, got {data}"
        )

        # Verify via count endpoint (persistence check)
        after = client.get(f"{API}/waitlist/count").json()["total"]
        assert after == before + 1

    def test_duplicate_email_returns_already_joined_same_position(self, client):
        email = _fresh_email("dup")

        r1 = client.post(f"{API}/waitlist", json={"email": email})
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["already_joined"] is False
        pos1 = d1["position"]
        assert "email_sent" in d1

        r2 = client.post(f"{API}/waitlist", json={"email": email})
        assert r2.status_code == 200, r2.text
        d2 = r2.json()
        assert d2["already_joined"] is True
        assert d2["position"] == pos1, f"Position mismatch: {d1} vs {d2}"
        # Duplicate MUST NOT send an email
        assert "email_sent" in d2
        assert d2["email_sent"] is False, f"Duplicate should not resend email: {d2}"

    def test_resend_owner_email_path(self, client):
        """Owner address (manavagg2003@gmail.com) should either:
        - return email_sent=True (first time), OR
        - return already_joined=True (prior inserts from earlier test runs).
        Per review request: already_joined=True is an acceptable outcome.
        """
        owner = "manavagg2003@gmail.com"
        r = client.post(f"{API}/waitlist", json={"email": owner, "source": "pytest-owner"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "email_sent" in data
        if data["already_joined"]:
            assert data["email_sent"] is False
        else:
            # Fresh insert — Resend should actually send to verified owner
            assert data["email_sent"] is True, (
                f"Fresh owner insert should have email_sent=True, got {data}"
            )

    def test_duplicate_case_insensitive(self, client):
        # emails are normalised to lowercase server-side
        email = _fresh_email("case")
        r1 = client.post(f"{API}/waitlist", json={"email": email.lower()})
        assert r1.status_code == 200
        r2 = client.post(f"{API}/waitlist", json={"email": email.upper()})
        assert r2.status_code == 200
        assert r2.json()["already_joined"] is True

    def test_invalid_email_returns_422(self, client):
        r = client.post(f"{API}/waitlist", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_missing_email_returns_422(self, client):
        r = client.post(f"{API}/waitlist", json={})
        assert r.status_code == 422

    def test_two_distinct_emails_increment_total_by_two(self, client):
        before = client.get(f"{API}/waitlist/count").json()["total"]
        e1 = _fresh_email("u1")
        e2 = _fresh_email("u2")
        r1 = client.post(f"{API}/waitlist", json={"email": e1})
        r2 = client.post(f"{API}/waitlist", json={"email": e2})
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json()["already_joined"] is False
        assert r2.json()["already_joined"] is False
        after = client.get(f"{API}/waitlist/count").json()["total"]
        assert after == before + 2
