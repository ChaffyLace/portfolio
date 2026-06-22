from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.products import router as products_router
from api.movements import router as movements_router
from api.analytics import router as analytics_router

app = FastAPI(
    title="stock",
    description="MVP de gestion de stock",
    version="0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(movements_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/", tags=["Root"])
def root():
    return {"status": "online", "architecture": "Layered with Facade Pattern"}