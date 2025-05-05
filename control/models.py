
from django.db import models
from django.utils import timezone

class LightLog(models.Model):
    status = models.CharField(max_length=10)  # VD: "ON", "OFF", hoặc bất kỳ chuỗi nào
    timestamp = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=100)  # VD: "Voice", "Web", v.v.

    def __str__(self):
        return f"{self.status} at {self.timestamp} from {self.source}"
