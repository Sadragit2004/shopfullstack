# apps/order/models/order_coupon.py

from decimal import Decimal

from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models


class OrderCoupon(models.Model):

    order = models.OneToOneField(
        "order.Order",
        on_delete=models.CASCADE,
        related_name="coupon",
    )

    coupon = models.ForeignKey(
        "product.UserDiscountCoupon",
        on_delete=models.SET_NULL,
        related_name="order_coupons",
        null=True,
        blank=True,
    )

    code = models.CharField(
        max_length=50,
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0"),
            ),
            MaxValueValidator(
                Decimal("100"),
            ),
        ],
    )

    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(
                Decimal("0"),
            ),
        ],
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "order_coupons"

        verbose_name = "Order Coupon"
        verbose_name_plural = "Order Coupons"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "order",
                ],
                name="order_coupon_order_idx",
            ),
            models.Index(
                fields=[
                    "coupon",
                ],
                name="order_coupon_coupon_idx",
            ),
            models.Index(
                fields=[
                    "code",
                ],
                name="order_coupon_code_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.code} - "
            f"{self.percentage}%"
        )