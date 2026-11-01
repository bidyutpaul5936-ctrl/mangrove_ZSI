"""Authentication Router"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

import config
from models.schemas import TokenAuth, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(auth: TokenAuth):
    """
    Simple token-based authentication for officer access.
    In production, this would be replaced with OAuth2/JWT.
    """
    if auth.token == config.OFFICER_TOKEN:
        return LoginResponse(
            success=True,
            message="Authentication successful",
            role="officer"
        )
    
    raise HTTPException(401, "Invalid authentication token")


@router.get("/verify")
async def verify_token(authorization: Optional[str] = Header(None)):
    """Verify if the provided token is valid."""
    if authorization == f"Bearer {config.OFFICER_TOKEN}":
        return {"valid": True, "role": "officer"}
    
    return {"valid": False, "role": "public"}
