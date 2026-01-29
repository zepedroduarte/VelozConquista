from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()

router.register(r'vehicles', views.PublicVehicleViewSet, basename='vehicle-public')
router.register(r'admin/vehicles', views.AdminVehicleViewSet, basename='vehicle-admin')
router.register(r'admin/vehicle-images', views.AdminVehicleImageViewSet, basename='admin-vehicle-images')

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='api-login'),
    path('logout/', views.LogoutView.as_view(), name='api-logout'),
    path('messages/', views.MessageCreateViewSet.as_view(), name='message-submit'),
    path('vehicle-attributes/', views.VehicleAttributesView.as_view(), name='vehicle-attributes'),
    path('company-settings/', views.CompanySettingsView.as_view(), name='company-settings'),
    path('csrf/', views.CSRFPingView.as_view(), name='csrf-ping'),
    path('', include(router.urls)), 
]