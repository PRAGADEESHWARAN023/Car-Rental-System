from django.shortcuts import render
from rest_framework import generics, permissions, status
from .serializers import UserRegisterSerializer, UserProfileSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.generic import TemplateView

class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class HomePageView(TemplateView):
    template_name = 'index.html'

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

def home_data(request):
    return JsonResponse({
        "heading": "Welcome to the Car Rental System",
        "message": "Find and book cars easily in your preferred location.",
        "button_text": "Browse Cars"
    })