from rest_framework import serializers
from django.db import transaction
from .models import (
    Vehicle, VehicleData, Status, BodyStyle, FuelType, 
    TransmissionType, TractionType, Messages, VehicleImage
)

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'description']

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

# --- Imagens ---
class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'is_primary']  

# --- Leitura (Public & Admin Display) ---
class VehicleDataSerializer(serializers.ModelSerializer):
    body_style = BodyStyleSerializer(read_only=True)
    fuel_type = FuelTypeSerializer(read_only=True)
    transmission_type = TransmissionTypeSerializer(read_only=True)
    traction_type = TractionTypeSerializer(read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True) 

    class Meta:
        model = VehicleData
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    vehicle_data = VehicleDataSerializer(read_only=True)
    status = StatusSerializer(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_data', 'retail_price', 'status', 'created_at']

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

class AdminVehicleDataInputSerializer(serializers.ModelSerializer):
    body_style_id = serializers.PrimaryKeyRelatedField(queryset=BodyStyle.objects.all(), source='body_style')
    fuel_type_id = serializers.PrimaryKeyRelatedField(queryset=FuelType.objects.all(), source='fuel_type')
    transmission_type_id = serializers.PrimaryKeyRelatedField(queryset=TransmissionType.objects.all(), source='transmission_type')
    traction_type_id = serializers.PrimaryKeyRelatedField(queryset=TractionType.objects.all(), source='traction_type')

    class Meta:
        model = VehicleData
        fields = [
            'make', 'model', 'version', 'license_plate', 'mileage', 'color', 
            'seats', 'doors', 'power', 'engine_size', 
            'body_style_id', 'fuel_type_id', 'transmission_type_id', 'traction_type_id'
        ]

class AdminVehicleCreateSerializer(serializers.ModelSerializer):
    vehicle_data = AdminVehicleDataInputSerializer()
    status_id = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), source='status')
    
    images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Vehicle
        fields = ['vehicle_data', 'purchase_price', 'retail_price', 'status_id', 'images']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        vehicle_data_data = validated_data.pop('vehicle_data')
        
        with transaction.atomic():
            vehicle_data_instance = VehicleData.objects.create(**vehicle_data_data)
            
            vehicle_instance = Vehicle.objects.create(
                vehicle_data=vehicle_data_instance,
                **validated_data
            )
            
            img_objects = [
                VehicleImage(vehicle_data=vehicle_data_instance, image=img) 
                for img in images_data
            ]
            VehicleImage.objects.bulk_create(img_objects) 
                
        return vehicle_instance

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messages
        fields = ['sender_name', 'sender_email', 'sender_phone_number', 'subject', 'body']