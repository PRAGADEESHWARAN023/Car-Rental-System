from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, viewsets, status
from .models import Car, Review, Favorite
from bookings.models import Booking
from .serializers import CarSerializer, ReviewSerializer, FavoriteSerializer, AvailabilityCheckSerializer
from django.shortcuts import get_object_or_404

class CarList(generics.ListAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = Car.objects.filter(availability=True)
        location = self.request.query_params.get('location')
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        model_year_min = self.request.query_params.get('model_year_min')
        model_year_max = self.request.query_params.get('model_year_max')
        car_type = self.request.query_params.get('car_type')
        transmission = self.request.query_params.get('transmission')
        if location:
            queryset = queryset.filter(location__icontains=location)
        if price_min:
            queryset = queryset.filter(price_per_day__gte=price_min)
        if price_max:
            queryset = queryset.filter(price_per_day__lte=price_max)
        if model_year_min:
            queryset = queryset.filter(model_year__gte=model_year_min)
        if model_year_max:
            queryset = queryset.filter(model_year__lte=model_year_max)
        if car_type:
            queryset = queryset.filter(car_type__iexact=car_type)
        if transmission:
            queryset = queryset.filter(transmission__iexact=transmission)
        return queryset

class CarDetail(generics.RetrieveAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        location = self.request.query_params.get('location', None)
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        model_year_min = self.request.query_params.get('model_year_min')
        model_year_max = self.request.query_params.get('model_year_max')
        car_type = self.request.query_params.get('car_type')
        transmission = self.request.query_params.get('transmission')
        if location:
            queryset = queryset.filter(location__icontains=location)
        if price_min:
            queryset = queryset.filter(price_per_day__gte=price_min)
        if price_max:
            queryset = queryset.filter(price_per_day__lte=price_max)
        if model_year_min:
            queryset = queryset.filter(model_year__gte=model_year_min)
        if model_year_max:
            queryset = queryset.filter(model_year__lte=model_year_max)
        if car_type:
            queryset = queryset.filter(car_type__iexact=car_type)
        if transmission:
            queryset = queryset.filter(transmission__iexact=transmission)
        return queryset
    
class ReviewList(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return Review.objects.filter(car_id=car_id)
    
    def perform_create(self, serializer):
        car_id = self.kwargs['car_id']
        car = get_object_or_404(Car, pk=car_id)  
        serializer.save(user=self.request.user, car=car)
class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()



class FavoriteList(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
class FavoriteDetail(generics.RetrieveDestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Favorite.objects.all()

class CarDetailView(generics.RetrieveAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]

class CheckAvailabilityView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AvailabilityCheckSerializer

    def get(self, request, car_id):
        try:
            car = Car.objects.get(id=car_id)
        except Car.DoesNotExist:
            return Response({"error": "Car not found"}, status=404)
    
        bookings = Booking.objects.filter(car=car)
        booked_ranges = [
            {
                "start_date": booking.start_date.strftime("%Y-%m-%d"),
                "end_date": booking.end_date.strftime("%Y-%m-%d")
            }
            for booking in bookings
        ]
        return Response(booked_ranges, status=200)


    def post(self, request, car_id):
        car = Car.objects.get(id=car_id)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            start_date = serializer.validated_data['start_date']
            end_date = serializer.validated_data['end_date']
            bookings = Booking.objects.filter(car=car, start_date__lt=end_date, end_date__gt=start_date)
            if bookings.exists():
                return Response({"availability": False}, status=200)
            return Response({"availability": True}, status=200)
        return Response(serializer.errors, status=400)
