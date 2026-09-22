
from django.core.exceptions import ValidationError

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    success_response,
    error_response,
)

from ....models.services.order_address import (
    OrderAddressService,
)


class OrderAddressView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    # ============================================================
    # Set Order Address
    # POST /api/v1/order/<order_id>/address/
    # ============================================================

    def post(
        self,
        request,
        order_id,
    ):
        user_address_id = request.data.get(
            "user_address_id"
        )

        # --------------------------------------------------------
        # Validation
        # --------------------------------------------------------

        if not user_address_id:
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="آدرس را انتخاب کنید.",
                    fields={
                        "user_address_id": [
                            "این فیلد الزامی است."
                        ]
                    },
                ),
                status=400,
            )

        # --------------------------------------------------------
        # Service
        # --------------------------------------------------------

        try:
            order_address, created = (
                OrderAddressService.set_order_address(
                    order_id=order_id,
                    user=request.user,
                    user_address_id=user_address_id,
                )
            )

        except ValidationError as exc:
            return Response(
                error_response(
                    code="INVALID_ORDER_ADDRESS",
                    message=str(exc),
                ),
                status=400,
            )

        # --------------------------------------------------------
        # Response
        # --------------------------------------------------------

        return Response(
            success_response(
                {
                    "order_id": order_address.order_id,
                    "user_address_id": (
                        order_address.user_address_id
                    ),
                }
            ),
            status=201 if created else 200,
        )

