# apps/order/models/order_discount.py

from decimal import Decimal

from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models


class OrderDiscount(models.Model):

    order_detail = models.OneToOneField(
        "order.OrderDetail",
        on_delete=models.CASCADE,
        related_name="discount",
    )

    product_discount = models.ForeignKey(
        "product.ProductDiscount",
        on_delete=models.SET_NULL,
        related_name="order_discounts",
        null=True,
        blank=True,
    )

    name = models.CharField(
        max_length=150,
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
        db_table = "order_discounts"

        verbose_name = "Order Discount"
        verbose_name_plural = "Order Discounts"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "order_detail",
                ],
                name="order_discount_detail_idx",
            ),
            models.Index(
                fields=[
                    "product_discount",
                ],
                name="order_discount_product_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.name} - "
            f"{self.percentage}%"
        )