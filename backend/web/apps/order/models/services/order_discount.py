
from django.db import transaction

from ..order_discount import OrderDiscount


class OrderDiscountService:

    @staticmethod
    @transaction.atomic
    def create_snapshot(
        *,
        order_detail,
        product_discount,
        amount,
    ):
        return OrderDiscount.objects.create(
            order_detail=order_detail,
            product_discount=product_discount,
            name=product_discount.name,
            percentage=product_discount.percentage,
            amount=amount,
        )

