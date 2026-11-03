from rest_framework import serializers
from django.db import transaction
from .models import (
    CompanySettings, Vehicle, VehicleData, Status, BodyStyle, FuelType, 
    TransmissionType, TractionType, Messages, VehicleImage,
    Customer, LegalInfo, SoldVehicle, VehicleService
)

class AdminTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        from django.contrib.auth import authenticate

        user = authenticate(username=data["username"], password=data["password"])

        if not user or not user.is_staff:
            raise serializers.ValidationError("Sem permissão.")

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = '__all__'

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'name']

class BodyStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyStyle
        fields = ['id', 'name']

class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = ['id', 'name']

class TransmissionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransmissionType
        fields = ['id', 'name']

class TractionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TractionType
        fields = ['id', 'name']

def validate_image_size(image):
    from django.conf import settings
    if image.size > settings.MAX_IMAGE_UPLOAD_SIZE:
        raise serializers.ValidationError(f"A foto '{image.name}' tem mais de 25 MB.")


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'is_primary']  

class VehicleDataSerializer(serializers.ModelSerializer):
    body_style = BodyStyleSerializer(read_only=True)
    fuel_type = FuelTypeSerializer(read_only=True)
    transmission_type = TransmissionTypeSerializer(read_only=True)
    traction_type = TractionTypeSerializer(read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True) 
    
    class Meta:
        model = VehicleData
        fields = '__all__'

class AdminVehicleReadSerializer(serializers.ModelSerializer):
    vehicle_data = VehicleDataSerializer(read_only=True)
    status = StatusSerializer(read_only=True)

    class Meta:
        model = Vehicle  
        fields = [
            'id', 
            'vehicle_data',  
            'purchase_price', 
            'retail_price', 
            'status', 
            'created_at',
        ]
