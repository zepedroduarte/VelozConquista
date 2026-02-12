from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
import django_filters
from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.viewsets import GenericViewSet
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework.filters import OrderingFilter, SearchFilter
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.throttling import AnonRateThrottle
from django.utils.html import strip_tags
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import BodyStyle, CompanySettings, FuelType, Status, TractionType, TransmissionType, Vehicle, Messages, VehicleImage
from .serializers import (
    BodyStyleSerializer,
    CompanySettingsSerializer,
    FuelTypeSerializer,
    StatusSerializer,
    TractionTypeSerializer,
    TransmissionTypeSerializer,
    VehicleImageSerializer,
    VehicleSerializer, 
    AdminVehicleCreateSerializer, 
    AdminVehicleReadSerializer, 
    MessageSerializer
)

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})

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

class VehicleAttributesView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        data = {
            "body_style": BodyStyleSerializer(BodyStyle.objects.all(), many=True).data,
            "fuel_type": FuelTypeSerializer(FuelType.objects.all(), many=True).data,
            "transmission_type": TransmissionTypeSerializer(TransmissionType.objects.all(), many=True).data,
            "traction_type": TractionTypeSerializer(TractionType.objects.all(), many=True).data,
            "status": StatusSerializer(Status.objects.all(), many=True).data,
        }
        return Response(data)
    
class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="retail_price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="retail_price", lookup_expr='lte')
    fuel_type = django_filters.BaseInFilter(field_name="vehicle_data__fuel_type__id")
    transmission = django_filters.BaseInFilter(field_name="vehicle_data__transmission_type__id")
    body_style = django_filters.BaseInFilter(field_name="vehicle_data__body_style__id")
    traction = django_filters.BaseInFilter(field_name="vehicle_data__traction_type__id")

    class Meta:
        model = Vehicle
        fields = ['status']

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        
        response = Response(
            {"detail": "Sessão terminada com sucesso."},
            status=status.HTTP_200_OK
        )
        
        return response    

class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Vehicle.objects.filter(status__name="Disponível").order_by('-created_at')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = VehicleFilter
    ordering_fields = ['created_at', 'retail_price', 'vehicle_data__mileage']
    
class AdminVehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser] 
    queryset = Vehicle.objects.all().order_by('-created_at')
    parser_classes = [MultiPartParser, FormParser, JSONParser] 
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    search_fields = [
        'vehicle_data__make', 
        'vehicle_data__model', 
        'vehicle_data__version', 
        'vehicle_data__license_plate',
    ]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminVehicleCreateSerializer
        
        return AdminVehicleReadSerializer
    
    def perform_destroy(self, instance):
        if instance.vehicle_data:
            instance.vehicle_data.delete()
        else:
            instance.delete()
            
    @action(detail=True, methods=['post'])
    def mark_sold(self, request, pk=None):
        vehicle = self.get_object()
        final_price = request.data.get('final_price')

        try:
            sold_status = Status.objects.get(name="Vendido")
            
            vehicle.status = sold_status

            if final_price:
                vehicle.retail_price = final_price
            
            vehicle.save()
            return Response({'status': 'Veículo marcado como vendido', 'price': vehicle.retail_price})
        except Status.DoesNotExist:
            return Response({'error': 'Status Vendido não encontrado'}, status=400)       
    
class AdminVehicleImageViewSet(mixins.DestroyModelMixin, GenericViewSet):
    permission_classes = [IsAdminUser]
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer    

class CompanySettingsView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        settings = CompanySettings.load()
        serializer = CompanySettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

class MessageCreateViewSet(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = MessageSerializer
    throttle_classes = [AnonRateThrottle]

    def perform_create(self, serializer):
        instance = serializer.save(message_date=timezone.now())

        clean_name = strip_tags(instance.sender_name)
        clean_subject = strip_tags(instance.subject)
        clean_body = strip_tags(instance.body)

        company_conf = CompanySettings.load()
        destination_email = company_conf.email

        email_subject = f"Nova Mensagem Site: {clean_subject}"
        
        email_body = f"""
        Recebeste uma nova mensagem através do site Veloz Conquista.

        Nome: {clean_name}
        Email: {instance.sender_email}
        
        Assunto: {clean_subject}
        ----------------------------------------------------
        Mensagem:
        {clean_body}
        """

        # 4. Envio
        try:
            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[destination_email],    
                fail_silently=False,
            )
            print("Email enviado com sucesso.")
        except Exception as e:
            print(f"Erro ao enviar email: {e}")