from decimal import Decimal

from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)

from ....models.order import Order
from ....models.order_detail import OrderDetail
from ...serializers.order_detail import (
    OrderDetailSerializer,
)


# ============================================================
# Order Detail List
# ============================================================

class OrderDetailListView(APIView):

    def get(self, request):

        queryset = (
            OrderDetail.objects
            .select_related(
                "order",
                "product",
                "variant",
                "product_sale",
                "pricing_tier",
            )
            .prefetch_related(
                "discount",
            )
        )

        serializer = OrderDetailSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )


# ============================================================
# Order Detail
# ============================================================

class OrderDetailView(APIView):

    def get_object(self, pk):

        return (
            OrderDetail.objects
            .select_related(
                "order",
                "product",
                "variant",
                "product_sale",
                "pricing_tier",
            )
            .prefetch_related(
                "discount",
            )
            .filter(
                pk=pk,
            )
            .first()
        )

    def get(self, request, pk):

        order_detail = self.get_object(pk)

        if not order_detail:
            return Response(
                error_response(
                    code="ORDER_DETAIL_NOT_FOUND",
                    message="جزئیات سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderDetailSerializer(
            order_detail,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )


# ============================================================
# Order
# ============================================================

class OrderView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    # ========================================================
    # GET OBJECT
    # ========================================================

    def get_object(self, request, order_id):

        try:
            order_id = int(order_id)

        except (
            TypeError,
            ValueError,
        ):
            return None, "INVALID_ORDER_ID"

        if order_id <= 0:
            return None, "INVALID_ORDER_ID"

        order = (
            Order.objects
            .select_related(
                "status",
                "logistics",
                "payment_type",
            )
            .prefetch_related(
                models.Prefetch(
                    "details",
                    queryset=(
                        OrderDetail.objects
                        .select_related(
                            "product",
                            "variant",
                            "product_sale",
                            "pricing_tier",
                        )
                        .prefetch_related(
                            "discount",
                        )
                        .order_by("id")
                    ),
                ),
            )
            .filter(
                id=order_id,
                user=request.user,
            )
            .first()
        )

        if not order:
            return None, "ORDER_NOT_FOUND"

        return order, None

    # ========================================================
    # GET
    # ========================================================

    def get(self, request, order_id):

        order, error_code = self.get_object(
            request,
            order_id,
        )

        # ====================================================
        # INVALID ID
        # ====================================================

        if error_code == "INVALID_ORDER_ID":

            return Response(
                error_response(
                    code="INVALID_ORDER_ID",
                    message="شناسه سفارش معتبر نیست.",
                    fields={
                        "order_id": {
                            "code": "invalid",
                            "message": (
                                "شناسه سفارش باید عددی "
                                "و بزرگ‌تر از صفر باشد."
                            ),
                        },
                    },
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ====================================================
        # NOT FOUND / NOT OWNER
        # ====================================================

        if error_code == "ORDER_NOT_FOUND":

            return Response(
                error_response(
                    code="ORDER_NOT_FOUND",
                    message="سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        # ====================================================
        # DETAILS
        # ====================================================

        details = order.details.all()

        details_serializer = OrderDetailSerializer(
            details,
            many=True,
        )

        # ====================================================
        # PRICING
        # ====================================================

        subtotal_price = (
            order.subtotal_price
            or Decimal("0")
        )

        product_discount_amount = (
            order.product_discount_amount
            or Decimal("0")
        )

        coupon_discount_amount = (
            order.coupon_discount_amount
            or Decimal("0")
        )

        shipping_price = (
            order.shipping_price
            or Decimal("0")
        )

        discount_percent = (
            order.discount_percent
            or Decimal("0")
        )

        total_price = (
            order.total_price
            or Decimal("0")
        )

        total_discount_amount = (
            product_discount_amount
            + coupon_discount_amount
        )

        # ====================================================
        # STATUS
        # ====================================================

        status_data = None

        if order.status_id:

            status_object = order.status

            status_data = {
                "id": status_object.id,
                "value": getattr(
                    status_object,
                    "value",
                    None,
                ),
                "name": getattr(
                    status_object,
                    "name",
                    str(status_object),
                ),
            }

        # ====================================================
        # LOGISTICS
        # ====================================================

        logistics_data = None

        if order.logistics_id:

            logistics = order.logistics

            logistics_data = {
                "id": logistics.id,
                "title": logistics.title,
                "type": logistics.type,
                "price": logistics.price,
            }

        # ====================================================
        # PAYMENT TYPE
        # ====================================================

        payment_type_data = None

        if order.payment_type_id:

            payment_type = order.payment_type

            payment_type_data = {
                "id": payment_type.id,
                "value": getattr(
                    payment_type,
                    "value",
                    None,
                ),
                "name": getattr(
                    payment_type,
                    "name",
                    str(payment_type),
                ),
            }

        # ====================================================
        # RESPONSE
        # ====================================================

        data = {
            "id": order.id,

            "uuid": str(
                order.uuid,
            ),

            "status": status_data,

            "logistics": logistics_data,

            "payment_type": payment_type_data,

            "pricing": {
                "subtotal_price": subtotal_price,

                "product_discount_amount": (
                    product_discount_amount
                ),

                "coupon_discount_amount": (
                    coupon_discount_amount
                ),

                "total_discount_amount": (
                    total_discount_amount
                ),

                "shipping_price": shipping_price,

                "discount_percent": (
                    discount_percent
                ),

                "total_price": total_price,
            },

            "details": details_serializer.data,

            "created_at": order.created_at,

            "updated_at": order.updated_at,
        }

        return Response(
            success_response(
                data=data,
            ),
            status=status.HTTP_200_OK,
        )