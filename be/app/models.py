from django.db import models
from .utils import vehicle_image_upload_path


class BodyStyle(models.Model):
    name = models.CharField(max_length=50)


class FuelType(models.Model):
    name = models.CharField(max_length=50)


class TransmissionType(models.Model):
    name = models.CharField(max_length=50)


class Status(models.Model):
    description = models.CharField(max_length=50)


class VehicleData(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    version = models.CharField(max_length=100, null=True, blank=True)

    transmission_type = models.ForeignKey(TransmissionType, on_delete=models.PROTECT)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    body_style = models.ForeignKey(BodyStyle, on_delete=models.PROTECT)

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
    vehicle_data = models.ForeignKey(VehicleData, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=vehicle_image_upload_path)

    def __str__(self):
        return self.image.url


class VehicleImageLink(models.Model):
    vehicle_data = models.ForeignKey(VehicleData, on_delete=models.CASCADE)
    vehicle_image = models.ForeignKey(VehicleImage, on_delete=models.CASCADE)
    is_primary = models.BooleanField(null=True, blank=True)


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
