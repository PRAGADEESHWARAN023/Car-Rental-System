from django.urls import path
from .views import CarList, CarDetailView, ReviewList, ReviewDetail, FavoriteList, FavoriteDetail, CheckAvailabilityView


urlpatterns = [
    path('', CarList.as_view(), name='car-list'),
    path('<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('<int:car_id>/reviews/', ReviewList.as_view(), name='review-list'),
    path('reviews/<int:pk>/', ReviewDetail.as_view(), name='review-detail'),
    path('api/favorites/', FavoriteList.as_view(), name='favorite-list'),
    path('api/favorites/<int:pk>/', FavoriteDetail.as_view(), name='favorite-detail'),
    path('<int:car_id>/availability/', CheckAvailabilityView.as_view(), name='check-availability'),  
]
