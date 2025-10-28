from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Vehicle, Messages, VehicleImage
from .serializers import AdminVehicleCreateSerializer, VehicleImageSerializer, VehicleSerializer, MessageSerializer

class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VehicleSerializer

    def get_queryset(self):
        return Vehicle.objects.filter(status__description='Disponível').order_by('-created_at')

class MessageCreateViewSet(viewsets.GenericViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.AllowAny] # Aberto para o público

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save() 
        return Response(
            {"detail": "Mensagem recebida com sucesso. Responderemos em breve."}, 
            status=status.HTTP_201_CREATED
        )

class AdminVehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminVehicleCreateSerializer 
        return VehicleSerializer
        
    queryset = Vehicle.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]
    

