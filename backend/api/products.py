from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, Field
from services.facade import stockflow_facade

router = APIRouter(prefix="/products", tags=["Produits"])

class ProductCreate(BaseModel):
    sku: str = Field(..., example="MAC-BK-M3")
    name: str = Field(..., example="MacBook Air M3")
    quantity: int = Field(..., example=15)
    alert_threshold: int = Field(..., example=5)

@router.get("", summary="Récupérer tout l'inventaire")
def get_all_products():
    try:
        products = stockflow_facade.fetch_products()
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/alerts", summary="Lister les produits en alerte de stock")
def get_alerts():
    try:
        products = stockflow_facade.get_products_in_alert()
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("", summary="Créer un nouveau produit")
def create_product(product: ProductCreate, x_user_id: int = Header(..., description="ID de l'utilisateur qui crée le produit")):
    try:
        stockflow_facade.create_new_product(
            requesting_user_id=x_user_id,
            sku=product.sku,
            name=product.name,
            quantity=product.quantity,
            alert_threshold=product.alert_threshold
        )
        return {"status": "success", "message": "Produit créé avec succès"}
    except PermissionError as perm_err:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(perm_err))
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))