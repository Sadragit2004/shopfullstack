# apps/order/models/managers/order_coupon.py

from django.db import models


class OrderCouponManager(models.Manager):

    def for_order(self, order):
        return self.filter(
            order=order,
        )

    def validate_coupon(
        self,
        *,
        user,
        code,
    ):
        from ..services.order_coupon import OrderCouponService

        return OrderCouponService.validate(
            user=user,
            code=code,
        )

    def create_snapshot(
        self,
        *,
        order,
        coupon,
        amount,
    ):
        from ..services.order_coupon import OrderCouponService

        return OrderCouponService.create_snapshot(
            order=order,
            coupon=coupon,
            amount=amount,
        )