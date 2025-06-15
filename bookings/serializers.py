from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    car_name = serializers.ReadOnlyField(source='car.name')

    class Meta:
        model = Booking
        fields = ['id', 'user', 'car', 'car_name', 'start_date', 'end_date']
        read_only_fields = ['user']
