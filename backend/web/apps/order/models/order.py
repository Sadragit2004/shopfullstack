import uuid

from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Order(models.Model):

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
    )

    user = models.ForeignKey(
        "user.User",
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.ForeignKey(
        "order.OrderStatus",
        on_delete=models.PROTECT,
        related_name="orders",
    )

    logistics = models.ForeignKey(
        "order.Logistics",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="orders",
    )

    payment_type = models.ForeignKey(
        "order.PaymentType",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="orders",
    )

    # =========================================================
    # Pricing snapshot
    # =========================================================

    subtotal_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    product_discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    coupon_discount_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    shipping_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
            MaxValueValidator(Decimal("100")),
        ],
    )

    total_price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal("0"),
        validators=[
            MinValueValidator(Decimal("0")),
        ],
    )

    # =========================================================
    # Timestamps
    # =========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "orders"

        verbose_name = "Order"
        verbose_name_plural = "Orders"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=["user", "-created_at"],
                name="order_user_created_idx",
            ),
            models.Index(
                fields=["status", "-created_at"],
                name="order_status_created_idx",
            ),
            models.Index(
                fields=["logistics"],
                name="order_logistics_idx",
            ),
            models.Index(
                fields=["payment_type"],
                name="order_payment_type_idx",
            ),
        ]

    def __str__(self):
        return f"Order #{self.id}"