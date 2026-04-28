from django.utils import timezone
from rest_framework import viewsets, mixins, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.viewsets import GenericViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.throttling import AnonRateThrottle
from django.utils.html import strip_tags
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import BodyStyle, CompanySettings, FuelType, Status, TractionType, TransmissionType, Vehicle, Messages, VehicleImage
from .filters import VehicleFilter
from .serializers import (
    AdminTokenObtainPairSerializer,
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

class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    throttle_classes = [AnonRateThrottle]

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
    
class AdminVehicleImageViewSet(mixins.DestroyModelMixin, mixins.UpdateModelMixin, GenericViewSet):
    permission_classes = [IsAdminUser]
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer    

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        image = self.get_object()
        # Unset all other images for this vehicle_data
        VehicleImage.objects.filter(vehicle_data=image.vehicle_data).update(is_primary=False)
        image.is_primary = True
        image.save()
        return Response({'status': 'ok'})

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
        clean_email = strip_tags(instance.sender_email)
        clean_subject = strip_tags(instance.subject)
        clean_body = strip_tags(instance.body)

        company_conf = CompanySettings.load()
        destination_email = company_conf.email

        email_subject = f"Nova Mensagem Site: {clean_subject}"
        
        email_body = f"""
        Recebeste uma nova mensagem através do site Veloz Conquista.

        Nome: {clean_name}
        Email: {clean_email}
        
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