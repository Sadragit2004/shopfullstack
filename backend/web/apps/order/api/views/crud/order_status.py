from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)

from ...serializers.order_status import OrderStatusSerializer
from ....models import OrderStatus


class OrderStatusListCreateView(APIView):

    def get(self, request):
        queryset = OrderStatus.objects.all()

        serializer = OrderStatusSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = OrderStatusSerializer(
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_status = OrderStatus.objects.create_status(
            code=serializer.validated_data["code"],
            title=serializer.validated_data["title"],
            is_active=serializer.validated_data.get(
                "is_active",
                True,
            ),
        )

        return Response(
            success_response(
                data=OrderStatusSerializer(
                    order_status,
                ).data,
            ),
            status=status.HTTP_201_CREATED,
        )


class OrderStatusDetailView(APIView):

    def get_object(self, pk):
        return OrderStatus.objects.filter(
            pk=pk,
        ).first()

    def get(self, request, pk):
        order_status = self.get_object(pk)

        if not order_status:
            return Response(
                error_response(
                    code="ORDER_STATUS_NOT_FOUND",
                    message="وضعیت سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusSerializer(
            order_status,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        order_status = self.get_object(pk)

        if not order_status:
            return Response(
                error_response(
                    code="ORDER_STATUS_NOT_FOUND",
                    message="وضعیت سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusSerializer(
            order_status,
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_status = serializer.save()

        return Response(
            success_response(
                data=OrderStatusSerializer(
                    order_status,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        order_status = self.get_object(pk)

        if not order_status:
            return Response(
                error_response(
                    code="ORDER_STATUS_NOT_FOUND",
                    message="وضعیت سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusSerializer(
            order_status,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_status = serializer.save()

        return Response(
            success_response(
                data=OrderStatusSerializer(
                    order_status,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        order_status = self.get_object(pk)

        if not order_status:
            return Response(
                error_response(
                    code="ORDER_STATUS_NOT_FOUND",
                    message="وضعیت سفارش پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        order_status.delete()

        return Response(
            success_response(),
            status=status.HTTP_200_OK,
        )