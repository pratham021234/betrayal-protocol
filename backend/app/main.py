import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes_rooms import router as rooms_router
from .api.routes_replays import router as replays_router
from .api.websocket_endpoint import router as ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("betrayal_protocol")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Real-Time Multiplayer Social Dilemma Game Backend"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routers
app.include_router(rooms_router)
app.include_router(replays_router)
app.include_router(ws_router)

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
