from datetime import datetime

class BaseModel:
    def __init__(self):
        self._created_at = datetime.utcnow()

    @property
    def created_at(self):
        return self._created_at