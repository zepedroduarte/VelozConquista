from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()

router.register(r'vehicles', views.PublicVehicleViewSet, basename='vehicle-public')
router.register(r'admin/vehicles', views.AdminVehicleViewSet, basename='vehicle-admin')

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='api-login'),
    path('messages/', views.MessageCreateViewSet.as_view({'post': 'create'}), name='message-submit'),
    path('', include(router.urls)), 
]