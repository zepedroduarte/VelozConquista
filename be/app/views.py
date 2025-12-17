from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Vehicle, Messages
from .serializers import (
    VehicleSerializer, 
    AdminVehicleCreateSerializer, 
    AdminVehicleReadSerializer, 
    MessageSerializer
)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_staff:
                login(request, user)
                return Response({
                    "detail": "Autenticação bem-sucedida.",
                    "user_id": user.pk,
                    "username": user.username,
                    "is_admin": user.is_staff
                })
            else:
                return Response(
                    {"detail": "Acesso negado. Requer privilégios administrativos."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        return Response(
            {"detail": "Credenciais inválidas."}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Sessão terminada."}, status=status.HTTP_200_OK)

class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = VehicleSerializer

    def get_queryset(self):
        return Vehicle.objects.filter(status__description='Disponível').order_by('-created_at')
    
class AdminVehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser] 
    queryset = Vehicle.objects.all().order_by('-created_at')
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminVehicleCreateSerializer
        
        return AdminVehicleReadSerializer
    
class MessageCreateViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = MessageSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Mensagem enviada com sucesso."}, 
            status=status.HTTP_201_CREATED
        )