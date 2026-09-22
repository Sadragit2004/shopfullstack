from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    error_response,
    success_response,
)

from ....models.services.order import OrderService
from ....models.services.order_status import OrderStatusService

from ...serializers.create_order import CreateOrderSerializer
from ...serializers.order import OrderSerializer


class CreateOrderView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        # =====================================================
        # Validate Request
        # =====================================================

        serializer = CreateOrderSerializer(
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="INVALID_ORDER_DATA",
                    message="اطلاعات سفارش نامعتبر است.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        # =====================================================
        # Initial Order Status
        # =====================================================

        order_status = OrderStatusService.get_active_by_code(
            code="pending",
        )

        if not order_status:
            return Response(
                error_response(
                    code="ORDER_STATUS_NOT_FOUND",
                    message="وضعیت اولیه سفارش در سیستم تعریف نشده است.",
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # =====================================================
        # Create Order
        # =====================================================

        try:

            order = OrderService.create_order(
                user=request.user,
                items=data["items"],
                logistics=None,
                payment_type=None,
                status=order_status,
                coupon=None,
            )

        except ValueError as exc:

            error_code = str(exc)

            messages = {
                "ORDER_ITEMS_REQUIRED": (
                    "حداقل یک محصول برای ثبت سفارش لازم است."
                ),

                "PRODUCT_SALE_NOT_FOUND": (
                    "یکی از محصولات انتخاب‌شده دیگر در دسترس نیست."
                ),

                "INVALID_QUANTITY": (
                    "تعداد یکی از محصولات نامعتبر است."
                ),

                "INSUFFICIENT_STOCK": (
                    "موجودی یکی از محصولات کافی نیست."
                ),

                "ORDER_STATUS_NOT_AVAILABLE": (
                    "وضعیت سفارش معتبر نیست."
                ),
            }

            return Response(
                error_response(
                    code=error_code,
                    message=messages.get(
                        error_code,
                        "ثبت سفارش انجام نشد.",
                    ),
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # Response
        # =====================================================

        return Response(
            success_response(
                data=OrderSerializer(
                    order,
                ).data,
            ),
            status=status.HTTP_201_CREATED,
        )