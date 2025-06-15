from django.contrib import admin
from .models import Car
# Register your models here

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location', 'price_per_day', 'availability')
    list_filter = ('availability', 'location')
    search_fields = ('name', 'description', 'location')
