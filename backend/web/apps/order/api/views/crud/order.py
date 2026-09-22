from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)


from ...serializers.order import OrderSerializer
from ....models import Order


class OrderListView(APIView):

    def get(self, request):
        queryset = (
            Order.objects
            .select_related(
                "user",
                "status",
                "logistics",
                "payment_type",
            )
            .prefetch_related(
                "details",
                "coupon",
            )
        )

        serializer = OrderSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )


class OrderDetailView(APIView):

    def get_object(self, pk):
        return (
            Order.objects
            .select_related(
                "user",
                "status",
                "logistics",
                "payment_type",
            )
            .prefetch_related(
                "details",
                "coupon",
            )
            .filter(
                pk=pk,
            )
            .first()
        )

    def get(self, request, pk):
        order = self.get_object(pk)

        if not order:
            return Response(
                error_response(
                    code="ORDER_NOT_FOUND",
                    message="سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            success_response(
                data=OrderSerializer(
                    order,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )
