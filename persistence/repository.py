import mysql.connector
import os
import time

class MySQLRepository:
    def __init__(self):
        self.db_config = {
            "host": os.getenv("DB_HOST", "stockflow_db"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", "root_password_secure"),
            "database": os.getenv("DB_NAME", "stockflow_db")
        }

    def _get_connection(self):
        for _ in range(5):
            try:
                return mysql.connector.connect(**self.db_config)
            except mysql.connector.Error:
                time.sleep(2)
        raise Exception("Failed to connect to MySQL database.")

    def create_organization(self, name):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("INSERT INTO organizations (name) VALUES (%s)", (name,))
            org_id = cursor.lastrowid
            conn.commit()
            return org_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
    
    def get_user_by_email(self, email):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            "SELECT id, organization_id, name, email, password, role FROM users WHERE email = %s", 
            (email,)
        )
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        return user

    def add_user(self, organization_id, name, email, password, role="user"):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (organization_id, name, email, password, role) VALUES (%s, %s, %s, %s, %s)",
                (organization_id, name, email, password, role)
            )
            conn.commit()
        except mysql.connector.Error as err:
            conn.close()
            if err.errno == 1062:
                raise ValueError("This email is already in use.")
            raise err
            
        cursor.close()
        conn.close()

    def get_all_products(self, organization_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM products WHERE organization_id = %s", (organization_id,))
        products = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return products

    def add_product(self, organization_id, sku, name, quantity, alert_threshold):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO products (organization_id, sku, name, quantity, alert_threshold) VALUES (%s, %s, %s, %s, %s)",
                (organization_id, sku, name, quantity, alert_threshold)
            )
            conn.commit()
        except mysql.connector.Error as err:
            conn.close()
            if err.errno == 1062:
                raise ValueError("This SKU already exists for your organization.")
            raise err
            
        cursor.close()
        conn.close()

    def delete_product(self, organization_id, product_id):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "DELETE FROM products WHERE id = %s AND organization_id = %s",
                (product_id, organization_id)
            )
            if cursor.rowcount == 0:
                raise ValueError("Product not found or access denied.")
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    def create_movement_and_update_stock(self, organization_id, user_id, product_id, quantity_changed, reason):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO stock_movements (organization_id, user_id, product_id, quantity_changed, reason) VALUES (%s, %s, %s, %s, %s)",
                (organization_id, user_id, product_id, quantity_changed, reason)
            )
            cursor.execute(
                "UPDATE products SET quantity = quantity + %s WHERE id = %s AND organization_id = %s",
                (quantity_changed, product_id, organization_id)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
            
        cursor.close()
        conn.close()

    def get_all_alerts(self, organization_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            "SELECT * FROM products WHERE quantity <= alert_threshold AND organization_id = %s", 
            (organization_id,)
        )
        alerts = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return alerts

    def get_history(self, organization_id, product_id=None):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT m.id, m.quantity_changed, m.reason, m.movement_date AS created_at, 
                   p.name AS product_name, u.name AS user_name
            FROM stock_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            WHERE m.organization_id = %s
        """
        params = [organization_id]
        
        if product_id:
            query += " AND m.product_id = %s"
            params.append(product_id)
            
        query += " ORDER BY m.movement_date DESC"
        
        cursor.execute(query, tuple(params))
        history = cursor.fetchall()
        
        for row in history:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                
        cursor.close()
        conn.close()
        return history

    def get_user_role(self, user_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        return result["role"] if result else None

    def get_dashboard_metrics(self, organization_id):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE organization_id = %s", (organization_id,))
        total_products = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(quantity) FROM products WHERE organization_id = %s", (organization_id,))
        total_items = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity <= alert_threshold AND organization_id = %s", (organization_id,))
        alert_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            "total_product_references": total_products,
            "total_items_in_stock": int(total_items),
            "products_in_alert": alert_count
        }