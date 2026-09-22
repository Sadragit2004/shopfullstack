from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    error_response,
    success_response,
)

from ....models.services.payment_type import PaymentTypeService
from ...serializers.payment_type import PaymentTypeSerializer


class PaymentTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payment_types = PaymentTypeService.get_active_list()

        return Response(
            success_response(
                data=PaymentTypeSerializer(
                    payment_types,
                    many=True,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )


class OrderPaymentTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):

        payment_type_id = request.data.get(
            "payment_type_id",
        )

        if not payment_type_id:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_REQUIRED",
                    message="نوع پرداخت الزامی است.",
                    fields={
                        "payment_type_id": {
                            "code": "required",
                            "message": "این فیلد الزامی است.",
                        },
                    },
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = PaymentTypeService.set_order_payment_type(
            order_id=order_id,
            payment_type_id=payment_type_id,
        )

        if order is None:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_NOT_AVAILABLE",
                    message="سفارش پیدا نشد یا این نوع پرداخت فعال نیست.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            success_response(
                data={
                    "order_id": order.id,
                    "payment_type": PaymentTypeSerializer(
                        order.payment_type,
                    ).data,
                },
            ),
            status=status.HTTP_200_OK,
        )