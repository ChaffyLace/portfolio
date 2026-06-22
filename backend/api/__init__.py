from fastapi import FastAPI
from api import auth
from api import products

app = FastAPI(title="Stock")

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")