class VehicleSerializer(serializers.ModelSerializer):
    vehicle_data = VehicleDataSerializer(read_only=True)
    status = StatusSerializer(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_data', 'retail_price', 'status', 'created_at']

class AdminVehicleCreateSerializer(serializers.ModelSerializer):
    make = serializers.CharField(write_only=True)
    model = serializers.CharField(write_only=True)
    version = serializers.CharField(write_only=True, required=False, allow_blank=True)
    license_plate = serializers.CharField(write_only=True)
    mileage = serializers.DecimalField(max_digits=18, decimal_places=2, write_only=True)
    color = serializers.CharField(write_only=True)
    seats = serializers.IntegerField(write_only=True)
    doors = serializers.IntegerField(write_only=True)
    power = serializers.DecimalField(max_digits=18, decimal_places=2, write_only=True)
    engine_size = serializers.DecimalField(max_digits=18, decimal_places=2, write_only=True)
    year = serializers.IntegerField(write_only=True)

    transmission_type_id = serializers.PrimaryKeyRelatedField(
        queryset=TransmissionType.objects.all(), write_only=True
    )
    fuel_type_id = serializers.PrimaryKeyRelatedField(
        queryset=FuelType.objects.all(), write_only=True
    )
    body_style_id = serializers.PrimaryKeyRelatedField(
        queryset=BodyStyle.objects.all(), write_only=True
    )
    traction_type_id = serializers.PrimaryKeyRelatedField(
        queryset=TractionType.objects.all(), write_only=True
    )
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=Status.objects.all(), write_only=True
    )

    images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False, validators=[validate_image_size]),
        write_only=True,
        required=False
    )

    primary_image_index = serializers.IntegerField(write_only=True, required=False, default=0)

    class Meta:
        model = Vehicle
        
        fields = [
            'purchase_price', 'retail_price', 'status_id', 'images', 'primary_image_index',
            'make', 'model', 'year', 'version', 'license_plate', 'mileage', 
            'color', 'seats', 'doors', 'power', 'engine_size',
            'transmission_type_id', 'fuel_type_id', 'body_style_id', 'traction_type_id'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        primary_index = validated_data.pop('primary_image_index', 0)
        status_instance = validated_data.pop('status_id')
        purchase_price = validated_data.pop('purchase_price')
        retail_price = validated_data.pop('retail_price')

        fuel_instance = validated_data.pop('fuel_type_id')
        trans_instance = validated_data.pop('transmission_type_id')
        body_instance = validated_data.pop('body_style_id')
        traction_instance = validated_data.pop('traction_type_id')

        with transaction.atomic():
            vehicle_data_instance = VehicleData.objects.create(
                fuel_type=fuel_instance,
                transmission_type=trans_instance,
                body_style=body_instance,
                traction_type=traction_instance,
                **validated_data 
            )

            vehicle_instance = Vehicle.objects.create(
                vehicle_data=vehicle_data_instance,
                status=status_instance,
                purchase_price=purchase_price,
                retail_price=retail_price
            )

            for i, img in enumerate(images_data):
                VehicleImage.objects.create(
                    vehicle_data=vehicle_data_instance,
                    image=img,
                    is_primary=(i == primary_index)
                )
                
        return vehicle_instance
    
    def update(self, instance, validated_data):
        status_instance = validated_data.pop('status_id', None)
        if status_instance:
            instance.status = status_instance
            
        instance.purchase_price = validated_data.pop('purchase_price', instance.purchase_price)
        instance.retail_price = validated_data.pop('retail_price', instance.retail_price)
        
        images_data = validated_data.pop('images', [])
        
        v_data = instance.vehicle_data
        
        if 'fuel_type_id' in validated_data:
            v_data.fuel_type = validated_data.pop('fuel_type_id')
        if 'transmission_type_id' in validated_data:
            v_data.transmission_type = validated_data.pop('transmission_type_id')
        if 'body_style_id' in validated_data:
            v_data.body_style = validated_data.pop('body_style_id')
        if 'traction_type_id' in validated_data:
            v_data.traction_type = validated_data.pop('traction_type_id')

        for attr, value in validated_data.items():
            setattr(v_data, attr, value)

        with transaction.atomic():
            v_data.save()
            instance.save()
            
            for img in images_data:
                VehicleImage.objects.create(
                    vehicle_data=v_data,
                    image=img,
                    is_primary=False 
                )

        return instance

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messages
        fields = ['sender_name', 'sender_email', 'sender_phone_number', 'subject', 'body']

# --- Back-office (CMS) ---

class LegalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalInfo
        exclude = ['id']
        read_only_fields = ['updated_at']

    def validate(self, data):
        valid_from = data.get('insurance_valid_from', getattr(self.instance, 'insurance_valid_from', None))
        valid_until = data.get('insurance_valid_until', getattr(self.instance, 'insurance_valid_until', None))
        if valid_from and valid_until and valid_until < valid_from:
            raise serializers.ValidationError({'insurance_valid_until': 'A data final tem de ser posterior à data inicial.'})
        return data


class AdminCompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = [
            'name', 'description', 'phone', 'email', 'address',
            'facebook_url', 'instagram_url', 'whatsapp_number',
            'postal_code', 'locality', 'latitude', 'longitude', 'google_maps_url',
            'weekday_hours', 'saturday_hours', 'sunday_hours', 'service_areas',
        ]

    def to_internal_value(self, data):
        # Coordinates pasted from Google Maps: "38.8912345" or "38,8912345" or empty
        data = data.copy()
        for field in ('latitude', 'longitude'):
            value = data.get(field)
            if value in ('', None):
                data[field] = None
            else:
                try:
                    data[field] = str(round(float(str(value).replace(',', '.')), 6))
                except ValueError:
                    pass  # the field validator reports the error
        return super().to_internal_value(data)

    HOURS_PATTERN =r'^\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*(,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*)*$'

    def _validate_hours(self, value):
        import re
        if value and not re.match(self.HOURS_PATTERN, value):
            raise serializers.ValidationError('Use o formato 09:00-19:00 (ou 09:00-13:00, 14:30-19:00). Deixe vazio se estiver fechado.')
        return value.strip()

    def validate_weekday_hours(self, value):
        return self._validate_hours(value)

    def validate_saturday_hours(self, value):
        return self._validate_hours(value)

    def validate_sunday_hours(self, value):
        return self._validate_hours(value)


class AdminMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messages
        fields = ['id', 'sender_name', 'sender_email', 'sender_phone_number', 'subject', 'body', 'is_read', 'created_at']
        read_only_fields = ['sender_name', 'sender_email', 'sender_phone_number', 'subject', 'body', 'created_at']


class AttributeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=50)


class CustomerSerializer(serializers.ModelSerializer):
    purchases_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'nif', 'notes', 'purchases_count', 'created_at']
        read_only_fields = ['created_at']


class VehicleSummarySerializer(serializers.ModelSerializer):
    make = serializers.CharField(source='vehicle_data.make')
    model = serializers.CharField(source='vehicle_data.model')
    year = serializers.IntegerField(source='vehicle_data.year')
    license_plate = serializers.CharField(source='vehicle_data.license_plate')
    status = serializers.CharField(source='status.name')

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'license_plate', 'purchase_price', 'retail_price', 'status']


class VehicleServiceSerializer(serializers.ModelSerializer):
    vehicle_summary = VehicleSummarySerializer(source='vehicle', read_only=True)

    class Meta:
        model = VehicleService
        fields = ['id', 'vehicle', 'vehicle_summary', 'description', 'price', 'person', 'created_at']
        read_only_fields = ['created_at']


class SaleSerializer(serializers.ModelSerializer):
    vehicle = VehicleSummarySerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    services_total = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    profit = serializers.SerializerMethodField()

    class Meta:
        model = SoldVehicle
        fields = ['id', 'vehicle', 'customer', 'final_price', 'notes', 'services_total', 'profit', 'created_at']

    def get_profit(self, obj):
        services = obj.services_total or 0
        return str(obj.final_price - obj.vehicle.purchase_price - services)


class MarkSoldSerializer(serializers.Serializer):
    final_price = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), required=False, allow_null=True)
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    customer_nif = serializers.CharField(required=False, allow_blank=True, max_length=20)
    notes = serializers.CharField(required=False, allow_blank=True)
