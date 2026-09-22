
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)

from ....models.order_discount import OrderDiscount
from ...serializers.order_discount import OrderDiscountSerializer


class OrderDiscountListView(APIView):

    def get(self, request):
        queryset = (
            OrderDiscount.objects
            .select_related(
                "order_detail",
                "product_discount",
            )
        )

        serializer = OrderDiscountSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(data=serializer.data),
            status=status.HTTP_200_OK,
        )


class OrderDiscountDetailView(APIView):

    def get_object(self, pk):
        return (
            OrderDiscount.objects
            .select_related(
                "order_detail",
                "product_discount",
            )
            .filter(pk=pk)
            .first()
        )

    def get(self, request, pk):
        discount = self.get_object(pk)

        if not discount:
            return Response(
                error_response(
                    code="ORDER_DISCOUNT_NOT_FOUND",
                    message="تخفیف سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderDiscountSerializer(discount)

        return Response(
            success_response(data=serializer.data),
            status=status.HTTP_200_OK,
        )

