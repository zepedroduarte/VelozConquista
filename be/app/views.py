from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView

from .models import Vehicle
from .serializers import AdminVehicleCreateSerializer, VehicleSerializer, MessageSerializer

class APIStatusView(APIView):

    permission_classes = [AllowAny] 

    def get(self, request):
        if request.user.is_authenticated and request.user.is_staff:
            return Response({
                "isAuthenticated": True,
                "username": request.user.username
            })
        else:
            return Response({"isAuthenticated": False})

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
                    {"detail": "Acesso negado. O utilizador não tem permissão administrativa."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {"detail": "Credenciais inválidas ou utilizador não encontrado."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
class LogoutView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request): 
        logout(request)
        
        return Response(
            {"detail": "Sessão terminada com sucesso."},
            status=status.HTTP_200_OK
        )


class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = VehicleSerializer

    def get_queryset(self):
        return Vehicle.objects.filter(status__description='Disponível').order_by('-created_at')

class MessageCreateViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = MessageSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save() 
        return Response(
            {"detail": "Mensagem recebida com sucesso. Responderemos em breve."}, 
            status=status.HTTP_201_CREATED
        )

class AdminVehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = VehicleSerializer
    
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminVehicleCreateSerializer 
        return VehicleSerializer
        
    queryset = Vehicle.objects.all().order_by('-created_at')
    

