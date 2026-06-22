from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from services.facade import stockflow_facade

router = APIRouter(prefix="/movements", tags=["Mouvements de Stock"])

class MovementCreate(BaseModel):
    user_id: int = Field(..., example=1)
    quantity_changed: int = Field(..., example=-3)
    reason: str = Field(..., example="Vente client")

@router.post("/{product_id}", summary="Enregistrer un mouvement de stock")
def add_stock_movement(product_id: int, movement: MovementCreate):
    try:
        stockflow_facade.register_stock_movement(
            movement.user_id, product_id, movement.quantity_changed, movement.reason
        )
        return {"status": "success", "message": "Mouvement enregistré et stock mis à jour"}
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.get("", summary="Obtenir l'historique des mouvements de stock")
def get_movements_history(product_id: int = None):
    try:
        history = stockflow_facade.get_movement_history(product_id)
        return {"status": "success", "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))