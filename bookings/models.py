from django.db import models
from django.contrib.auth.models import User
from cars.models import Car

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='pending')  

    def __str__(self):
        return f'{self.user.username} - {self.car.name} ({self.start_date} to {self.end_date})'
