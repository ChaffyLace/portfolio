from models.base import BaseModel
import re

class User(BaseModel):
    def __init__(self, name: str, email: str, password: str, role: str = "user", id: int = None):
        super().__init__()
        self.id = id
        self.name = name
        self.email = email
        self.password = password
        self.role = role

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value: str):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise ValueError("Format d'email invalide")
        self._email = value