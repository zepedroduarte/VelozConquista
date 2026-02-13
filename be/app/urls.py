from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()

router.register(r'vehicles', views.PublicVehicleViewSet, basename='vehicle-public')
router.register(r'admin/vehicles', views.AdminVehicleViewSet, basename='vehicle-admin')
router.register(r'admin/vehicle-images', views.AdminVehicleImageViewSet, basename='admin-vehicle-images')

urlpatterns = [
    path('messages/', views.MessageCreateViewSet.as_view(), name='message-submit'),
    path('vehicle-attributes/', views.VehicleAttributesView.as_view(), name='vehicle-attributes'),
    path('company-settings/', views.CompanySettingsView.as_view(), name='company-settings'),
    path("token/", views.AdminLoginView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path('', include(router.urls)), 
]