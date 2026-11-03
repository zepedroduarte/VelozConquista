"""
Django admin (/admin/ no backend) como alternativa de emergência ao back-office do site.
"""
from django.contrib import admin

from .models import (
    BodyStyle, CompanySettings, Customer, FuelType, LegalInfo, Messages, SoldVehicle, Status,
    TractionType, TransmissionType, Vehicle, VehicleData, VehicleImage, VehicleService,
)

admin.site.site_header = "Veloz Conquista — Administração"

for model in (BodyStyle, FuelType, TransmissionType, TractionType, Status):
    admin.site.register(model)


@admin.register(CompanySettings, LegalInfo)
class SingletonAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 0


@admin.register(VehicleData)
class VehicleDataAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'year', 'license_plate')
    search_fields = ('make', 'model', 'license_plate')
    inlines = [VehicleImageInline]


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle_data', 'status', 'retail_price', 'created_at')
    list_filter = ('status',)
    list_select_related = ('vehicle_data', 'status')


@admin.register(SoldVehicle)
class SoldVehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'customer', 'final_price', 'created_at')
    list_select_related = ('vehicle__vehicle_data', 'customer')


@admin.register(VehicleService)
class VehicleServiceAdmin(admin.ModelAdmin):
    list_display = ('description', 'vehicle', 'price', 'person', 'created_at')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'nif', 'created_at')
    search_fields = ('name', 'phone', 'email', 'nif')


@admin.register(Messages)
class MessagesAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read',)
