import os
from threading import Lock

import firebase_admin
from fastapi import Header, HTTPException, status
from firebase_admin import auth as firebase_auth

firebase_init_lock = Lock()
firebase_initialized = False

require_firebase_auth = os.getenv("REQUIRE_FIREBASE_AUTH", "false").lower() == "true"
firebase_project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip() or None


def _init_firebase_if_needed() -> None:
    global firebase_initialized
    if firebase_initialized:
        return

    with firebase_init_lock:
        if firebase_initialized:
            return

        if firebase_project_id:
            firebase_admin.initialize_app(options={"projectId": firebase_project_id})
        else:
            firebase_admin.initialize_app()

        firebase_initialized = True


def require_valid_firebase_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> str | None:
    if not require_firebase_auth:
        return None

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    id_token = authorization.split(" ", 1)[1].strip()
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    _init_firebase_if_needed()

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        ) from exc

    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token missing uid",
        )

    return uid
