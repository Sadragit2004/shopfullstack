# apps/order/models/managers/order_discount.py

from django.db import models


class OrderDiscountManager(models.Manager):

    def for_order(self, order):
        return self.filter(
            order_detail__order=order,
        )

    def for_detail(self, order_detail):
        return self.filter(
            order_detail=order_detail,
        )

    def create_snapshot(
        self,
        *,
        order_detail,
        product_discount,
        amount,
    ):
        from ..services.order_discount import OrderDiscountService

        return OrderDiscountService.create_snapshot(
            order_detail=order_detail,
            product_discount=product_discount,
            amount=amount,
        )