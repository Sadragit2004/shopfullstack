
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import error_response
from apps.core.api.response import success_response

from ....models.services.order_coupon import OrderCouponService
from ....api.serializers.order_coupon import CouponValidateSerializer


class CouponValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="INVALID_COUPON_DATA",
                    message="اطلاعات کد تخفیف نامعتبر است.",
                    fields=serializer.errors
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        coupon = OrderCouponService.validate(
            user=request.user,
            code=serializer.validated_data["code"]
        )

        if not coupon:
            return Response(
                error_response(
                    code="COUPON_NOT_AVAILABLE",
                    message="کد تخفیف معتبر نیست یا قابل استفاده نیست."
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            success_response(
                data={
                    "id": coupon.id,
                    "code": coupon.code,
                    "percentage": coupon.percentage,
                    "expires_at": coupon.expires_at
                }
            ),
            status=status.HTTP_200_OK
        )

