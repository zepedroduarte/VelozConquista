import django_filters
from .models import Vehicle

class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass

class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="retail_price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="retail_price", lookup_expr='lte')
    
    fuel_type = NumberInFilter(field_name="vehicle_data__fuel_type__id", lookup_expr='in')
    transmission = NumberInFilter(field_name="vehicle_data__transmission_type__id", lookup_expr='in')
    body_style = NumberInFilter(field_name="vehicle_data__body_style__id", lookup_expr='in')
    traction = NumberInFilter(field_name="vehicle_data__traction_type__id", lookup_expr='in')

    class Meta:
        model = Vehicle
        fields = ['status']