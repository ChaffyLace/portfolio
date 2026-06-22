from models.base import BaseModel

class StockMovement(BaseModel):
    def __init__(self, user_id: int, product_id: int, quantity_changed: int, reason: str, id: int = None):
        super().__init__()
        self.id = id
        self.user_id = user_id
        self.product_id = product_id
        self.quantity_changed = quantity_changed
        self.reason = reason