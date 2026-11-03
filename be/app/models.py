import os
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_delete
from .utils import vehicle_image_upload_path
from . import images
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

    def save(self, *args, **kwargs):
        # New uploads are converted to WebP (see app/images.py) before being stored.
        optimized = None
        if self.image and not self.image._committed:
            content, optimized = images.optimize(self.image)
            self.image.save(content.name, content, save=False)

        super().save(*args, **kwargs)

        if optimized is not None:
            images.save_variants(optimized, self.image.name, self.image.storage)

class Customer(models.Model):
    name = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    email = models.TextField(blank=True)
    address = models.TextField(blank=True)
    nif = models.CharField("NIF", max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cliente"

    def __str__(self):
        return self.name


class SoldVehicle(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='sales')
    # SET_NULL: apagar um cliente nunca apaga o registo da venda
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchases')
    final_price = models.DecimalField(max_digits=18, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Venda"


class VehicleService(models.Model):
    description = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=18, decimal_places=2)
    person = models.CharField(max_length=100, null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='services')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Serviço / Custo"


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
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mensagem"


class LegalInfo(models.Model):
    """
    Informação legal da página "Sobre" (intermediário de crédito e seguro de RC profissional).
    Singleton editável no back-office: a apólice muda de 3 em 3 meses.
    """
    legal_name = models.CharField("Denominação social", max_length=200)
    credit_intermediary_number = models.CharField("N.º de registo de intermediário de crédito", max_length=50)
    lenders = models.TextField("Mutuantes com contrato de vinculação", help_text="Um por linha")
    services = models.TextField("Serviços de intermediação de crédito", help_text="Um por linha")

    insurer = models.CharField("Seguradora", max_length=200)
    insurance_policy_number = models.CharField("N.º da apólice", max_length=100)
    insurance_valid_from = models.DateField("Apólice válida de")
    insurance_valid_until = models.DateField("Apólice válida até")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Informação Legal / Página Sobre"
        verbose_name_plural = "Informação Legal / Página Sobre"

    def __str__(self):
        return self.legal_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        return cls.objects.filter(pk=1).first()
            
@receiver(post_delete, sender=VehicleData)
def delete_storage_folder(sender, instance, **kwargs):
    """Delete all blobs under the vehicle's folder when VehicleData is deleted."""
    safe_make = slugify(instance.make)
    safe_model = slugify(instance.model)
    safe_plate = slugify(instance.license_plate)
    folder_prefix = f"vehicles/{safe_make}-{safe_model}-{safe_plate}"

    print(f"🗑️ A tentar apagar pasta no storage: {folder_prefix}")

    try:
        from django.core.files.storage import default_storage

        # List and delete all blobs with the given prefix
        dirs, files = default_storage.listdir(folder_prefix)
        for filename in files:
            file_path = f"{folder_prefix}/{filename}"
            default_storage.delete(file_path)
            print(f"  🗑️ Apagado: {file_path}")

        print(f"✅ Pasta {folder_prefix} apagada com sucesso!")

    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível apagar a pasta {folder_prefix}. Erro: {e}")

            

@receiver(post_delete, sender=VehicleImage)
def delete_image_variants(sender, instance, **kwargs):
    """django_cleanup removes the main file; this removes the -w480/-w960 versions."""
    if instance.image:
        images.delete_variants(instance.image.name, instance.image.storage)
