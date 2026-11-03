from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views, backoffice_views
from .models import BodyStyle, FuelType, TractionType, TransmissionType
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()

router.register(r'vehicles', views.PublicVehicleViewSet, basename='vehicle-public')
router.register(r'admin/vehicles', views.AdminVehicleViewSet, basename='vehicle-admin')
router.register(r'admin/vehicle-images', views.AdminVehicleImageViewSet, basename='admin-vehicle-images')

# Back-office
router.register(r'admin/messages', backoffice_views.AdminMessageViewSet, basename='admin-messages')
router.register(r'admin/customers', backoffice_views.AdminCustomerViewSet, basename='admin-customers')
router.register(r'admin/services', backoffice_views.AdminVehicleServiceViewSet, basename='admin-services')
router.register(r'admin/sales', backoffice_views.AdminSaleViewSet, basename='admin-sales')
router.register(r'admin/attributes/fuel-types', backoffice_views.attribute_viewset(FuelType), basename='admin-fuel-types')
router.register(r'admin/attributes/transmission-types', backoffice_views.attribute_viewset(TransmissionType), basename='admin-transmission-types')
router.register(r'admin/attributes/body-styles', backoffice_views.attribute_viewset(BodyStyle), basename='admin-body-styles')
router.register(r'admin/attributes/traction-types', backoffice_views.attribute_viewset(TractionType), basename='admin-traction-types')

urlpatterns = [
    path('messages/', views.MessageCreateViewSet.as_view(), name='message-submit'),
    path('vehicle-attributes/', views.VehicleAttributesView.as_view(), name='vehicle-attributes'),
    path('company-settings/', views.CompanySettingsView.as_view(), name='company-settings'),
    path('legal-info/', backoffice_views.LegalInfoView.as_view(), name='legal-info'),
    path('admin/dashboard/', backoffice_views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/settings/company/', backoffice_views.AdminCompanySettingsView.as_view(), name='admin-company-settings'),
    path('admin/settings/legal/', backoffice_views.AdminLegalInfoView.as_view(), name='admin-legal-info'),
    path("token/", views.AdminLoginView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path('', include(router.urls)),
]
