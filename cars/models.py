from django.db import models
class Car(models.Model):
    id = models.IntegerField(primary_key=True)  
    name = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    price_per_day = models.DecimalField(max_digits=8, decimal_places=2)
    availability = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)
    model_year = models.IntegerField()  
    car_type = models.CharField(max_length=50, null=True, blank=True)  
    transmission = models.CharField(max_length=20)  

    def save(self, *args, **kwargs):
       if not self.id:
           last_car = Car.objects.order_by('-id').first()
           self.id = 1 if last_car is None else last_car.id + 1
       super().save(*args, **kwargs)
       
    def __str__(self):
        return self.name

       
class Review(models.Model):
    car = models.ForeignKey(Car, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f'Review for {self.car.name} by {self.user.username}'

class Favorite(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'car')
