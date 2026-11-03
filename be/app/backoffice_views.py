"""
Back-office (CMS) API: dashboard, sales, costs, customers, messages, settings and option lists.
Everything here requires an admin (staff) user, except LegalInfoView which feeds the public About page.
"""
from decimal import Decimal

from django.db import transaction
from django.db.models import Count, DecimalField, OuterRef, ProtectedError, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from .models import (
    CompanySettings, Customer, LegalInfo, Messages, SoldVehicle, Status, Vehicle, VehicleService,
)
from .serializers import (
    AdminCompanySettingsSerializer,
    AdminMessageSerializer,
    AttributeSerializer,
    CustomerSerializer,
    LegalInfoSerializer,
    SaleSerializer,
    VehicleServiceSerializer,
    VehicleSummarySerializer,
)


class LegalInfoView(APIView):
    """Public: information shown on the About page."""
    permission_classes = [AllowAny]

    def get(self, request):
        info = LegalInfo.load()
        if not info:
            return Response(status=404)
        return Response(LegalInfoSerializer(info).data)


class SingletonAdminView(APIView):
    """GET/PATCH for a single-row settings model."""
    permission_classes = [IsAdminUser]
    serializer_class = None

    def get_object(self):
        raise NotImplementedError

    def get(self, request):
        obj = self.get_object()
        return Response(self.serializer_class(obj).data if obj else {})

    def patch(self, request):
        obj = self.get_object()
        serializer = self.serializer_class(obj, data=request.data, partial=obj is not None)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    put = patch


class AdminCompanySettingsView(SingletonAdminView):
    serializer_class = AdminCompanySettingsSerializer

    def get_object(self):
        return CompanySettings.objects.filter(pk=1).first()


class AdminLegalInfoView(SingletonAdminView):
    serializer_class = LegalInfoSerializer

    def get_object(self):
        return LegalInfo.load()


class AdminMessageViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminMessageSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Messages.objects.order_by('-created_at')
        if self.request.query_params.get('unread'):
            qs = qs.filter(is_read=False)
        return qs

    def list(self, request, *args, **kwargs):
        data = self.get_serializer(self.get_queryset()[:500], many=True).data
        return Response(data)


class AdminCustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer
    pagination_class = None
    filter_backends = [SearchFilter]
    search_fields = ['name', 'phone', 'email', 'nif']

    def get_queryset(self):
        return Customer.objects.annotate(purchases_count=Count('purchases')).order_by('-created_at')


class AdminVehicleServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = VehicleServiceSerializer
    pagination_class = None

    def get_queryset(self):
        qs = VehicleService.objects.select_related('vehicle__vehicle_data', 'vehicle__status').order_by('-created_at')
        vehicle = self.request.query_params.get('vehicle')
        if vehicle and vehicle.isdigit():
            qs = qs.filter(vehicle_id=int(vehicle))
        return qs


def sales_queryset():
    """Sales with the total spent on each vehicle (repairs, inspections, ...) annotated."""
    services_total = Subquery(
        VehicleService.objects.filter(vehicle=OuterRef('vehicle'))
        .values('vehicle').annotate(total=Sum('price')).values('total')[:1]
    )
    return (
        SoldVehicle.objects
        .select_related('vehicle__vehicle_data', 'vehicle__status', 'customer')
        .annotate(services_total=Coalesce(services_total, Value(Decimal('0')), output_field=DecimalField()))
        .order_by('-created_at')
    )


class AdminSaleViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    """List of sales. Deleting a sale puts the vehicle back in stock."""
    permission_classes = [IsAdminUser]
    serializer_class = SaleSerializer
    pagination_class = None

    def get_queryset(self):
        qs = sales_queryset()
        year = self.request.query_params.get('year')
        if year and year.isdigit():
            qs = qs.filter(created_at__year=int(year))
        return qs

    def perform_destroy(self, instance):
        with transaction.atomic():
            vehicle = instance.vehicle
            instance.delete()
            available = Status.objects.filter(name="Disponível").first()
            if available and not vehicle.sales.exists():
                vehicle.status = available
                vehicle.save(update_fields=['status'])


def attribute_viewset(model):
    """CRUD for the vehicle option lists (fuel types, gearboxes, ...)."""
    class AttributeViewSet(viewsets.ModelViewSet):
        permission_classes = [IsAdminUser]
        serializer_class = AttributeSerializer
        pagination_class = None
        queryset = model.objects.order_by('name')

        def perform_create(self, serializer):
            serializer.instance = model.objects.create(**serializer.validated_data)

        def perform_update(self, serializer):
            serializer.instance.name = serializer.validated_data['name']
            serializer.instance.save()

        def destroy(self, request, *args, **kwargs):
            try:
                return super().destroy(request, *args, **kwargs)
            except ProtectedError:
                return Response(
                    {'error': 'Não é possível apagar: existem veículos a usar esta opção.'},
                    status=400,
                )

    AttributeViewSet.__name__ = f"{model.__name__}AttributeViewSet"
    return AttributeViewSet


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.localtime()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        in_stock = Vehicle.objects.exclude(status__name="Vendido")
        stock = in_stock.aggregate(count=Count('id'), value=Sum('retail_price'), cost=Sum('purchase_price'))

        month_sales = list(sales_queryset().filter(created_at__gte=month_start))
        revenue = sum((s.final_price for s in month_sales), Decimal('0'))
        profit = sum((s.final_price - s.vehicle.purchase_price - s.services_total for s in month_sales), Decimal('0'))

        oldest = in_stock.select_related('vehicle_data', 'status').order_by('created_at')[:5]

        legal = LegalInfo.load()
        insurance = None
        if legal:
            insurance = {
                'policy_number': legal.insurance_policy_number,
                'valid_until': legal.insurance_valid_until,
                'days_left': (legal.insurance_valid_until - now.date()).days,
            }

        return Response({
            'stock_count': stock['count'] or 0,
            'stock_value': stock['value'] or 0,
            'stock_cost': stock['cost'] or 0,
            'sales_this_month': len(month_sales),
            'revenue_this_month': revenue,
            'profit_this_month': profit,
            'unread_messages': Messages.objects.filter(is_read=False).count(),
            'insurance': insurance,
            'oldest_in_stock': [
                {**VehicleSummarySerializer(v).data, 'days_in_stock': (now - v.created_at).days}
                for v in oldest
            ],
        })
