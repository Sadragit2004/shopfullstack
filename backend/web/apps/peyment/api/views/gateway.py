from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.order.models import Order
from apps.order.models.services.order import OrderService
from apps.peyment.models.service.gateway import GatewayService
from apps.peyment.api.serializers import (
    PeymentSerializer,
    PeymentCreateSerializer,
)
from apps.core.api.response import success_response, error_response


class GatewayCreateView(APIView):
    """ایجاد پرداخت درگاه"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PeymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                error_response(
                    code='validation_error',
                    message='داده‌های ورودی نامعتبر است',
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        order = Order.objects.filter(id=data['order_id']).first()

        if not order:
            return Response(
                error_response(
                    code='order_not_found',
                    message='سفارش یافت نشد',
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.user_id != request.user.id:
            return Response(
                error_response(
                    code='forbidden',
                    message='دسترسی ندارید',
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        # بررسی کامل قابل پرداخت بودن و نبود پرداخت در انتظار
        is_valid, error_code = OrderService.can_create_payment(order)
        if not is_valid:
            return Response(
                error_response(
                    code=error_code.lower(),
                    message='امکان ایجاد پرداخت برای این سفارش وجود ندارد',
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # مبلغ به ریال برای درگاه
        amount_rial = OrderService.get_payable_amount_rial(order)

        peyment = GatewayService.create_peyment(
            order=order,
            customer=request.user,
            amount=amount_rial,
            description=data.get('description'),
        )

        return Response(
            success_response(PeymentSerializer(peyment).data),
            status=status.HTTP_201_CREATED,
        )