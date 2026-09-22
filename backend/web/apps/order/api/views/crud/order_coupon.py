
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)

from ....models.order_coupon import OrderCoupon
from ...serializers.order_coupon import OrderCouponSerializer


class OrderCouponListView(APIView):

    def get(self, request):
        queryset = (
            OrderCoupon.objects
            .select_related(
                "order",
                "coupon",
            )
        )

        serializer = OrderCouponSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(data=serializer.data),
            status=status.HTTP_200_OK,
        )


class OrderCouponDetailView(APIView):

    def get_object(self, pk):
        return (
            OrderCoupon.objects
            .select_related(
                "order",
                "coupon",
            )
            .filter(pk=pk)
            .first()
        )

    def get(self, request, pk):
        order_coupon = self.get_object(pk)

        if not order_coupon:
            return Response(
                error_response(
                    code="ORDER_COUPON_NOT_FOUND",
                    message="کوپن سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderCouponSerializer(order_coupon)

        return Response(
            success_response(data=serializer.data),
            status=status.HTTP_200_OK,
        )

