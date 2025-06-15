from django.urls import path
from .views import BookingCreate, UserBookingListView, BookingCreateView, UserBookingListView, UserBookingCancelView

urlpatterns = [
    path('', BookingCreate.as_view(), name='booking-create'),
    path('bookings/', BookingCreateView.as_view(), name='create_booking'),
    path('mybookings/', UserBookingListView.as_view(), name='user-bookings'),
    path('cancel-booking/<int:pk>/', UserBookingCancelView.as_view()),
]
