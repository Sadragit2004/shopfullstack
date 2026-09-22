
from django.db import transaction
from django.utils import timezone

from ..order_coupon import OrderCoupon


class OrderCouponService:

    @staticmethod
    def validate(
        *,
        user,
        code
    ):
        from apps.product.models import UserDiscountCoupon

        return (
            UserDiscountCoupon.objects
            .filter(
                user=user,
                code=code,
                is_active=True,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            .first()
        )

    @staticmethod
    def get_available_for_user(
        *,
        user,
        coupon_id
    ):
        from apps.product.models import UserDiscountCoupon

        return (
            UserDiscountCoupon.objects
            .filter(
                id=coupon_id,
                user=user,
                is_active=True,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            .first()
        )

    @staticmethod
    @transaction.atomic
    def create_snapshot(
        *,
        order,
        coupon,
        amount
    ):
        return OrderCoupon.objects.create(
            order=order,
            coupon=coupon,
            code=coupon.code,
            percentage=coupon.percentage,
            amount=amount
        )
