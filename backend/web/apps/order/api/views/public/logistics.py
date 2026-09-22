
from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import (
    error_response,
    success_response,
)

from ....models.services.logistics import (
    LogisticsService,
)

from ...serializers.logistics import (
    LogisticsSerializer,
)


# =========================================================
# Logistics List
# =========================================================

class LogisticsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        logistics = (
            LogisticsService.get_active_list()
        )

        return Response(
            success_response(
                data=LogisticsSerializer(
                    logistics,
                    many=True,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )


# =========================================================
# Set Order Logistics
# =========================================================

class OrderLogisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        logistics_id = request.data.get(
            "logistics_id",
        )

        if logistics_id in (
            None,
            "",
        ):
            return Response(
                error_response(
                    code="LOGISTICS_ID_REQUIRED",
                    message="شناسه روش ارسال الزامی است.",
                    fields={
                        "logistics_id": {
                            "code": "required",
                            "message": "این فیلد الزامی است.",
                        }
                    },
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            logistics_id = int(
                logistics_id,
            )
        except (
            TypeError,
            ValueError,
        ):
            return Response(
                error_response(
                    code="INVALID_LOGISTICS_ID",
                    message="شناسه روش ارسال معتبر نیست.",
                    fields={
                        "logistics_id": {
                            "code": "invalid",
                            "message": "شناسه روش ارسال باید عددی باشد.",
                        }
                    },
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        if logistics_id <= 0:
            return Response(
                error_response(
                    code="INVALID_LOGISTICS_ID",
                    message="شناسه روش ارسال معتبر نیست.",
                    fields={
                        "logistics_id": {
                            "code": "invalid",
                            "message": "شناسه روش ارسال باید بزرگ‌تر از صفر باشد.",
                        }
                    },
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = (
            LogisticsService.set_order_logistics(
                order_id=order_id,
                logistics_id=logistics_id,
                user=request.user,
            )
        )

        if order is None:
            return Response(
                error_response(
                    code="LOGISTICS_NOT_AVAILABLE",
                    message=(
                        "سفارش پیدا نشد، "
                        "به این سفارش دسترسی ندارید، "
                        "یا روش ارسال فعال نیست."
                    ),
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            success_response(
                data={
                    "order_id": order.id,
                    "logistics": LogisticsSerializer(
                        order.logistics,
                    ).data,
                },
            ),
            status=status.HTTP_200_OK,
        )

