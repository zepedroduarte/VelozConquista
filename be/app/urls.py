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
    path('messages/', views.MessageCreateViewSet.as_view({'post': 'create'}), name='message-submit'),
    path('vehicle-attributes/', views.VehicleAttributesView.as_view(), name='vehicle-attributes'),
    path('', include(router.urls)), 
]