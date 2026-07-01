import hashlib
from persistence.repository import MySQLRepository
from models.user import User
from models.product import Product
from models.movement import StockMovement

class StockFlowFacade:
    def __init__(self):
        self.repo = MySQLRepository()

    def login_user(self, email, password):
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        user_data = self.repo.get_user_by_credentials(email, hashed_password)
        return user_data

    def create_new_user(self, name, email, password, role="user"):
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest() 
        
        User(name=name, email=email, password=hashed_password, role=role)

        self.repo.add_user(name, email, hashed_password, role)

    def fetch_products(self):
        return self.repo.get_all_products()

    def get_products_in_alert(self):
        """Récupère la liste des produits sous le seuil d'alerte"""
        return self.repo.get_all_alerts()

    def get_movement_history(self, product_id: int = None):
        """Récupère l'historique global ou filtré par produit"""
        return self.repo.get_history(product_id)

    def create_new_product(self, requesting_user_id: int, sku, name, quantity, alert_threshold):
        """Crée un produit SEULEMENT si l'utilisateur est admin (RBAC)"""
        user_role = self.repo.get_user_role(requesting_user_id)
        if user_role != "admin":
            raise PermissionError("Action interdite : Seul un administrateur peut ajouter des produits.")
        
        Product(sku=sku, name=name, quantity=quantity, alert_threshold=alert_threshold)
        self.repo.add_product(sku, name, quantity, alert_threshold)

    def register_stock_movement(self, user_id, product_id, quantity_changed, reason):
        StockMovement(user_id=user_id, product_id=product_id, quantity_changed=quantity_changed, reason=reason)
        self.repo.create_movement_and_update_stock(user_id, product_id, quantity_changed, reason)

    def get_dashboard_stats(self):
        """Récupère les statistiques clés globales pour le pilotage"""
        return self.repo.get_dashboard_metrics()

stockflow_facade = StockFlowFacade()