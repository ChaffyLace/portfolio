import bcrypt
from persistence.repository import MySQLRepository

class StockFlowFacade:
    
    def __init__(self, repository=None):
        self.repo = repository or MySQLRepository()

    def register_company(self, company_name, admin_name, admin_email, admin_password):
        org_id = self.repo.create_organization(company_name)
        
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), salt).decode('utf-8')
        
        self.repo.add_user(org_id, admin_name, admin_email, hashed_password, "admin")

    def login_user(self, email, password):
        user_data = self.repo.get_user_by_email(email)
        
        if not user_data:
            raise ValueError("Invalid email or password.")
            
        if not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
            raise ValueError("Invalid email or password.")
            
        del user_data['password']
            
        return user_data

    def create_new_user(self, admin_id, organization_id, name, email, password, role="user"):
        current_role = self.repo.get_user_role(admin_id)
        if current_role != "admin":
            raise PermissionError("Access denied: Only administrators can create users.")

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        self.repo.add_user(organization_id, name, email, hashed_password, role)

    def fetch_products(self, organization_id):
        return self.repo.get_all_products(organization_id)

    def get_products_in_alert(self, organization_id):
        return self.repo.get_all_alerts(organization_id)

    def get_movement_history(self, organization_id, product_id=None):
        return self.repo.get_history(organization_id, product_id)

    def create_new_product(self, requesting_user_id, organization_id, sku, name, quantity, alert_threshold):
        user_role = self.repo.get_user_role(requesting_user_id)
        if user_role != "admin":
            raise PermissionError("Access denied: Only administrators can add products.")
        
        self.repo.add_product(organization_id, sku, name, quantity, alert_threshold)

    def delete_product(self, requesting_user_id, organization_id, product_id):
        user_role = self.repo.get_user_role(requesting_user_id)
        if user_role != "admin":
            raise PermissionError("Access denied: Only administrators can delete products.")
            
        self.repo.delete_product(organization_id, product_id)

    def register_stock_movement(self, requesting_user_id, organization_id, product_id, quantity_changed, reason):
        self.repo.create_movement_and_update_stock(
            organization_id=organization_id, 
            user_id=requesting_user_id, 
            product_id=product_id, 
            quantity_changed=quantity_changed, 
            reason=reason
        )

    def get_dashboard_stats(self, organization_id):
        return self.repo.get_dashboard_metrics(organization_id)
    
    def get_full_history(self, organization_id):
        return self.repo.get_history(organization_id)

stockflow_facade = StockFlowFacade()