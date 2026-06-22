import mysql.connector
import os
import time

class MySQLRepository:
    def __init__(self):
        self.db_config = {
            "host": os.getenv("DB_HOST", "db"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", "root_password_secure"),
            "database": os.getenv("DB_NAME", "stockflow_db")
        }

    def _get_connection(self):
        for _ in range(10):
            try:
                return mysql.connector.connect(**self.db_config)
            except mysql.connector.Error:
                time.sleep(2)
        raise Exception("Échec de connexion à la base MySQL")
    
    def get_user_by_credentials(self, email, password):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, role FROM users WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user

    def add_user(self, name, email, password, role="user"):
        conn = self._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                (name, email, password, role)
            )
            conn.commit()
        except mysql.connector.Error as err:
            conn.close()
            if err.errno == 1062:
                raise ValueError("Cet email est déjà utilisé.")
            raise err
        cursor.close()
        conn.close()

    def get_all_products(self):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return products

    def add_product(self, sku, name, quantity, alert_threshold):
        conn = self._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO products (sku, name, quantity, alert_threshold) VALUES (%s, %s, %s, %s)",
                (sku, name, quantity, alert_threshold)
            )
            conn.commit()
        except mysql.connector.Error as err:
            conn.close()
            if err.errno == 1062:
                raise ValueError("Ce code SKU existe déjà.")
            raise err
        cursor.close()
        conn.close()

    def create_movement_and_update_stock(self, user_id, product_id, quantity_changed, reason):
        conn = self._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO stock_movements (user_id, product_id, quantity_changed, reason) VALUES (%s, %s, %s, %s)",
                (user_id, product_id, quantity_changed, reason)
            )
            cursor.execute(
                "UPDATE products SET quantity = quantity + %s WHERE id = %s",
                (quantity_changed, product_id)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
        cursor.close()
        conn.close()

    def get_all_alerts(self):
        """Fonction 1 : Filtre SQL pour récupérer uniquement les alertes"""
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products WHERE quantity <= alert_threshold")
        alerts = cursor.fetchall()
        cursor.close()
        conn.close()
        return alerts

    def get_history(self, product_id=None):
        """Fonction 2 : Historique complet avec jointure pour afficher le nom de l'utilisateur et du produit"""
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT m.id, m.quantity_changed, m.reason, m.created_at, 
                   p.name AS product_name, u.name AS user_name
            FROM stock_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
        """
        
        if product_id:
            query += " WHERE m.product_id = %s"
            cursor.execute(query + " ORDER BY m.created_at DESC", (product_id,))
        else:
            cursor.execute(query + " ORDER BY m.created_at DESC")
            
        history = cursor.fetchall()
        for row in history:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                
        cursor.close()
        conn.close()
        return history

    def get_user_role(self, user_id):
        """Fonction 3 : Vérifie le rôle d'un utilisateur (pour le RBAC / protection des routes)"""
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result["role"] if result else None

    def get_dashboard_metrics(self):
        """Fonction 4 : Récupère les indicateurs clés (KPIs) en une seule fois"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(quantity) FROM products")
        total_items = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity <= alert_threshold")
        alert_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            "total_product_references": total_products,
            "total_items_in_stock": int(total_items),
            "products_in_alert": alert_count
        }