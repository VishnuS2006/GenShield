import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.detect import router as detect_router
from app.api.generate import router as generate_router
from app.api.history import router as history_router
from app.api.protected_documents import router as protected_documents_router
from app.core.config import get_settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.seed.synthetic_data import seed_synthetic_data

settings = get_settings()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("genshield")

app = FastAPI(title="GenShield Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    logger.info("request_complete path=%s status=%s duration_ms=%s", request.url.path, response.status_code, duration_ms)
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": f"HTTP_{exc.status_code}", "message": exc.detail}},
    )


@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("database_error")
    return JSONResponse(
        status_code=503,
        content={"error": {"code": "DATABASE_ERROR", "message": "Database operation failed"}},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception):
    logger.exception("unhandled_error")
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": str(exc) if settings.environment == "development" else "Internal server error"}})


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        try:
            await seed_synthetic_data(session)
        except Exception:
            await session.rollback()
            raise


@app.get("/health")
async def health():
    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected", "service": "genshield-backend"}


app.include_router(auth_router)
app.include_router(generate_router)
app.include_router(detect_router)
app.include_router(dashboard_router)
app.include_router(history_router)
app.include_router(protected_documents_router)
