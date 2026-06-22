from fastapi import APIRouter, HTTPException, status
from services.facade import stockflow_facade

router = APIRouter(prefix="/analytics", tags=["Tableau de bord & KPIs"])

@router.get("/dashboard", summary="Récupérer les indicateurs clés du stock")
def get_dashboard():
    try:
        stats = stockflow_facade.get_dashboard_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))