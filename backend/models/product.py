from models.base import BaseModel

class Product(BaseModel):
    def __init__(self, sku: str, name: str, quantity: int = 0, alert_threshold: int = 5, id: int = None):
        super().__init__()
        self.id = id
        self.sku = sku
        self.name = name
        self.quantity = quantity
        self.alert_threshold = alert_threshold

    @property
    def quantity(self):
        return self._quantity

    @quantity.setter
    def quantity(self, value: int):
        if value < 0:
            raise ValueError("La quantité en stock ne peut pas être négative")
        self._quantity = value