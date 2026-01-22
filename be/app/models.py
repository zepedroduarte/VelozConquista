import os
import cloudinary.api
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_delete
from .utils import vehicle_image_upload_path
from django.utils.text import slugify

class CompanySettings(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.CharField(max_length=200)
    
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)

    logo = models.ImageField(upload_to='company/', blank=True, null=True)
    class Meta:
        verbose_name = "Definições da Empresa"
        verbose_name_plural = "Definições da Empresa"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1
        super(CompanySettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class BodyStyle(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name


class FuelType(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class TransmissionType(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    
class TractionType(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Status(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name


class VehicleData(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    version = models.CharField(max_length=100, null=True, blank=True)
    year = models.IntegerField()

    transmission_type = models.ForeignKey(TransmissionType, on_delete=models.PROTECT)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    body_style = models.ForeignKey(BodyStyle, on_delete=models.PROTECT)
    traction_type = models.ForeignKey(TractionType, on_delete=models.PROTECT)

    license_plate = models.CharField(max_length=50)
    mileage = models.DecimalField(max_digits=18, decimal_places=2)
    color = models.CharField(max_length=50)
    seats = models.IntegerField()
    doors = models.IntegerField()
    power = models.DecimalField(max_digits=18, decimal_places=2)
    engine_size = models.DecimalField(max_digits=18, decimal_places=2)


class Vehicle(models.Model):
    vehicle_data = models.ForeignKey(VehicleData, on_delete=models.CASCADE)
    purchase_price = models.DecimalField(max_digits=18, decimal_places=2)
    retail_price = models.DecimalField(max_digits=18, decimal_places=2)
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)


class VehicleImage(models.Model):
    vehicle_data = models.ForeignKey(VehicleData, on_delete=models.CASCADE, related_name='images' )
    image = models.ImageField(upload_to=vehicle_image_upload_path)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.vehicle_data.license_plate}"

class Customer(models.Model):
    name = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.TextField()
    adress = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class SoldVehicle(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    final_price = models.DecimalField(max_digits=18, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


class VehicleService(models.Model):
    description = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=18, decimal_places=2)
    person = models.CharField(max_length=100, null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Logs(models.Model):
    log_date = models.DateTimeField()
    log_type = models.CharField(max_length=50)
    message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Messages(models.Model):
    sender_name = models.CharField(max_length=100)
    sender_email = models.CharField(max_length=100)
    sender_phone_number = models.CharField(max_length=15, null=True, blank=True)
    message_date = models.DateTimeField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
            
@receiver(post_delete, sender=VehicleData)
def delete_cloudinary_folder(sender, instance, **kwargs):
    safe_make = slugify(instance.make)
    safe_model = slugify(instance.model)
    safe_plate = slugify(instance.license_plate)
    folder_path = f"media/vehicles/{safe_make}-{safe_model}-{safe_plate}"

    print(f"🗑️ A tentar apagar pasta no Cloudinary: {folder_path}")

    try:
        cloudinary.api.delete_resources_by_prefix(folder_path)
        cloudinary.api.delete_folder(folder_path)
        print(f"✅ Pasta {folder_path} apagada com sucesso!")
        
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível apagar a pasta {folder_path}. Erro: {e}")           
            
            
            