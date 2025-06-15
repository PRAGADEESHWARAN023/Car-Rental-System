from django.urls import path
from .views import UserRegisterView, UserProfileView, home_data

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('home/', home_data, name='home_data'),
]
