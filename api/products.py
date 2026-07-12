from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from services.facade import stockflow_facade
from api.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Produits"])

class ProductCreate(BaseModel):
    sku: str = Field(..., example="MAC-BK-M3")
    name: str = Field(..., example="MacBook Air M3")
    quantity: int = Field(..., example=15)
    alert_threshold: int = Field(..., example=5)

@router.get("")
def get_all_products(current_user: dict = Depends(get_current_user)):
    try:
        products = stockflow_facade.fetch_products(current_user["organization_id"])
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/alerts")
def get_alerts(current_user: dict = Depends(get_current_user)):
    try:
        products = stockflow_facade.get_products_in_alert(current_user["organization_id"])
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("")
def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    try:
        stockflow_facade.create_new_product(
            requesting_user_id=current_user["id"],
            organization_id=current_user["organization_id"],
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

@router.delete("/{product_id}")
def delete_product(product_id: int, current_user: dict = Depends(get_current_user)):
    try:
        stockflow_facade.delete_product(
            requesting_user_id=current_user["id"],
            organization_id=current_user["organization_id"],
            product_id=product_id
        )
        return {"status": "success", "message": "Produit supprimé avec succès"}
    except PermissionError as perm_err:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(perm_err))
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))