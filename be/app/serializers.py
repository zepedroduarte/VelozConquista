from rest_framework import serializers
from django.db import transaction
from .models import (
    CompanySettings, Vehicle, VehicleData, Status, BodyStyle, FuelType, 
    TransmissionType, TractionType, Messages, VehicleImage
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
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Vehicle
        
        fields = [
            'purchase_price', 'retail_price', 'status_id', 'images',
            'make', 'model', 'year', 'version', 'license_plate', 'mileage', 
            'color', 'seats', 'doors', 'power', 'engine_size',
            'transmission_type_id', 'fuel_type_id', 'body_style_id', 'traction_type_id'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
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
                    is_primary=(i == 0)
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