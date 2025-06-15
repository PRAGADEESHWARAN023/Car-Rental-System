from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'user', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date')
    search_fields = ('car__name', 'user__username')
